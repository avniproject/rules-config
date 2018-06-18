const isDefined = (val) => val !== undefined && val !== null;

const defaultTo = (val, defaultVal) => isDefined(val) ? val : defaultVal;

module.exports = {isDefined, defaultTo};