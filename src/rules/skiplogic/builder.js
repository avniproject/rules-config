import _ from 'lodash';
import FormElementsStatusHelper from '../FormElementsStatusHelper';
import FormElementStatusBuilder from '../builder/FormElementStatusBuilder';
import RuleFactory from '../additional/Rule';

const generalStatusBuilder = ({ context, findingStrategy, inputForStrategy, operator, value }) => {
    const statusBuilder = new FormElementStatusBuilder(context);
    if (_.isArray(value)) statusBuilder.show()[findingStrategy](inputForStrategy)[operator](...value);
    else statusBuilder.show()[findingStrategy](inputForStrategy)[operator](value);
    return statusBuilder;
};

/* builds the `class {}` with `exec` method. `exec` method has access to all formElementFunctions built from filters.rules */
const build = function (filters) {
    const constructor = () => { };
    const generatedFunctions = {};
    filters.rules.forEach((rule) => {
        rule.build().forEach(({ fnName, fn }) => {
            generatedFunctions[fnName] = fn;
        });
    });

    const formElementFunctions = Object.assign({}, generatedFunctions, filters.directFunctions);
    constructor.exec = (programEncounter, formElementGroup, today) => {
        return FormElementsStatusHelper.getFormElementsStatusesWithoutDefaults(formElementFunctions, programEncounter, formElementGroup, today);
    };

    //registration by uuid
    RuleFactory(filters.formUuid, 'ViewFilter')(filters.uuid, filters.name, filters.execOrder, filters.otherData, filters.uuid)(constructor);
    return constructor;
};

const buildAndExport = (filters, exprts) => {
    exprts[filters.uuid] = build(filters);
};

export { generalStatusBuilder, build, buildAndExport };
