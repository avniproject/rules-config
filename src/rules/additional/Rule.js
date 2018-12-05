const RuleRegistry = require('./RuleRegistry');
const { Ruleable, RuleType } = require('./constants');

const RuleFactory = (formUUID, type) => (uuid, name, executionOrder, metadata = {}, customFnName) => {
    return (fn) => {
        const ruleData = {metadata: metadata, fn: fn, uuid: uuid, name: name, executionOrder: executionOrder, fnName: customFnName};
        RuleRegistry.add(Ruleable.Form, formUUID, type, ruleData);
        fn.registry = RuleRegistry;
    };
};

const BaseRuleDecorator = ({name, type, uuid, entityUUID, entityType,
                       executionOrder, metadata, customFnName}) =>
    (fn) => {
        const ruleData = {metadata, fn, uuid, name, executionOrder, fnName: customFnName};
        RuleRegistry.add(entityType, entityUUID, type, ruleData);
        fn.registry = RuleRegistry;
    };


const WrappedRuleDecorator = (ruleType, ruleProperties, entityUUID, entityType=Ruleable.Form) =>
    BaseRuleDecorator({
        name: ruleProperties.name,
        type:ruleType,
        uuid: ruleProperties.uuid,
        entityUUID,
        entityType,
        executionOrder: ruleProperties.executionOrder,
        metadata: ruleProperties.metadata,
        customFnName: ruleProperties.customFnName
    });

const FormElementRule = (ruleProps) =>
    WrappedRuleDecorator(RuleType.ViewFilter, ruleProps, ruleProps.formUUID);

const DecisionRule = (ruleProps) =>
    WrappedRuleDecorator(RuleType.Decision, ruleProps, ruleProps.formUUID);

// VisitScheduleRules
// ChecklistRules
// ValidationRules

const ProgramRule = (ruleProps) =>
    WrappedRuleDecorator(RuleType.EnrolmentSummary, ruleProps, ruleProps.programUUID,
        Ruleable.Program);


module.exports = {
    RuleFactory,
    FormElementRule,
    DecisionRule,
    ProgramRule,
};
