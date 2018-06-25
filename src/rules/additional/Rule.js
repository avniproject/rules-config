const RuleRegistry = require('./RuleRegistry');

const RuleFactory = (formUUID, type) => (uuid, name, order, metadata = {}) => {
    return (fn) => {
        const ruleData = {metadata: metadata, fn: fn, uuid: uuid, name: name, order: order};
        RuleRegistry.add(formUUID, type, ruleData);
        fn.registry = RuleRegistry;
    };
};

module.exports = RuleFactory;