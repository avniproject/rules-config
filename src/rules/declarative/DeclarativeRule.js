import _ from 'lodash';
import Action from "./Action";

class DeclarativeRule {
    static conjunctionToBooleanOperator = {
        'and': '&&',
        'or': '||'
    };

    constructor() {
        this.conditions = [];
        this.actions = [];
    }

    withCondition(condition) {
        this.conditions.push(condition);
        return this;
    }

    withAction(action) {
        this.actions.push(action);
        return this;
    }

    getViewFilterRule(entityName) {
        const baseRuleCondition = `new imports.rulesConfig.RuleCondition({${entityName}, formElement}).$RULE_CONDITION`;
        const constructOtherCondition = (condition, action) => `if(${condition}) ${action} \n          `;
        let ruleConditions = '';
        let visibilityConditions = [];
        let otherConditions = '';
        const baseRule = `
        'use strict';
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
        _.forEach(this.conditions, ({compoundRule, conjunction}, index) => {
            const conditionName = `condition${index + 1}`;
            const operator = DeclarativeRule.conjunctionToBooleanOperator[conjunction] || '';
            visibilityConditions.push(`${conditionName} ${operator}`);
            const ruleCondition = baseRuleCondition.replace('$RULE_CONDITION', compoundRule.getJSCode());
            ruleConditions += `const ${conditionName} = ${ruleCondition};\n          `;
        });
        _.forEach(this.actions, (action) => {
            const actionTypes = Action.actionTypes;
            const visibilityCondition = visibilityConditions.join(' ');
            switch (action.actionType) {
                case actionTypes.ShowFormElement:
                    otherConditions += `visibility = ${visibilityCondition}`;
                    break;
                case actionTypes.HideFormElement:
                    otherConditions += `visibility = !(${visibilityCondition})`;
                    break;
                case actionTypes.Value:
                    otherConditions += constructOtherCondition(visibilityCondition, `value = ${action.getJsValue()}`);
                    break;
                case actionTypes.SkipAnswers:
                    otherConditions += constructOtherCondition(visibilityCondition, `answersToSkip.push(${action.getJsAnswersToSkip()})`);
                    break;
                case actionTypes.ValidationError:
                    otherConditions += constructOtherCondition(visibilityCondition, `validationErrors.push("${action.validationError}")`);
                    break;
            }
        });
        return baseRule
            .replace('$RULE_CONDITIONS', ruleConditions)
            .replace('$OTHER_CONDITIONS', otherConditions);
    }

}

export default DeclarativeRule;
