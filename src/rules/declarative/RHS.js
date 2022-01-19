import _ from "lodash";
import {assertTrue} from "./Util";

class RHS {
    static types = {
        'AnswerConcept': 'answerConcept',
        'Value': 'value',
    };

    constructor() {
    }

    static fromResource(json) {
        const rhs = new RHS();
        rhs.type = json.type;
        rhs.value = json.value;
        rhs.answerConceptNames = json.answerConceptNames;
        rhs.answerConceptUuids = json.answerConceptUuids;
        return rhs;
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
        switch (this.type) {
            case RHS.types.AnswerConcept :
                return this.getJSConceptAnswerNames();
            case RHS.types.Value :
                return this.getJSValue();
            default:
                return '';
        }
    }

    getJSValue() {
        return typeof this.value === 'number' ? this.value : `"${this.value}"`;
    }

    getJSConceptAnswerNames() {
        return _.map(this.answerConceptNames, ac => `"${ac}"`).toString();
    }

    getRuleSummary() {
        const value = this.value ? this.getJSValue() : this.getJSConceptAnswerNames();
        return `${_.lowerCase(this.type)} ${value}`
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
