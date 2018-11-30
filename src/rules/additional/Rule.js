const RuleRegistry = require('./RuleRegistry');
const RuleableTypes = require('./RuleableTypes');

const RuleFactory = (entityUUID, ruleType, {entityType=RuleableTypes.Form}={entityType:RuleableTypes.Form}) =>
    (uuid, name, executionOrder, metadata = {}, customFnName) => {
        return (fn) => {
            const ruleData = {metadata: metadata, fn: fn, uuid: uuid, name: name, executionOrder: executionOrder, fnName: customFnName};
            RuleRegistry.add({entityType, entityUUID, ruleType, ruleData});
            fn.registry = RuleRegistry;
        };
    };

module.exports = RuleFactory;
