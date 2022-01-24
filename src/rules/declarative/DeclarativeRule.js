import _ from 'lodash';
import {Condition, Rule, Action, CompoundRule} from "./index";

const constructSkipAnsCondition = (condition, ...answers) =>
`if(${condition}) {
    _.forEach([${answers}], (answer) => {
        const answerToSkip = formElement.getAnswerWithConceptName(answer);
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

    containActionType(type) {
        return _.some(this.actions, ({actionType}) => actionType === type);
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

    getViewFilterRuleConditions(entityName, conditionAppender = '') {
        const baseRuleCondition = `new imports.rulesConfig.RuleCondition({${entityName}, formElement}).$RULE_CONDITION`;
        const constructOtherCondition = (condition, action) => `if(${condition}) ${action} \n  `;
        let ruleConditions = '';
        let visibilityConditions = [];
        let otherConditions = '';
        _.forEach(this.conditions, ({compoundRule, conjunction}, index) => {
            const conditionName = `condition${index + 1}${conditionAppender}`;
            const operator = (index + 1) < _.size(this.conditions) ? DeclarativeRule.conjunctionToBooleanOperator[conjunction] : '';
            visibilityConditions.push(`${conditionName} ${operator}`);
            const ruleCondition = baseRuleCondition.replace('$RULE_CONDITION', compoundRule.getJSCode());
            ruleConditions += `const ${conditionName} = ${ruleCondition};\n  `;
        });
        _.forEach(this.actions, (action) => {
            const actionTypes = Action.actionTypes;
            const visibilityCondition = visibilityConditions.join(' ');
            switch (action.actionType) {
                case actionTypes.ShowFormElement:
                    otherConditions += `visibility = ${visibilityCondition};\n  `;
                    break;
                case actionTypes.HideFormElement:
                    otherConditions += `visibility = !(${visibilityCondition});\n  `;
                    break;
                case actionTypes.Value:
                    otherConditions += constructOtherCondition(visibilityCondition, `value = ${action.getJsValue()};`);
                    break;
                case actionTypes.SkipAnswers:
                    otherConditions += constructSkipAnsCondition(visibilityCondition, action.getJsAnswersToSkip());
                    break;
                case actionTypes.ValidationError:
                    otherConditions += constructOtherCondition(visibilityCondition, `validationErrors.push("${action.validationError}");`);
                    break;
            }
        });
        return {ruleConditions, otherConditions};
    }

}

export default DeclarativeRule;
