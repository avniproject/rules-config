const {isDefined, defaultTo} = require("../utils");
const RuleableTypes = require('./RuleableTypes');


class RuleRegistry {
    constructor() {
        this.rules = new Map();
        this.__separator = "_-_";
    }

    _makeKey(entityType, entityUUID, ruleType) {
        return `${entityType}${this.__separator}${entityUUID}${this.__separator}${ruleType}`;
    }

    _unKey(key) {
        const keys = key.split(this.__separator);
        return {entityType: keys[0], entityUUID: keys[1], ruleType: keys[2]};
    }

    add({entityType, entityUUID, ruleType, ruleData}) {
        const key = this._makeKey(entityType, entityUUID, ruleType);
        const rules = defaultTo(this.rules.get(key), []);
        this.rules.set(key, [ruleData].concat(rules).filter(isDefined));
        return this._unKey(key);
    }

    getRulesFor(entityUUID, ruleType, {entityType=RuleableTypes.Form}={entityType:RuleableTypes.Form}) {
        return defaultTo(this.rules.get(this._makeKey(entityType, entityUUID, ruleType)), []);
    }

    getAll() {
        return defaultTo(Array.from(this.rules.entries()).map(([k, v]) => [this._unKey(k), v]), []);
    }
}

module.exports = new RuleRegistry();
