import _ from 'lodash';
import {Condition, Rule, Action, CompoundRule, VisitScheduleActionDetails} from "./index";

const constructSkipAnsCondition = (condition, ...answers) =>
    `if(${condition}) {
    _.forEach([${answers}], (answer) => {
        const answerToSkip = formElement.getAnswerWithConceptUuid(answer);
        if (answerToSkip) answersToSkip.push(answerToSkip);
    });
};\n  `;

class DeclarativeRule {
    static conjunctionToBooleanOperator = {
        'and': '&&',
        'or': '||'
    };

    constructor() {
        this.conditions = [];
        this.actions = [];
    }

    static fromResource(json) {
        const declarativeRule = DeclarativeRule.getInitialState();
        declarativeRule.conditions = _.map(_.get(json, 'conditions'), condition => Condition.fromResource(condition));
        declarativeRule.actions = _.map(_.get(json, 'actions'), action => Action.fromResource(action));
        return declarativeRule;
    }

    static getInitialState() {
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(new Condition().getInitialCondition());
        const action = new Action();
        declarativeRule.addAction(action);
        return declarativeRule;
    }

    addCondition(condition) {
        this.conditions.push(condition);
    }

    addAction(action) {
        this.actions.push(action);
    }

    containActionType(...type) {
        return _.some(this.actions, ({actionType}) => _.includes(type, actionType));
    }

    clone() {
        const declarativeRule = new DeclarativeRule();
        declarativeRule.conditions = _.map(this.conditions, condition => condition.clone());
        declarativeRule.actions = _.map(this.actions, action => action.clone());
        return declarativeRule;
    }

    isEmpty() {
        return _.chain(this)
            .get('conditions[0].compoundRule.rules[0].lhs.type')
            .isEmpty()
            .value();
    }

    validate() {
        _.forEach(this.conditions, condition => condition.validate());
        const actions = this.actions;
        if (_.size(this.actions) > 1) {
            actions.pop() //another action is auto assigned when last one is filled.
        }
        _.forEach(actions, action => action.validate());
    }

    getRuleSummary() {
        const actionSummary = _.map(_.reject(this.actions, action => _.isEmpty(action.actionType)),
            action => action.getRuleSummary());
        const ruleSummary = [];
        const conjunctions = [];
        _.forEach(this.conditions, ({compoundRule, conjunction}, index) => {
            if (index + 1 < _.size(this.conditions)) {
                conjunctions.push(conjunction);
            }
            ruleSummary.push(compoundRule.getRuleSummary());
        });
        return {actionSummary, ruleSummary, conjunctions};
    }

    getRuleConditions(entityName, conditionAppender = '', ignoreFormElementInContext) {
        const context = ignoreFormElementInContext ? `{${entityName}}` : `{${entityName}, formElement}`;
        const baseRuleCondition = `new imports.rulesConfig.RuleCondition(${context}).$RULE_CONDITION`;
        const constructOtherCondition = (condition, action) => `if(${condition}){\n    ${action}  \n}\n  `;
        let ruleConditions = '';
        let matchesConditions = [];
        let actionConditions = '';
        _.forEach(this.conditions, ({compoundRule, conjunction}, index) => {
            const conditionName = `condition${index + 1}${conditionAppender}`;
            const operator = (index + 1) < _.size(this.conditions) ? DeclarativeRule.conjunctionToBooleanOperator[conjunction] : '';
            matchesConditions.push(`${conditionName} ${operator}`);
            const ruleCondition = baseRuleCondition.replace('$RULE_CONDITION', compoundRule.getJSCode());
            ruleConditions += `const ${conditionName} = ${ruleCondition};\n  `;
        });
        _.forEach(this.actions, (action) => {
            const actionTypes = Action.actionTypes;
            const matchesCondition = matchesConditions.join(' ');
            switch (action.actionType) {
                case actionTypes.ShowFormElement:
                case actionTypes.ShowFormElementGroup:
                    actionConditions += `visibility = ${matchesCondition};\n  `;
                    break;
                case actionTypes.HideFormElement:
                case actionTypes.HideFormElementGroup:
                    actionConditions += `visibility = !(${matchesCondition});\n  `;
                    break;
                case actionTypes.Value:
                    actionConditions += constructOtherCondition(matchesCondition, `value = ${action.getJsValue()};`);
                    break;
                case actionTypes.SkipAnswers:
                    actionConditions += constructSkipAnsCondition(matchesCondition, action.getJsAnswerUUIDsToSkip());
                    break;
                case actionTypes.ValidationError:
                    actionConditions += constructOtherCondition(matchesCondition, `validationErrors.push("${_.get(action, 'details.validationError')}");`);
                    break;
                case actionTypes.ShowEncounterType:
                case actionTypes.ShowProgram:
                    actionConditions += `eligibility = ${matchesCondition};\n  `;
                    break;
                case actionTypes.FormValidationError:
                    actionConditions += constructOtherCondition(matchesCondition, `validationResults.push(imports.common.createValidationError("${_.get(action, 'details.validationError')}"));`);
                    break;
                case actionTypes.AddDecision: {
                    const actionDetails = _.get(action, 'details');
                    actionConditions += constructOtherCondition(matchesCondition, `${actionDetails.scope}Decisions.push({name: "${actionDetails.conceptName}", value: ${actionDetails.getJsValue()}});`);
                    break;
                }
                case actionTypes.ScheduleVisit:
                    actionConditions += constructOtherCondition(matchesCondition, VisitScheduleActionDetails.buildVisitScheduleAction(_.get(action, 'details'), entityName));
                    break;
            }
        });
        return {ruleConditions, actionConditions};
    }

}

export default DeclarativeRule;
