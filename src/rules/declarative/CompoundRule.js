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

    clone() {
        const compoundRule = new CompoundRule();
        compoundRule.conjunction = this.conjunction;
        compoundRule.rules = _.map(this.rules, rule => rule.clone());
        return compoundRule;
    }
}

export default CompoundRule;
