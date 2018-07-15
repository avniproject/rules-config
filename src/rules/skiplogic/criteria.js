import { getObsGetter } from './obsGetter';

class Criteria {
    constructor(obsGetter, obsMatcher) {
        this.obsGetter = getObsGetter(obsGetter);
        this.obsMatcher = obsMatcher;
    }

    match(getStatus, entity, formElement) {
        return getStatus(this.obsMatcher.match(this.obsGetter.find(entity, formElement)));
    }

    static chainBool(criteriaA, criteriaB, shortCircuitVal) {
        const criteriaC = criteria();
        criteriaC.match = function (getStatus, entity, formElement) {
            const statusA = criteriaA.match(getStatus, entity, formElement);
            if (statusA.visibility == shortCircuitVal) {
                return statusA;
            }
            return criteriaB.match(getStatus, entity, formElement);
        };
        return criteriaC;
    }

    and(criteriaB) {
        return Criteria.chainBool(this, criteriaB, false);
    }

    or(criteriaB) {
        return Criteria.chainBool(this, criteriaB, true);
    }
}

const criteria = (...args) => {
    return new Criteria(...args);
}

export { criteria, Criteria };
