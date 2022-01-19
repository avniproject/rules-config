import _ from 'lodash';
import {Condition, Rule, Action, CompoundRule} from "./index";

const getViewFilterRuleTemplate = (entityName) =>
    `'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const formElement = params.formElement;
  let visibility = true;
  let value = null;
  let answersToSkip = [];
  let validationErrors = [];
  $RULE_CONDITIONS
  $OTHER_CONDITIONS
  return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, value, answersToSkip, validationErrors);
};`;

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
        const declarativeRule = new DeclarativeRule().getInitialState();
        declarativeRule.conditions = _.map(_.get(json, 'conditions'), condition => Condition.fromResource(condition));
        declarativeRule.actions = _.map(_.get(json, 'actions'), action => Action.fromResource(action));
        return declarativeRule;
    }

    getInitialState() {
        this.addCondition(new Condition().getInitialCondition());
        const action = new Action();
        this.addAction(action);
        return this;
    }

    addCondition(condition) {
        this.conditions.push(condition);
    }

    addAction(action) {
        this.actions.push(action);
    }

    clone() {
        const declarativeRule = new DeclarativeRule();
        declarativeRule.conditions = _.map(this.conditions, condition => condition.clone());
        declarativeRule.actions = _.map(this.actions, action => action.clone());
        return declarativeRule;
    }

    getRuleSummary() {
        const actionSummary = _.map(_.reject(this.actions, action => _.isEmpty(action.actionType)),
            action => action.getSummary());
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

    getViewFilterRule(entityName) {
        const baseRuleCondition = `new imports.rulesConfig.RuleCondition({${entityName}, formElement}).$RULE_CONDITION`;
        const constructOtherCondition = (condition, action) => `if(${condition}) ${action} \n`;
        let ruleConditions = '';
        let visibilityConditions = [];
        let otherConditions = '';
        const baseRule = getViewFilterRuleTemplate(entityName);
        _.forEach(this.conditions, ({compoundRule, conjunction}, index) => {
            const conditionName = `condition${index + 1}`;
            const operator = (index + 1) < _.size(this.conditions) ? DeclarativeRule.conjunctionToBooleanOperator[conjunction] : '';
            visibilityConditions.push(`${conditionName} ${operator}`);
            const ruleCondition = baseRuleCondition.replace('$RULE_CONDITION', compoundRule.getJSCode());
            ruleConditions += `const ${conditionName} = ${ruleCondition};\n`;
        });
        _.forEach(this.actions, (action) => {
            const actionTypes = Action.actionTypes;
            const visibilityCondition = visibilityConditions.join(' ');
            switch (action.actionType) {
                case actionTypes.ShowFormElement:
                    otherConditions += `visibility = ${visibilityCondition};\n`;
                    break;
                case actionTypes.HideFormElement:
                    otherConditions += `visibility = !(${visibilityCondition});\n`;
                    break;
                case actionTypes.Value:
                    otherConditions += constructOtherCondition(visibilityCondition, `value = ${action.getJsValue()};\n`);
                    break;
                case actionTypes.SkipAnswers:
                    otherConditions += constructOtherCondition(visibilityCondition, `answersToSkip.push(${action.getJsAnswersToSkip()});\n`);
                    break;
                case actionTypes.ValidationError:
                    otherConditions += constructOtherCondition(visibilityCondition, `validationErrors.push("${action.validationError}");\n`);
                    break;
            }
        });
        return baseRule
            .replace('$RULE_CONDITIONS', ruleConditions)
            .replace('$OTHER_CONDITIONS', otherConditions);
    }

}

export default DeclarativeRule;
