import {assertTrue} from "./Util";
import _ from "lodash";

class Action {
    static formElementActionTypes = {
        'ShowFormElement': 'showFormElement',
        'HideFormElement': 'hideFormElement',
        'Value': 'value',
        'SkipAnswers': 'skipAnswers',
        'ValidationError': 'validationError',
    };

    static actionTypes = {
        ...Action.formElementActionTypes,
        'ShowFormElementGroup': 'showFormElementGroup',
        'HideFormElementGroup': 'hideFormElementGroup',
        'ShowProgram': 'showProgram',
        'ShowEncounterType': 'showEncounterType',
    };

    constructor() {
    }

    static fromResource(json) {
        const action = new Action();
        action.actionType = json.actionType;
        action.value = json.value;
        action.answersToSkip = json.answersToSkip;
        action.answerUuidsToSkip = json.answerUuidsToSkip;
        action.validationError = json.validationError;
        return action;
    }

    setActionType(actionType) {
        const actionTypes = _.values(Action.actionTypes);
        assertTrue(_.includes(actionTypes, actionType), `Action type must be one of the ${actionTypes}`);
        this.actionType = actionType;
    }

    setValue(value) {
        assertTrue(this.actionType === Action.actionTypes.Value, 'Action type must be Value');
        this.value = value;
    }

    setAnswersToSkip(...value) {
        assertTrue(this.actionType === Action.actionTypes.SkipAnswers, 'Action type must be SkipAnswers');
        this.answersToSkip = [...value];
    }

    setAnswerUUIDsToSkip(...value) {
        assertTrue(this.actionType === Action.actionTypes.SkipAnswers, 'Action type must be SkipAnswers');
        this.answerUuidsToSkip = [...value];
    }

    setValidationError(error) {
        assertTrue(this.actionType === Action.actionTypes.ValidationError, 'Action type must be ValidationError');
        this.validationError = error;
    }

    getJsValue() {
        return typeof this.value === 'number' ? this.value : `"${this.value}"`
    }

    getJsAnswersToSkip() {
        return _.map(this.answersToSkip, ac => `"${ac}"`).toString();
    }

    getJsAnswerUUIDsToSkip() {
        return _.map(this.answerUuidsToSkip, ac => `"${ac}"`).toString();
    }

    clone() {
        const action = new Action();
        action.actionType = this.actionType;
        action.value = this.value;
        action.answersToSkip = this.answersToSkip;
        action.answerUuidsToSkip = this.answerUuidsToSkip;
        action.validationError = this.validationError;
        return action;
    }

    getRuleSummary() {
        switch (this.actionType) {
            case Action.actionTypes.Value:
                return `Display value ${this.value}.`;
            case Action.actionTypes.SkipAnswers:
                return `Hide answers ${this.getJsAnswersToSkip()}.`;
            case Action.actionTypes.ValidationError:
                return `Raise error "${this.validationError}".`;
            default: return `${_.startCase(this.actionType)}.`;
        }
    }

    validate() {
        assertTrue(!_.isNil(this.actionType), "Type in Action cannot be empty");
        if (_.isEqual(this.actionType, Action.actionTypes.Value))
            assertTrue(!_.isNil(this.value), "Value in Action cannot be empty");
        if (_.isEqual(this.actionType, Action.actionTypes.ValidationError))
            assertTrue(!_.isNil(this.validationError), "Validation error in Action cannot be empty");
        if (_.isEqual(this.actionType, Action.actionTypes.SkipAnswers))
            assertTrue(!_.isNil(this.answersToSkip), "Concept answers in Action cannot be empty");
    }

}

export default Action;
