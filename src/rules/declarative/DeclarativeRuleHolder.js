import _ from 'lodash';
import {Action, DeclarativeRule} from "./index";

const getViewFilterRuleTemplate = (entityName) =>
    `'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const formElement = params.formElement;
  const _ = imports.lodash;
  let visibility = true;
  let value = null;
  let answersToSkip = [];
  let validationErrors = [];
  $RULE_CONDITIONS
  $OTHER_CONDITIONS
  return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, value, answersToSkip, validationErrors);
};`;


const getFormElementGroupRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
    const ${entityName} = params.entity;
    const formElementGroup = params.formElementGroup;
    const _ = imports.lodash;
    let visibility = true;
    return formElementGroup.formElements.map((formElement) => {
        $RULE_CONDITIONS
        $OTHER_CONDITIONS
        return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, null);
    });
};

`;

class DeclarativeRuleHolder {
    constructor(declarativeRules = []) {
        this.declarativeRules = declarativeRules;
    }

    static fromResource(declarativeRuleResources) {
        const declarativeRuleHolder = new DeclarativeRuleHolder();
        if (_.isEmpty(declarativeRuleResources)) {
            declarativeRuleHolder.declarativeRules.push(DeclarativeRule.getInitialState());
        } else {
            declarativeRuleHolder.declarativeRules = _.map(declarativeRuleResources, r => DeclarativeRule.fromResource(r))
        }
        return declarativeRuleHolder;
    }

    generateViewFilterRule(entityName) {
        const {ruleConditionArray, otherConditionArray} = this.getAllRuleConditions(entityName);
        const viewFilterRuleTemplate = getViewFilterRuleTemplate(entityName);
        return viewFilterRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$OTHER_CONDITIONS', otherConditionArray.join('  '));
    }

    generateFormElementGroupRule(entityName) {
        const {ruleConditionArray, otherConditionArray} = this.getAllRuleConditions(entityName);
        const formElementGroupRuleTemplate = getFormElementGroupRuleTemplate(entityName);
        return formElementGroupRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$OTHER_CONDITIONS', otherConditionArray.join('  '));
    }

    getAllRuleConditions(entityName) {
        const ruleConditionArray = [];
        const otherConditionArray = [];
        _.forEach(this.declarativeRules, (declarativeRule, index) => {
            const {ruleConditions, otherConditions} = declarativeRule.getRuleConditions(entityName, index + 1);
            ruleConditionArray.push(ruleConditions);
            otherConditionArray.push(otherConditions);
        });
        return {ruleConditionArray, otherConditionArray};
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

    validate() {
        if (!this.isEmpty()) {
            _.forEach(this.declarativeRules, dr => dr.validate())
        }
    }

    validateAndGetError() {
        let errorMessage;
        try {
            this.validate()
        } catch (e) {
            errorMessage = e.message;
        }
        return errorMessage;
    }

    getApplicableViewFilterActions() {
        const viewFilterTypes = Action.formElementActionTypes;
        const showFE = viewFilterTypes.ShowFormElement;
        const hideFE = viewFilterTypes.HideFormElement;
        const isVisibilityDefined = _.some(this.declarativeRules, dr => dr.containActionType(showFE) || dr.containActionType(hideFE));
        return isVisibilityDefined ? _.omitBy(viewFilterTypes, (v, k) => _.includes([showFE, hideFE], v)) : viewFilterTypes;
    }

    getApplicableFromElementGroupRuleActions() {
        const {ShowFormElementGroup, HideFormElementGroup} = Action.formElementGroupActionTypes;
        const isVisibilityDefined = _.some(this.declarativeRules, dr => dr.containActionType(ShowFormElementGroup) || dr.containActionType(HideFormElementGroup));
        return isVisibilityDefined ? {} : Action.formElementGroupActionTypes;
    }
}


export default DeclarativeRuleHolder;
