import {assert, expect} from "chai";
import Action from '../../src/rules/declarative/Action';
import Condition from '../../src/rules/declarative/Condition';
import DeclarativeRule from '../../src/rules/declarative/DeclarativeRule';
import CompoundRule from '../../src/rules/declarative/CompoundRule';
import Rule from '../../src/rules/declarative/Rule';
import LHS from '../../src/rules/declarative/LHS';
import RHS from '../../src/rules/declarative/RHS'
import _ from 'lodash';

function getRule1() {
    const lhs = new LHS().withType(LHS.types.Concept).withConceptName('Demo').withScope(LHS.scopes.ThisEncounter);
    const rhs = new RHS().withType(RHS.types.AnswerConcept).withAnswerConceptNames('a', 'b');
    return new Rule().withLHS(lhs)
        .withOperator(Rule.operators.ContainsAnyAnswerConceptName)
        .withRHS(rhs);
}

function getRule2() {
    const lhs = new LHS().withType(LHS.types.Concept).withConceptName("Numeric").withScope(LHS.scopes.EntireEnrolment);
    const rhs = new RHS().withType(RHS.types.Value).withValue(2);
    return new Rule().withLHS(lhs)
        .withOperator(Rule.operators.Equals)
        .withRHS(rhs);
}

function getRuleCondition() {
    const rule = getRule1();
    const compoundRule = new CompoundRule()
        .addRule(rule);
    return new Condition().withCompoundRule(compoundRule);
}

describe('Declarative Rule tests', () => {
    it('should create a proper json', function () {
        const NameIsTestRuleJSON = '{"conditions":[{"compoundRule":{"rules":[{"lhs":{"type":"concept","conceptName":"Demo","scope":"thisEncounter"},"rhs":{"type":"answerConcept","answerConceptNames":["a","b"]},"operator":"containsAnyAnswerConceptName"}]}}],"actions":[{"actionType":"showFormElement"}]}';
        const condition = getRuleCondition();
        const action = new Action().withActionType(Action.actionTypes.ShowFormElement);
        const declarativeRule = new DeclarativeRule().withCondition(condition).withAction(action);
        const jsonString = JSON.stringify(declarativeRule);
        assert.deepEqual(NameIsTestRuleJSON, jsonString, jsonString);
    });
    it('should throw error if wrong type is assigned to LHS', function () {
        expect(() => new LHS().withType('Test')).to.throw(Error);
    });

    it('should be able to set multiple actions for one rule condition', function () {
        const condition = getRuleCondition();
        const action1 = new Action().withActionType(Action.actionTypes.ShowFormElement);
        const action2 = new Action().withActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule().withCondition(condition).withAction(action1).withAction(action2);
        assert.equal(_.size(declarativeRule.conditions), 1);
        assert.equal(_.size(declarativeRule.actions), 2);
    });
    it('should convert json to javascript rule with proper condition', function () {
        const condition = getRuleCondition();
        const jsCondition = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEncounter("Demo").containsAnyAnswerConceptName("a","b").matches()';
        const action = new Action().withActionType(Action.actionTypes.ShowFormElement);
        const declarativeRule = new DeclarativeRule().withCondition(condition).withAction(action);
        const js = declarativeRule.getViewFilterRule('encounter');
        expect(js).to.contain(jsCondition, jsCondition);
    });
    it('should support multiple rules for one condition', function () {
        const rule1 = getRule1();
        const rule2 = getRule2();
        const jsCondition1 = 'valueInEncounter("Demo").containsAnyAnswerConceptName("a","b")';
        const jsCondition2 = 'valueInEntireEnrolment("Numeric").equals(2)';
        const compoundRule = new CompoundRule()
            .withConjunction(CompoundRule.conjunctions.And)
            .addRule(rule1)
            .addRule(rule2);
        const condition = new Condition().withCompoundRule(compoundRule);
        const action1 = new Action().withActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule().withCondition(condition).withAction(action1);
        const js = declarativeRule.getViewFilterRule('encounter');
        expect(js).to.contain(jsCondition1, jsCondition1);
        expect(js).to.contain(jsCondition2, jsCondition2);
    });
    it('should support multiple conditions', function () {
        const rule1 = getRule1();
        const rule2 = getRule2();
        const condition1 = new Condition().withConjunction(Condition.conjunctions.And).withCompoundRule(new CompoundRule().addRule(rule1));
        const condition2 = new Condition().withCompoundRule(new CompoundRule().addRule(rule2));
        const condition1JS = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEncounter("Demo").containsAnyAnswerConceptName("a","b").matches()';
        const condition2JS = 'new imports.rulesConfig.RuleCondition({encounter, formElement}).when.valueInEntireEnrolment("Numeric").equals(2).matches()';
        const action = new Action().withActionType(Action.actionTypes.HideFormElement);
        const declarativeRule = new DeclarativeRule().withCondition(condition1).withCondition(condition2).withAction(action);
        const js = declarativeRule.getViewFilterRule('encounter');
        expect(js).to.contain(condition1JS, condition1JS);
        expect(js).to.contain(condition2JS, condition2JS);
    });
});
