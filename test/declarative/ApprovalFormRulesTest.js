import {assert} from "chai";
import _ from "lodash";
import moment from "moment";
import {Concept, Individual, Observation, PrimitiveValue} from 'openchs-models';
import EntityFactory from "../EntityFactory";
import ConceptScope from "../../src/rules/declarative/ConceptScope";
import AddDecisionActionDetails from "../../src/rules/declarative/AddDecisionActionDetails";
import VisitScheduleActionDetails from "../../src/rules/declarative/VisitScheduleActionDetails";
import RHS from "../../src/rules/declarative/RHS";
import LHS from "../../src/rules/declarative/LHS";
import Rule from "../../src/rules/declarative/Rule";
import Action from "../../src/rules/declarative/Action";
import Condition from "../../src/rules/declarative/Condition";
import CompoundRule from "../../src/rules/declarative/CompoundRule";
import DeclarativeRule from "../../src/rules/declarative/DeclarativeRule";
import DeclarativeRuleHolder from "../../src/rules/declarative/DeclarativeRuleHolder";
import RuleCondition from "../../src/rules/RuleCondition";
import FormElementStatus from "../../src/rules/model/FormElementStatus";

const APPROVAL_FORM_TYPES = ['Approval', 'Rejection'];

// EntityApprovalStatus gains observations in avni-models#71; until then a stand-in with the
// same findObservation contract as any other ObservationsHolder is enough to drive the rules.
function anApprovalStatusHolding(...observations) {
    return {
        uuid: 'entity-approval-status-1',
        observations,
        findObservation: (conceptNameOrUuid) => _.find(observations,
            (o) => o.concept.name === conceptNameOrUuid || o.concept.uuid === conceptNameOrUuid)
    };
}

function anIndividualHolding(...observations) {
    const individual = EntityFactory.createIndividual('Ramesh');
    individual.observations = observations;
    return individual;
}

function numericObservation(name, value) {
    const concept = EntityFactory.createConcept(name, Concept.dataType.Numeric);
    concept.uuid = name;
    return Observation.create(concept, JSON.stringify(new PrimitiveValue(value, Concept.dataType.Numeric)));
}

function hideFormElementWhen(conceptUuid, scope, value) {
    const lhs = new LHS();
    lhs.setType(LHS.types.Concept);
    lhs.setConceptName(conceptUuid);
    lhs.setConceptUuid(conceptUuid);
    lhs.setScope(scope);
    const rhs = new RHS();
    rhs.setType(RHS.types.Value);
    rhs.setValue(value);
    const rule = new Rule();
    rule.setLHS(lhs);
    rule.setOperator(Rule.operators.Equals);
    rule.setRHS(rhs);

    const compoundRule = new CompoundRule();
    compoundRule.setConjunction(CompoundRule.conjunctions.And);
    compoundRule.addRule(rule);
    const condition = new Condition();
    condition.setCompoundRule(compoundRule);

    const action = new Action();
    action.setActionType(Action.actionTypes.HideFormElement);

    const declarativeRule = new DeclarativeRule();
    declarativeRule.addCondition(condition);
    declarativeRule.addAction(action);
    return new DeclarativeRuleHolder([declarativeRule]);
}

function runGeneratedViewFilterRule(generatedRuleJs, {entity, entityContext, formElement}) {
    // eslint-disable-next-line no-eval
    const ruleFn = eval(generatedRuleJs);
    return ruleFn({
        params: {entity, entityContext, formElement},
        imports: {lodash: _, moment, rulesConfig: {RuleCondition, FormElementStatus}}
    });
}

