import {assert, expect} from "chai";
import Action from '../../src/rules/declarative/Action';
import Condition from '../../src/rules/declarative/Condition';
import DeclarativeRule from '../../src/rules/declarative/DeclarativeRule';
import CompoundRule from '../../src/rules/declarative/CompoundRule';
import Rule from '../../src/rules/declarative/Rule';
import LHS from '../../src/rules/declarative/LHS';
import RHS from '../../src/rules/declarative/RHS'
import _ from 'lodash';
import ConceptScope from "../../src/rules/declarative/ConceptScope";

function getRule1() {
    const lhs = new LHS();
    lhs.setType(LHS.types.Concept);
    lhs.setConceptName("Demo");
    lhs.setConceptUuid("Demo");
    lhs.setScope(ConceptScope.scopes.Encounter);
    const rhs = new RHS();
    rhs.setType(RHS.types.AnswerConcept);
    rhs.setAnswerConceptNames('a', 'b');
    rhs.setAnswerConceptUuids('a', 'b');
    const rule = new Rule();
    rule.setLHS(lhs);
    rule.setOperator(Rule.operators.HasAnyOneAnswer);
    rule.setRHS(rhs);
    return rule;
}

function getRule2() {
    const lhs = new LHS();
    lhs.setType(LHS.types.Concept);
    lhs.setConceptName("Numeric");
    lhs.setConceptUuid("Numeric");
    lhs.setScope(ConceptScope.scopes.EntireEnrolment);
    const rhs = new RHS();
    rhs.setType(RHS.types.Value);
    rhs.setValue(2);
    const rule = new Rule();
    rule.setLHS(lhs);
    rule.setOperator(Rule.operators.Equals);
    rule.setRHS(rhs);
    return rule;
}

function getRuleCondition() {
    const rule = getRule1();
    const compoundRule = new CompoundRule();
    compoundRule.addRule(rule);
    const condition = new Condition();
    condition.setCompoundRule(compoundRule);
    return condition;
}

describe('Declarative Rule tests', () => {
    it('should create a proper json', function () {
        const NameIsTestRuleJSON = '{"conditions":[{"compoundRule":{"rules":[{"lhs":{"type":"concept","conceptName":"Demo","conceptUuid":"Demo","scope":"encounter"},"rhs":{"type":"answerConcept","answerConceptNames":["a","b"],"answerConceptUuids":["a","b"]},"operator":"containsAnyAnswerConceptName"}]}}],"actions":[{"actionType":"showFormElement"}]}';
        const condition = getRuleCondition();
        const action = new Action();
        action.setActionType(Action.actionTypes.ShowFormElement);
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(condition);
        declarativeRule.addAction(action);
        const jsonString = JSON.stringify(declarativeRule);
        assert.deepEqual(NameIsTestRuleJSON, jsonString, jsonString);
    });
    it('should throw error if wrong type is assigned to LHS', function () {
        expect(() => new LHS().withType('Test')).to.throw(Error);
    });

    it('should be able to set multiple actions for one rule condition', function () {
        const condition = getRuleCondition();
        const action1 = new Action();
        action1.setActionType(Action.actionTypes.ShowFormElement);
        const action2 = new Action();
        action2.setActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(condition);
        declarativeRule.addAction(action1);
        declarativeRule.addAction(action2);
        assert.equal(_.size(declarativeRule.conditions), 1);
        assert.equal(_.size(declarativeRule.actions), 2);
    });
    it('should convert json to javascript rule with proper condition', function () {
        const condition = getRuleCondition();
        const jsCondition = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEncounter("Demo").containsAnyAnswerConceptName("a","b").matches()';
        const action = new Action();
        action.setActionType(Action.actionTypes.ShowFormElement);
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(condition);
        declarativeRule.addAction(action);
        const {ruleConditions} = declarativeRule.getRuleConditions('encounter');
        expect(ruleConditions).to.contain(jsCondition, jsCondition);
    });
    it('should support multiple rules for one condition', function () {
        const rule1 = getRule1();
        const rule2 = getRule2();
        const jsCondition1 = 'valueInEncounter("Demo").containsAnyAnswerConceptName("a","b")';
        const jsCondition2 = 'valueInEntireEnrolment("Numeric").equals(2)';
        const compoundRule = new CompoundRule();
        compoundRule.addRule(rule1);
        compoundRule.setConjunction(CompoundRule.conjunctions.And);
        compoundRule.addRule(rule2);
        const condition = new Condition();
        condition.setCompoundRule(compoundRule);
        const action1 = new Action();
        action1.setActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(condition);
        declarativeRule.addAction(action1);
        const {ruleConditions} = declarativeRule.getRuleConditions('encounter');
        expect(ruleConditions).to.contain(jsCondition1, jsCondition1);
        expect(ruleConditions).to.contain(jsCondition2, jsCondition2);
    });
    it('should support multiple conditions', function () {
        const rule1 = getRule1();
        const rule2 = getRule2();
        const condition1 = new Condition();
        condition1.setConjunction(Condition.conjunctions.And);
        const cr1 = new CompoundRule();
        cr1.addRule(rule1);
        const cr2 = new CompoundRule();
        cr2.addRule(rule2);
        condition1.setCompoundRule(cr1);
        const condition2 = new Condition();
        condition2.setCompoundRule(cr2);
        const condition1JS = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEncounter("Demo").containsAnyAnswerConceptName("a","b").matches()';
        const condition2JS = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEntireEnrolment("Numeric").equals(2).matches()';
        const action = new Action();
        action.setActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule();
        declarativeRule.addCondition(condition1);
        declarativeRule.addCondition(condition2);
        declarativeRule.addAction(action);
        const {ruleConditions} = declarativeRule.getRuleConditions('encounter');
        expect(ruleConditions).to.contain(condition1JS, condition1JS);
        expect(ruleConditions).to.contain(condition2JS, condition2JS);
    });
});
