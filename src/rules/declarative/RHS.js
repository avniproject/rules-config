import _ from "lodash";
import {assertTrue} from "./Util";

class RHS {
    static types = {
        'AnswerConcept': 'answerConcept',
        'Value': 'value',
    };

    constructor() {
    }

    withType(type) {
        const types = _.values(RHS.types);
        assertTrue(_.includes(types, type), `Types must be one of the ${types}`);
        this.type = type;
        return this;
    }

    withAnswerConceptNames(...answerConceptNames) {
        this.answerConceptNames = answerConceptNames;
        return this;
    }

    withAnswerConceptUuids(answerConceptUuids) {
        this.answerConceptUuids = answerConceptUuids;
        return this;
    }

    withValue(value) {
        assertTrue(this.type === RHS.types.Value, `Type must be ${RHS.types.Value}`);
        this.value = value;
        return this;
    }

    build() {
        return this;
    }

    getJSCode() {
        if (this.type === RHS.types.AnswerConcept) {
            return _.map(this.answerConceptNames, ac => `"${ac}"`).toString();
        } else {
            return this.value || '';
        }
    }
}

export default RHS;