describe('Declarative rules on Approval and Rejection forms', () => {

    describe('scopes offered in the rule builder', () => {

        it('offers the approval status and registration, and nothing that could fail to resolve', () => {
            _.forEach(APPROVAL_FORM_TYPES, (formType) => {
                assert.deepEqual(ConceptScope.getScopeOptionsByFormType(formType), [
                    {value: 'entityApprovalStatus', label: 'This Approval Status'},
                    {value: 'registration', label: 'Registration'}
                ], `wrong scopes offered for ${formType}`);
            });
        });

        it('offers no encounter or enrolment scope, which cannot resolve on a subject registration mapping', () => {
            _.forEach(APPROVAL_FORM_TYPES, (formType) => {
                const offered = _.values(ConceptScope.getScopeByFormType(formType));
                _.forEach(['encounter', 'lastEncounter', 'latestInAllEncounters', 'latestInPreviousEncounters',
                    'latestInEntireEnrolment', 'entireEnrolment', 'enrolment', 'exit', 'cancelEncounter', 'checklistItem'],
                    (unresolvable) => assert.notInclude(offered, unresolvable,
                        `${formType} must not offer ${unresolvable}`));
            });
        });
    });

    describe('existing form types are untouched', () => {

        it('keeps the seven classic form types exactly as they were', () => {
            assert.deepEqual(ConceptScope.getScopeByFormType('Encounter'), {
                'ThisEncounter': 'encounter',
                'LastEncounter': 'lastEncounter',
                'LatestInAllEncounters': 'latestInAllEncounters',
                'LatestInPreviousEncounters': 'latestInPreviousEncounters',
                'Registration': 'registration',
                'ThisQuestionGroupEncounter': 'questionGroupEncounter'
            });
            assert.deepEqual(ConceptScope.getScopeByFormType('IndividualProfile'), {
                'ThisRegistration': 'registration',
                'ThisQuestionGroupRegistration': 'questionGroupRegistration'
            });
        });

        it('does not leak the approval status scope into form types that fall back to the full list', () => {
            // SubjectEnrolmentEligibility and Task are not in formTypeToScopeMap and so fall back
            // to ConceptScope.scopes. The new scope must not appear there.
            _.forEach(['SubjectEnrolmentEligibility', 'ManualProgramEnrolmentEligibility', 'Task'], (formType) => {
                assert.notInclude(_.values(ConceptScope.getScopeByFormType(formType)), 'entityApprovalStatus',
                    `${formType} must not be offered the approval status scope`);
            });
        });
    });

    describe('decisions and visit schedules are deliberately empty', () => {

        it('offers no decision scope', () => {
            _.forEach(APPROVAL_FORM_TYPES, (formType) => {
                assert.property(AddDecisionActionDetails.formTypeToScopeMap, formType);
                assert.deepEqual(new AddDecisionActionDetails().getDecisionScope(formType), []);
            });
        });

        it('offers no built-in visit schedule date field', () => {
            _.forEach(APPROVAL_FORM_TYPES, (formType) => {
                assert.property(VisitScheduleActionDetails.formTypeToDateFieldMap, formType);
                assert.deepEqual(VisitScheduleActionDetails.formTypeToDateFieldMap[formType], []);
            });
        });
    });

    describe('the rule engine can resolve both scopes', () => {

        it('reads a question answered on the approval form itself', () => {
            const observation = numericObservation('Rejection Severity', '3');
            const context = {entityApprovalStatus: anApprovalStatusHolding(observation)};
            const matched = new RuleCondition(context).when
                .valueInEntityApprovalStatus('Rejection Severity').equals(3).matches();
            assert.isTrue(matched);
        });

        it('reads a question answered at registration, via the subject the client supplies', () => {
            const observation = numericObservation('Age At Registration', '42');
            const context = {
                entityApprovalStatus: anApprovalStatusHolding(),
                individual: anIndividualHolding(observation)
            };
            const matched = new RuleCondition(context).when
                .valueInRegistration('Age At Registration').equals(42).matches();
            assert.isTrue(matched);
        });

        it('does not throw when no subject can be resolved at all', () => {
            const context = {entityApprovalStatus: anApprovalStatusHolding()};
            assert.doesNotThrow(() =>
                new RuleCondition(context).when.valueInRegistration('Anything').equals('1').matches());
        });
    });

    describe('generated rule code', () => {

        it('binds the subject from entityContext and passes it to the rule condition', () => {
            const generated = new DeclarativeRuleHolder([DeclarativeRule.getInitialState()])
                .generateViewFilterRule('entityApprovalStatus');
            assert.include(generated, 'const entityApprovalStatus = params.entity;');
            assert.include(generated, 'const individual = params.entityContext && params.entityContext.individual;');
        });

        it('does not bind a subject for form types that already have one, which would redeclare it', () => {
            const holder = hideFormElementWhen('q1', ConceptScope.scopes.Registration, '1');
            const generated = holder.generateViewFilterRule('individual');
            assert.notInclude(generated, 'const individual = params.entityContext');
            assert.include(generated, '{individual, formElement}');
        });

        it('includes the subject in the rule condition context on approval forms', () => {
            const holder = hideFormElementWhen('q1', ConceptScope.scopes.Registration, '1');
            const generated = holder.generateViewFilterRule('entityApprovalStatus');
            assert.include(generated, '{entityApprovalStatus, individual, formElement}');
        });

        it('points a right-hand-side concept at the subject for registration scope', () => {
            const rhs = new RHS();
            rhs.type = RHS.types.Concept;
            rhs.conceptName = 'Some Question';
            rhs.conceptUuid = 'c-1';
            rhs.scope = ConceptScope.scopes.Registration;
            assert.include(rhs.getScopeCode('entityApprovalStatus'), 'individual.findObservation(\'c-1\')');
        });

        it('points a right-hand-side concept at the approval status for its own scope', () => {
            const rhs = new RHS();
            rhs.type = RHS.types.Concept;
            rhs.conceptName = 'Some Question';
            rhs.conceptUuid = 'c-1';
            rhs.scope = 'entityApprovalStatus';
            assert.include(rhs.getScopeCode('entityApprovalStatus'), 'entityApprovalStatus.findObservation(\'c-1\')');
        });
    });

    describe('end to end: the generated JavaScript actually runs', () => {

        const formElement = {uuid: 'fe-1'};

        it('hides a question on a rejection form based on a registration answer (AC 4)', () => {
            const holder = hideFormElementWhen('Age At Registration', ConceptScope.scopes.Registration, 42);
            const generated = holder.generateViewFilterRule('entityApprovalStatus');

            const matching = runGeneratedViewFilterRule(generated, {
                entity: anApprovalStatusHolding(),
                entityContext: {individual: anIndividualHolding(numericObservation('Age At Registration', '42'))},
                formElement
            });
            assert.isFalse(matching.visibility, 'question should be hidden when the registration answer matches');

            const notMatching = runGeneratedViewFilterRule(generated, {
                entity: anApprovalStatusHolding(),
                entityContext: {individual: anIndividualHolding(numericObservation('Age At Registration', '7'))},
                formElement
            });
            assert.isTrue(notMatching.visibility, 'question should stay visible when it does not match');
        });

        it('hides a question based on an answer on the approval form itself', () => {
            const holder = hideFormElementWhen('Rejection Severity', 'entityApprovalStatus', 3);
            const generated = holder.generateViewFilterRule('entityApprovalStatus');

            const matching = runGeneratedViewFilterRule(generated, {
                entity: anApprovalStatusHolding(numericObservation('Rejection Severity', '3')),
                entityContext: {},
                formElement
            });
            assert.isFalse(matching.visibility);
        });

        it('runs without a subject rather than throwing, when the client supplies no entityContext', () => {
            const holder = hideFormElementWhen('Age At Registration', ConceptScope.scopes.Registration, 42);
            const generated = holder.generateViewFilterRule('entityApprovalStatus');
            assert.doesNotThrow(() => runGeneratedViewFilterRule(generated, {
                entity: anApprovalStatusHolding(),
                entityContext: undefined,
                formElement
            }));
        });
    });
});
