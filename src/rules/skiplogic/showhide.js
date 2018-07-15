import { generalStatusBuilder } from './builder';

class Action {
    constructor(...formElementNames) {
        this.formElements = formElementNames.map((formElementName) => ({
            formElementName,
            fnName: _.camelCase(formElementName)
        }));
    }
}

class Show extends Action {
    act(builderBreakup) {
        return generalStatusBuilder(builderBreakup).build();
    }
}

class Hide extends Action {
    act(builderBreakup) {
        const status = generalStatusBuilder(builderBreakup).build();
        status.visibility = !status.visibility;
        return status;
    }
}

const show = function () {
    return new Show(...arguments);
}

const hide = function () {
    return new Hide(...arguments);
};

export { show, hide, Show, Hide };
