const {isDefined, defaultTo} = require("../utils");

class RuleRegistry {
    constructor() {
        this.rules = new Map();
        this.__separator = "_-_";
    }

    _makeKey(formUUID, type) {
        return `${formUUID}${this.__separator}${type}`;
    }

    _unKey(key) {
        const keys = key.split(this.__separator);
        return {formUUID: keys[0], type: keys[1]};
    }

    add(formUUID, type, ruleData) {
        const key = this._makeKey(formUUID, type);
        const rules = defaultTo(this.rules.get(key), []);
        this.rules.set(key, [ruleData].concat(rules).filter(isDefined));
        return this._unKey(key);
    }

    getRulesFor(formUUID, type) {
        return defaultTo(this.rules.get(this._makeKey(formUUID, type)), []);
    }

    getAll() {
        return defaultTo(Array.from(this.rules.entries()).map(([k, v]) => [this._unKey(k), v]), []);
    }
}

module.exports = new RuleRegistry();