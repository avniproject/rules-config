import camelCase from 'lodash/camelCase';

const WithName = (newName) => (target, oldName, descriptor) => {
    const oldFunc = descriptor.value;
    target[camelCase(newName)] = descriptor.value = function () {
        return oldFunc.apply(this, arguments);
    };
    delete target[oldName];
    return descriptor;
};

export default WithName;
