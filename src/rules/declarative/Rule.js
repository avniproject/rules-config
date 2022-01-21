import {assertTrue} from "./Util";
import _ from "lodash";
import LHS from './LHS';
import RHS from './RHS';

class Rule {
    static operators = {
        'ContainsAnyAnswerConceptName': 'containsAnyAnswerConceptName',
        'ContainsAnswerConceptNameOtherThan': 'containsAnswerConceptNameOtherThan',
        'ContainsAnswerConceptName': 'containsAnswerConceptName',
        'Equals': 'equals',
        'LessThan': 'lessThan',
        'LessThanOrEqualTo': 'lessThanOrEqualTo',
        'GreaterThan': 'greaterThan',
        'GreaterThanOrEqualTo': 'greaterThanOrEqualTo',
        'NotDefined': 'notDefined',
        'Defined': 'defined'
    };

    static operatorsWithNoRHS = ['notDefined', 'defined'];

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

    setOperator(operator) {
        const operators = _.values(Rule.operators);
        assertTrue(_.includes(operators, operator), `Operator must be one of the ${operators}`);
        this.operator = operator;
    }

    isRhsRequired() {
        return !_.isNil(this.operator) && !_.includes(Rule.operatorsWithNoRHS, this.operator);
    }

    getRhsValueType() {
        const {type, conceptDataType} = this.lhs;
        const isNumeric = _.includes(LHS.numericRHSValueTypes, type) || _.includes(['Numeric', 'Id'], conceptDataType);
        return isNumeric ? 'number' : 'text';
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
        assertTrue(!_.isNil(this.operator), "Operator cannot be empty");
        this.rhs.validate();
        this.isRhsRequired() && this.rhs.validate();
    }
}

export default Rule;
