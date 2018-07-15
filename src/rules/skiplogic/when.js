import { criteria } from './criteria';
import { show, hide } from './showhide';

class When {
    static UsageInfo = 'Usage:\
     when(String|Function, Matcher, Action)\
     | when(String|Function, Matcher).Action';

    constructor(obsGetter, obsMatcher, action) {
        this.criteria = criteria(obsGetter, obsMatcher);
        this.action = action;
    }
    getStatus(entity, formElement) {
        return this.criteria.match((breakup) => this.action.act(breakup), entity, formElement);
    }
    build() {
        return this.action.formElements.map(({ fnName }) => ({
            fnName: fnName,
            fn: (entity, formElement) => this.getStatus(entity, formElement)
        }));
    }
    show(...formElementNames) {
        this.action = show(...formElementNames);
        return this;
    }
    hide(...formElementNames) {
        this.action = hide(...formElementNames);
        return this;
    }
    //'A && B'
    and(whenB) {
        this.criteria = this.criteria.and(whenB.criteria);
        return this;
    }
    //'A || B'
    or(whenB) {
        this.criteria = this.criteria.or(whenB.criteria);
        return this;
    }
}

const when = function () {
    return new When(...arguments);
};

export { when, When };
