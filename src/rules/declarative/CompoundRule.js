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
        this.rules = []
    }

    addRule(rule) {
        this.rules.push(rule);
        return this;
    }

    withConjunction(conjunction) {
        const conjunctions = _.values(CompoundRule.conjunctions);
        assertTrue(_.includes(conjunctions, conjunction), `Conjunction must be one of the ${conjunctions}`);
        this.conjunction = conjunction;
        return this;
    }

    withEmptyRule() {
        const rule = new Rule();
        this.rules.push(rule);
    }

    getJSCode() {
        return _.map(this.rules, rule => rule.getJSCode()).join(`.${this.conjunction}.`).concat('.matches()');
    }

}

export default CompoundRule;
