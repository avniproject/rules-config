const _ = require("lodash");
const FormElementStatus = require("./model/FormElementStatus");
const moment = require("moment");

class FormElementsStatusesHelper {
    static getFormElementsStatuses(handler = {}, entity, formElementGroup, today) {
        if (handler['preFilter'])
            handler['preFilter'](entity, formElementGroup, today);

        return formElementGroup.getFormElements().map((formElement) => {
            let fnName = _.camelCase(formElement.name);
            let fn = handler[fnName];
            if (_.isNil(fn)) return new FormElementStatus(formElement.uuid, true);
            if (!_.isFunction(fn)) {
                throw Error(`FormElement Name: ${formElement.name}, UUID: ${formElement.uuid}, has a non Function variable defined.`);
            }

            const formElementStatus = fn.bind(handler)(entity, formElement, today);
            if (_.isNil(formElementStatus)) {
                throw Error(`FormElement Name: ${formElement.name}, UUID: ${formElement.uuid}, returned nil`);
            }
            return formElementStatus;
        });
    }

    static getFormElementsStatusesWithoutDefaults(handler = {}, entity, formElementGroup, today) {
        if (handler['preFilter'])
            handler['preFilter'](entity, formElementGroup, today);
        const fnName = _.camelCase(formElementGroup.name);
        const formElementGroupVisibilityFn = handler[fnName];
        let baseFormElementGroupVisibility = [];
        if (_.isFunction(formElementGroupVisibilityFn)) {
            baseFormElementGroupVisibility = formElementGroupVisibilityFn
                .bind(handler)(entity, formElementGroup, today);
        }

        let formElementStatuses = formElementGroup.getFormElements().map((formElement) => {
            let fnName = _.camelCase(formElement.name);
            return {fe: formElement, fn: handler[fnName]};
        }).filter(({fe, fn}) => _.isFunction(fn))
            .map(({fn, fe}) => {
                const formElementStatus = fn.bind(handler)(entity, fe, today);
                if (_.isNil(formElementStatus)) {
                    throw Error(`FormElement Name: ${fe.name}, UUID: ${fe.uuid}, returned nil`);
                }
                return formElementStatus;
            });
        return baseFormElementGroupVisibility.concat(formElementStatuses);
    }

    static createStatusBasedOnCodedObservationMatch(programEncounter, formElement, dependentConceptName, dependentConceptValue) {
        let observationValue = programEncounter.getObservationValue(dependentConceptName);
        return new FormElementStatus(formElement.uuid, observationValue === dependentConceptValue);
    }

    static createStatusBasedOnGenderMatch(programEncounter, formElement, genderValue) {
        return new FormElementStatus(formElement.uuid, programEncounter.programEnrolment.individual.gender.name === genderValue);
    }

    static weeksBetween(arg1, arg2) {
        return moment.duration(moment(arg1).diff(moment(arg2))).asWeeks();
    }
}

module.exports = FormElementsStatusesHelper;