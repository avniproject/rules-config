import _ from "lodash";

/**
 * Generic eligibility response class that can be used by different types of rules like
 * EditFormRule and MemberEligibilityCheckRule to determine if an action is allowed
 */
class ActionEligibilityResponse {
    eligible;

    static createAllowedResponse() {
        const ruleResponse = new ActionEligibilityResponse();
        ruleResponse.eligible = EligiblityStatus.createAllowedStatus();
        return ruleResponse;
    }

    static createRuleResponse(ruleResponse) {
        //always check for both eligible and editable as editable is used for edit form rules   
        const eligiblityObject = _.get(ruleResponse, "eligible") || _.get(ruleResponse, "editable");
        if (_.isNil(eligiblityObject)) return ActionEligibilityResponse.createAllowedResponse();

        const newRuleResponse = new ActionEligibilityResponse();
        newRuleResponse.eligible = EligiblityStatus.createPermissionStatusFrom(eligiblityObject);
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

class EligiblityStatus {
    value;
    message;

    static createAllowedStatus() {
        const eligiblityStatus = new EligiblityStatus();
        eligiblityStatus.value = true;
        return eligiblityStatus;
    }

    static createPermissionStatusFrom(eligibilityObject) {
        const eligiblityStatus = new EligiblityStatus();
        eligiblityStatus.value = _.isBoolean(eligibilityObject.value) ? eligibilityObject.value : true;
        eligiblityStatus.message = eligibilityObject.message;
        return eligiblityStatus;
    }
}

export default ActionEligibilityResponse;
