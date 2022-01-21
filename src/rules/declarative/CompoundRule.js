import {assertTrue} from "./Util";
import _ from "lodash";
import Rule from "./Rule";

class CompoundRule {
    static conjunctions = {
        And: 'and',
        Or: 'or'
    };

    constructor(conjunction) {
        this.conjunction = conjunction;
        this.rules = [];
    }

    static fromResource(json) {
        const compoundRule = new CompoundRule();
        compoundRule.conjunction = json.conjunction;
        compoundRule.rules = _.map(json.rules, rule => Rule.fromResource(rule));
        return compoundRule;
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    setConjunction(conjunction) {
        const conjunctions = _.values(CompoundRule.conjunctions);
        assertTrue(_.includes(conjunctions, conjunction), `Conjunction must be one of the ${conjunctions}`);
        this.conjunction = conjunction;
    }

    addEmptyRule() {
        const rule = new Rule();
        this.rules.push(rule);
    }

    getJSCode() {
        return _.map(this.rules, rule => rule.getJSCode()).join(`.${this.conjunction}.`).concat('.matches()');
    }

    getRuleSummary() {
        return _.map(this.rules, rule => rule.getRuleSummary()).join(` ${_.upperCase(this.conjunction)} `);
    }

    clone() {
        const compoundRule = new CompoundRule();
        compoundRule.conjunction = this.conjunction;
        compoundRule.rules = _.map(this.rules, rule => rule.clone());
        return compoundRule;
    }

    validate() {
        _.forEach(this.rules, rule => rule.validate());
    }
}

export default CompoundRule;
