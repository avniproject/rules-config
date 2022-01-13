import {isDefined, defaultTo} from "../utils";
import { Ruleable } from './constants';

class RuleRegistry {
    constructor() {
        this.rules = new Map();
        this.__separator = "_-_";
    }

    _makeKey(entityType, entityUUID, type) {
        return `${entityType}${this.__separator}${entityUUID}${this.__separator}${type}`;
    }

    _unKey(key) {
        const keys = key.split(this.__separator);
        return {entityType: keys[0], entityUUID: keys[1], type: keys[2]};
    }

    add(entityType, entityUUID, type, ruleData) {
        const key = this._makeKey(entityType, entityUUID, type);
        const rules = defaultTo(this.rules.get(key), []);
        this.rules.set(key, [ruleData].concat(rules).filter(isDefined));
        return this._unKey(key);
    }

    getRulesFor(entityUUID, type, entityType=Ruleable.Form) {
        return defaultTo(this.rules.get(this._makeKey(entityType, entityUUID, type)), []);
    }

    getAll() {
        return defaultTo(Array.from(this.rules.entries()).map(([k, v]) => [this._unKey(k), v]), []);
    }
}
const ruleRegistry = new RuleRegistry();
export default ruleRegistry;
