import isFunction from 'lodash/isFunction';

const isDefined = (val) => val !== undefined && val !== null;

const defaultTo = (val, defaultVal) => isDefined(val) ? val : defaultVal;

const processServiceCallResults = (results, callback) => {
    if (!isFunction(callback)) {
        throw Error("[processServiceCallResults] no callback function provided")
    }
    const isPromise = results && typeof results.then === "function";
    if (isPromise) {
        return Promise.resolve(results)
            .then(subjects => {
                return callback(subjects);
            })
    } else {
        return callback(results);
    }
};

export {isDefined, defaultTo, processServiceCallResults};
