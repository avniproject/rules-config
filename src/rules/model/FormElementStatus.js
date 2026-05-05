import _ from "lodash";
class FormElementStatus {
    constructor(uuid, visibility, value, answersToSkip = [], validationErrors = [], answersToShow = [],
                resetValueIfNull = false) {
        if (!_.isEmpty(answersToSkip) && !_.isEmpty(answersToShow)) {
            throw Error(`FormElementStatus for FormElement '${uuid}' uses both answersToSkip and answersToShow.`);
        }
        this.uuid = uuid;
        this.visibility = visibility;
        this.value = value;
        this.answersToSkip = answersToSkip;
        this.validationErrors = validationErrors;
        this.answersToShow = answersToShow;
        this.initializedWithNullValueOnPurpose = resetValueIfNull && _.isNil(value) ;
    }

    static resetIfValueIsNull(uuid, visibility, value, answersToSkip = [], validationErrors = [], answersToShow = []) {
        return new FormElementStatus(uuid, visibility, value, answersToSkip, validationErrors, answersToShow, true);
    }

    _bool(formElementStatus, op) {
        const oredFormElementStatus = new FormElementStatus();
        oredFormElementStatus.uuid = this.uuid;
        oredFormElementStatus.visibility = op(this.visibility, formElementStatus.visibility);
        oredFormElementStatus.value = this.value;
        oredFormElementStatus.answersToSkip = this.answersToSkip;
        oredFormElementStatus.validationErrors = this.validationErrors;
        oredFormElementStatus.answersToShow = this.answersToShow;
        oredFormElementStatus.questionGroupIndex = this.questionGroupIndex;
        oredFormElementStatus.initializedWithNullValueOnPurpose = this.initializedWithNullValueOnPurpose;
        return oredFormElementStatus;
    }

    addQuestionGroupInformation(questionGroupIndex) {
        this.questionGroupIndex = questionGroupIndex;
    }

    or(formElementStatus) {
        return this._bool(formElementStatus, (a, b) => a || b);
    }

    and(formElementStatus) {
        return this._bool(formElementStatus, (a, b) => a && b);
    }
}

export default FormElementStatus;
