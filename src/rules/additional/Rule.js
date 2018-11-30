const RuleRegistry = require('./RuleRegistry');

const RuleFactory = (formUUID, type) => (uuid, name, executionOrder, metadata = {}, customFnName) => {
    return (fn) => {
        const ruleData = {metadata: metadata, fn: fn, uuid: uuid, name: name, executionOrder: executionOrder, fnName: customFnName};
        RuleRegistry.add(formUUID, type, ruleData);
        fn.registry = RuleRegistry;
    };
};

module.exports = RuleFactory;