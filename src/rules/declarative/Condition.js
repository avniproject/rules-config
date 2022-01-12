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

    withConjunction(conjunction) {
        const conjunctions = _.values(Condition.conjunctions);
        assertTrue(_.includes(conjunctions, conjunction), `Conjunction must be one of the ${conjunctions}`);
        this.conjunction = conjunction;
        return this;
    }

    withCompoundRule(compoundRule) {
        this.compoundRule = compoundRule;
        return this;
    }

    getJSCode() {
        return this.compoundRule.getJSCode();
    }

}

export default Condition;
