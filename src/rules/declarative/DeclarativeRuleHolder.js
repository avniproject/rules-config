import _ from 'lodash';
import {DeclarativeRule} from "./index";

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

class DeclarativeRuleHolder {
    constructor(declarativeRules = []) {
        this.declarativeRules = declarativeRules;
    }

    static fromResource(resources) {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        if (_.isEmpty(resources)) {
            declarativeRuleHolder.declarativeRules.push(DeclarativeRule.getInitialState());
        } else {
            declarativeRuleHolder.declarativeRules = _.map(resources.declarativeRules, r => DeclarativeRule.fromResource(r))
        }
        return declarativeRuleHolder;
    }

    generateViewFilterRule(entityName) {
        const ruleConditionArray = [];
        const otherConditionArray = [];
        _.forEach(this.declarativeRules, (declarativeRule, index) => {
            const {ruleConditions, otherConditions} = declarativeRule.getViewFilterRuleConditions(entityName, index + 1);
            ruleConditionArray.push(ruleConditions);
            otherConditionArray.push(otherConditions);
        });
        const viewFilterRuleTemplate = getViewFilterRuleTemplate(entityName);
        return viewFilterRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$OTHER_CONDITIONS', otherConditionArray.join('  '));
    }

    generateRuleSummary() {
        return this.isPartiallyEmpty() ? [] : _.map(this.declarativeRules, declarativeRule => declarativeRule.getRuleSummary())
    }

    isEmpty() {
        return _.isEmpty(_.reject(this.declarativeRules, declarativeRule => declarativeRule.isEmpty()));
    }

    isPartiallyEmpty() {
        return _.size(_.filter(this.declarativeRules, declarativeRule => declarativeRule.isEmpty())) > 0;
    }

    addEmptyDeclarativeRule() {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        declarativeRuleHolder.declarativeRules = [...this.declarativeRules, DeclarativeRule.getInitialState()];
        return declarativeRuleHolder;
    }

    deleteAtIndex(index) {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        this.declarativeRules.splice(index, 1);
        declarativeRuleHolder.declarativeRules = this.declarativeRules;
        return declarativeRuleHolder;
    }

    updateAtIndex(index, declarativeRule) {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        this.declarativeRules[index] = declarativeRule;
        declarativeRuleHolder.declarativeRules = this.declarativeRules;
        return declarativeRuleHolder;
    }

    clone() {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        declarativeRuleHolder.declarativeRules = _.map(this.declarativeRules, declarativeRule => declarativeRule.clone());
        return declarativeRuleHolder;
    }

    getDeclarativeRuleAtIndex(index) {
        return this.declarativeRules[index];
    }
}


export default DeclarativeRuleHolder;
