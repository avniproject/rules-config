import _ from "lodash";
import {assertTrue} from "./Util";

class RHS {
    static types = {
        'AnswerConcept': 'answerConcept',
        'Value': 'value',
    };

    constructor() {
    }

    setType(type) {
        const types = _.values(RHS.types);
        assertTrue(_.includes(types, type), `Types must be one of the ${types}`);
        this.type = type;
    }

    setAnswerConceptNames(...answerConceptNames) {
        this.answerConceptNames = answerConceptNames;
    }

    setAnswerConceptUuids(answerConceptUuids) {
        this.answerConceptUuids = answerConceptUuids;
    }

    setValue(value) {
        assertTrue(this.type === RHS.types.Value, `Type must be ${RHS.types.Value}`);
        this.value = value;
    }

    getJSCode() {
        if (this.type === RHS.types.AnswerConcept) {
            return _.map(this.answerConceptNames, ac => `"${ac}"`).toString();
        } else {
            return this.value || '';
        }
    }

    clone() {
        const rhs = new RHS();
        rhs.type = this.type;
        rhs.value = this.value;
        rhs.answerConceptNames = this.answerConceptNames;
        rhs.answerConceptUuids = this.answerConceptUuids;
        return rhs;
    }
}

export default RHS;
