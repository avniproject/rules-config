import _ from 'lodash';
import {Action, DeclarativeRule} from "./index";
import {getEligibilityRuleTemplate, getFormElementGroupRuleTemplate, getViewFilterRuleTemplate} from "./Util";

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
        const {ruleConditionArray, actionConditionArray} = this.getAllRuleConditions(entityName);
        const viewFilterRuleTemplate = getViewFilterRuleTemplate(entityName);
        return viewFilterRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$ACTION_CONDITIONS', actionConditionArray.join('  '));
    }

    generateFormElementGroupRule(entityName) {
        const {ruleConditionArray, actionConditionArray} = this.getAllRuleConditions(entityName);
        const formElementGroupRuleTemplate = getFormElementGroupRuleTemplate(entityName);
        return formElementGroupRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$ACTION_CONDITIONS', actionConditionArray.join('  '));
    }

    generateEligibilityRule() {
        const {ruleConditionArray, actionConditionArray} = this.getAllRuleConditions('individual');
        const eligibilityRuleTemplate = getEligibilityRuleTemplate();
        return eligibilityRuleTemplate
            .replace('$RULE_CONDITIONS', ruleConditionArray.join('  '))
            .replace('$ACTION_CONDITIONS', actionConditionArray.join('  '));
    }

    getAllRuleConditions(entityName) {
        const ruleConditionArray = [];
        const actionConditionArray = [];
        _.forEach(this.declarativeRules, (declarativeRule, index) => {
            const {ruleConditions, actionConditions} = declarativeRule.getRuleConditions(entityName, index + 1);
            ruleConditionArray.push(ruleConditions);
            actionConditionArray.push(actionConditions);
        });
        return {ruleConditionArray, actionConditionArray};
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
        const isVisibilityDefined = _.some(this.declarativeRules, dr => dr.containActionType(showFE, hideFE));
        return isVisibilityDefined ? _.omitBy(viewFilterTypes, (v, k) => _.includes([showFE, hideFE], v)) : viewFilterTypes;
    }

    getApplicableFormElementGroupRuleActions() {
        const {ShowFormElementGroup, HideFormElementGroup} = Action.actionTypes;
        const isVisibilityDefined = _.some(this.declarativeRules, dr => dr.containActionType(ShowFormElementGroup, HideFormElementGroup));
        return isVisibilityDefined ? {} : {ShowFormElementGroup, HideFormElementGroup};
    }

    getApplicableEncounterEligibilityActions() {
        const {ShowEncounterType} = Action.actionTypes;
        const isDefined = _.some(this.declarativeRules, dr => dr.containActionType(ShowEncounterType));
        return isDefined ? {} : {ShowEncounterType};
    }

    getApplicableEnrolmentEligibilityActions() {
        const {ShowProgram} = Action.actionTypes;
        const isDefined = _.some(this.declarativeRules, dr => dr.containActionType(ShowProgram));
        return isDefined ? {} : {ShowProgram};
    }
}


export default DeclarativeRuleHolder;
