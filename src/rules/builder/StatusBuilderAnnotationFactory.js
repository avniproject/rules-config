const FormElementStatusBuilder = require('./FormElementStatusBuilder');

const StatusBuilderAnnotationFactory = function (...argNames) {
    const argToContextMapper = (args) => {
        const contextMap = {};
        argNames.forEach((argName, index) => {
            contextMap[argName] = args[index];
        });
        return contextMap;
    }
    return function (target, key, descriptor) {
        const oldFn = descriptor.value;
        descriptor.value = function (...args) {
            const statusBuilder = new FormElementStatusBuilder(argToContextMapper(args));
            return oldFn(args, statusBuilder) || statusBuilder.build();
        }
        return descriptor;
    }
};

module.exports = StatusBuilderAnnotationFactory;