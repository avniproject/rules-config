import _ from "lodash";

class EditFormRuleResponse {
    editable: EditFormRuleResponseEditable;

    static createEditAllowedResponse() {
        const editRuleResponse = new EditFormRuleResponse();
        editRuleResponse.editable = EditFormRuleResponseEditable.createEditAllowedEditable();
        return editRuleResponse;
    }

    static createEditRuleResponse(ruleResponse: EditFormRuleResponse) {
        const editRuleResponseEditableObject = _.get(ruleResponse, "editable");
        if (_.isNil(editRuleResponseEditableObject)) return EditFormRuleResponse.createEditAllowedResponse();

        const editRuleResponse = new EditFormRuleResponse();
        editRuleResponse.editable = EditFormRuleResponseEditable.createEditRuleEditableFrom(editRuleResponseEditableObject);
        return editRuleResponse;
    }

    isEditAllowed() {
        return this.editable.value;
    }

    isEditDisallowed() {
        return !this.isEditAllowed();
    }

    getMessageKey() {
        return this.editable.messageKey;
    }
}

class EditFormRuleResponseEditable {
    value;
    messageKey;

    static createEditAllowedEditable() {
        const editRuleResponseEditable = new EditFormRuleResponseEditable();
        editRuleResponseEditable.value = true;
        return editRuleResponseEditable;
    }

    static createEditRuleEditableFrom(ruleResponseEditableObject) {
        const editRuleResponseEditable = new EditFormRuleResponseEditable();
        editRuleResponseEditable.value = _.isBoolean(ruleResponseEditableObject.value) ? ruleResponseEditableObject.value : true;
        editRuleResponseEditable.messageKey = ruleResponseEditableObject.messageKey;
        return editRuleResponseEditable;
    }
}

export default EditFormRuleResponse;
