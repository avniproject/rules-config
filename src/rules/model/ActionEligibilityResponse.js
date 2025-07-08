import _ from "lodash";

/**
 * Generic eligibility response class that can be used by different types of rules like
 * EditFormRule and MemberEligibilityCheckRule to determine if an action is allowed
 */
class ActionEligibilityResponse {
    eligible;

    static createAllowedResponse() {
        const ruleResponse = new ActionEligibilityResponse();
        ruleResponse.eligible = EligibilityStatus.createAllowedStatus();
        return ruleResponse;
    }

    static createDisallowedResponse(message) {
        const ruleResponse = new ActionEligibilityResponse();
        ruleResponse.eligible = EligibilityStatus.createDisallowedStatus(message);
        return ruleResponse;
    }

    static createRuleResponse(ruleResponse) {
        //always check for both eligible and editable as editable is used for edit form rules   
        const eligibilityObject = _.get(ruleResponse, "eligible") || _.get(ruleResponse, "editable");
        if (_.isNil(eligibilityObject)) return ActionEligibilityResponse.createAllowedResponse();

        const newRuleResponse = new ActionEligibilityResponse();
        newRuleResponse.eligible = EligibilityStatus.createEligibilityStatusFrom(eligibilityObject);
        return newRuleResponse;
    }

    isAllowed() {
        return this.eligible.value;
    }

    isDisallowed() {
        return !this.isAllowed();
    }

    getMessage() {
        return this.eligible.message;
    }
}

class EligibilityStatus {
    value;
    message;

    static createAllowedStatus() {
        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.value = true;
        return eligibilityStatus;
    }

    static createDisallowedStatus(message) {
        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.value = false;
        eligibilityStatus.message = message;
        return eligibilityStatus;
    }

    static createEligibilityStatusFrom(eligibilityObject) {
        if (_.isNil(eligibilityObject) || _.isNil(eligibilityObject.value) || !_.isBoolean(eligibilityObject.value)) {
            return EligibilityStatus.createAllowedStatus();
        }
        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.value =  eligibilityObject.value;
        eligibilityStatus.message = eligibilityObject.message || eligibilityObject.messageKey;
        return eligibilityStatus;
    }
}

export default ActionEligibilityResponse;
