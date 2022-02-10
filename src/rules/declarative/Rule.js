import {assertTrue} from "./Util";
import _ from "lodash";
import LHS from './LHS';
import RHS from './RHS';

class Rule {
    static codedOperators = {
        'ContainsAnyAnswerConceptName': 'containsAnyAnswerConceptName',
        'ContainsAnswerConceptNameOtherThan': 'containsAnswerConceptNameOtherThan',
        'ContainsAnswerConceptName': 'containsAnswerConceptName',
    };

    static numericOperators = {
        'Equals': 'equals',
        'LessThan': 'lessThan',
        'LessThanOrEqualTo': 'lessThanOrEqualTo',
        'GreaterThan': 'greaterThan',
        'GreaterThanOrEqualTo': 'greaterThanOrEqualTo',
    };

    static noRHSOperators = {
        'NotDefined': 'notDefined',
        'Defined': 'defined'
    };

    static operators = {...Rule.codedOperators, ...Rule.numericOperators, ...Rule.noRHSOperators};

    constructor() {
        this.lhs = new LHS();
        this.rhs = new RHS();
    }

    static fromResource(json) {
        const rule = new Rule();
        rule.operator = json.operator;
        rule.lhs = LHS.fromResource(json.lhs);
        rule.rhs = RHS.fromResource(json.rhs);
        return rule;
    }

    setLHS(lhs) {
        this.lhs = lhs;
    }

    setRHS(rhs) {
        this.rhs = rhs;
    }

    getApplicableOperators() {
        if (this.lhs.isCodedConcept()) {
            return {...Rule.codedOperators, ...Rule.noRHSOperators};
        }
        if (this.lhs.isNumeric()) {
            return {...Rule.numericOperators, ...Rule.noRHSOperators};
        } else {
            const equals = _.pickBy(Rule.numericOperators, (v, k) => v === Rule.numericOperators.Equals);
            return {...equals, ...Rule.noRHSOperators}
        }
    }

    getApplicableRHSTypes() {
        if (this.lhs.isCodedConcept()) {
            return {'AnswerConcept': RHS.types.AnswerConcept};
        } else {
            return {'Value': RHS.types.Value};
        }
    }

    setOperator(operator) {
        const operators = _.values(Rule.operators);
        assertTrue(_.includes(operators, operator), `Operator must be one of the ${operators}`);
        this.operator = operator;
    }

    isRhsRequired() {
        return !_.includes(_.values(Rule.noRHSOperators), this.operator);
    }

    getRhsValueType() {
        return this.lhs.isNumeric() ? 'number' : 'text';
    }

    getJSCode() {
        const lhsAndOperator = `when.${this.lhs.getJSCode()}.${this.operator}`;
        return this.isRhsRequired() ? `${lhsAndOperator}(${this.rhs.getJSCode()})` : lhsAndOperator;
    }

    getRuleSummary() {
        return `${this.lhs.getRuleSummary()} ${_.lowerCase(this.operator)} ${this.rhs.getRuleSummary()}`
    }

    clone() {
        const rule = new Rule();
        rule.lhs = this.lhs.clone();
        rule.operator = this.operator;
        rule.rhs = this.rhs.clone();
        return rule;
    }

    validate() {
        this.lhs.validate();
        assertTrue(!_.isNil(this.operator), "Operator cannot be empty");
        this.isRhsRequired() && this.rhs.validate();
    }
}

export default Rule;