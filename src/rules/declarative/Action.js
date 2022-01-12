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

    withActionType(actionType) {
        const actionTypes = _.values(Action.actionTypes);
        assertTrue(_.includes(actionTypes, actionType), `Action type must be one of the ${actionTypes}`);
        this.actionType = actionType;
        return this;
    }

    withValue(value) {
        assertTrue(this.actionType === Action.actionTypes.Value, 'Action type must be Value');
        this.value = value;
        return this;
    }

    withAnswersToSkip(...value) {
        assertTrue(this.actionType === Action.actionTypes.SkipAnswers, 'Action type must be SkipAnswers');
        this.answersToSkip = [...value];
        return this;
    }

    withValidationError(error) {
        assertTrue(this.actionType === Action.actionTypes.ValidationError, 'Action type must be ValidationError');
        this.validationError = error;
        return this;
    }

    getJsValue() {
        return typeof this.value === 'number' ? this.value : `"${this.value}"`
    }

    getJsAnswersToSkip() {
        return _.map(this.answersToSkip, ac => `"${ac}"`).toString();
    }

}

export default Action;
