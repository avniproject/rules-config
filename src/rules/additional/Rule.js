const RuleRegistry = require('./RuleRegistry');

const RuleFactory = (formUUID, type) => (uuid, name, metadata) => {
    return (fn) => {
        const ruleData = {metadata: metadata, fn: fn, uuid: uuid, name: name};
        RuleRegistry.add(formUUID, type, ruleData);
        fn.registry = RuleRegistry;
    };
};

module.exports = RuleFactory;