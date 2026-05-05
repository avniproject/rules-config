import {assertTrue} from "./Util";
import _ from "lodash";
import Action from './Action';

class ViewFilterActionDetails {
    constructor() {
    }

    static fromResource(json) {
        const actionDetails = new ViewFilterActionDetails();
        actionDetails.value = json.value;
        actionDetails.answersToSkip = json.answersToSkip;
        actionDetails.answerUuidsToSkip = json.answerUuidsToSkip;
        actionDetails.answersToShow = json.answersToShow;
        actionDetails.answerUuidsToShow = json.answerUuidsToShow;
        actionDetails.conceptDataType = json.conceptDataType;
        actionDetails.validationError = json.validationError;
        return actionDetails;
    }

    setValue(value) {
        this.value = value;
    }

    setAnswersToSkip(...value) {
        this.answersToSkip = [...value];
    }

    setAnswerUUIDsToSkip(...value) {
        this.answerUuidsToSkip = [...value];
    }

    setAnswersToShow(...value) {
        this.answersToShow = [...value];
    }

    setAnswerUUIDsToShow(...value) {
        this.answerUuidsToShow = [...value];
    }

    setConceptDataType(dataType) {
        this.conceptDataType = dataType;
    }

    setValidationError(error) {
        this.validationError = error;
    }

    clone() {
        const details = new ViewFilterActionDetails();
        details.value = this.value;
        details.answersToSkip = this.answersToSkip;
        details.answerUuidsToSkip = this.answerUuidsToSkip;
        details.answersToShow = this.answersToShow;
        details.answerUuidsToShow = this.answerUuidsToShow;
        details.conceptDataType = this.conceptDataType;
        details.validationError = this.validationError;
        return details;
    }

    validate(actionType) {
        if (_.isEqual(actionType, Action.actionTypes.Value))
            assertTrue(!_.isEmpty(this.value), "Value in Action cannot be empty");
        if (_.isEqual(actionType, Action.actionTypes.ValidationError))
            assertTrue(!_.isEmpty(this.validationError), "Validation error in Action cannot be empty");
        if (_.isEqual(actionType, Action.actionTypes.SkipAnswers)) {
            assertTrue(!_.isEmpty(this.answersToSkip), "Concept answers in Action cannot be empty");
            assertTrue(!_.isEmpty(this.answerUuidsToSkip), "Concept answer uuids in cannot be empty");
        }
        if (_.isEqual(actionType, Action.actionTypes.ShowAnswers)) {
            assertTrue(!_.isEmpty(this.answersToShow), "Concept answers in Action cannot be empty");
            assertTrue(!_.isEmpty(this.answerUuidsToShow), "Concept answer uuids in cannot be empty");
        }
    }

}

export default ViewFilterActionDetails
