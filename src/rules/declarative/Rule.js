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

    withLHS(lhs) {
        this.lhs = lhs;
        return this;
    }

    withRHS(rhs) {
        this.rhs = rhs;
        return this;
    }

    withOperator(operator) {
        const operators = _.values(Rule.operators);
        assertTrue(_.includes(operators, operator), `Operator must be one of the ${operators}`);
        this.operator = operator;
        return this;
    }

    isRhsRequired() {
        return !_.isNil(this.operator) && !_.includes(Rule.operatorsWithNoRHS, this.operator);
    }

    getJSCode() {
        const lhsAndOperator = `when.${this.lhs.getJSCode()}.${this.operator}`;
        return this.isRhsRequired() ? `${lhsAndOperator}(${this.rhs.getJSCode()})` : lhsAndOperator;
    }

}

export default Rule;
