import _ from "lodash";
import {assertTrue} from "./Util";
import CompoundRule from './CompoundRule';

class Condition {
    static conjunctions = {
        And: 'and',
        Or: 'or'
    };

    constructor() {
        this.compoundRule = new CompoundRule();
    }

    setConjunction(conjunction) {
        const conjunctions = _.values(Condition.conjunctions);
        assertTrue(_.includes(conjunctions, conjunction), `Conjunction must be one of the ${conjunctions}`);
        this.conjunction = conjunction;
    }

    setCompoundRule(compoundRule) {
        this.compoundRule = compoundRule;
    }

    getJSCode() {
        return this.compoundRule.getJSCode();
    }

    clone() {
        const condition = new Condition();
        condition.compoundRule = this.compoundRule.clone();
        condition.conjunction = this.conjunction;
        return condition;
    }

}

export default Condition;
