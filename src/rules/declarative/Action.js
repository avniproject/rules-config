import {assertTrue} from "./Util";
import _ from "lodash";

class Action {
    static actionTypes = {
        'ShowFormElement': 'showFormElement',
        'HideFormElement': 'hideFormElement',
        'Value': 'value',
        'SkipAnswers': 'skipAnswers',
        'ValidationError': 'validationError',
    };

    constructor() {
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

    clone() {
        const action = new Action();
        action.actionType = this.actionType;
        action.value = this.value;
        action.answersToSkip = this.answersToSkip;
        action.validationError=this.validationError;
        return action;
    }

}

export default Action;
