import {assert, expect} from "chai";
import {Concept} from "openchs-models";
import EntityFactory from "../EntityFactory";
import FormElementStatusBuilder from "../../src/rules/builder/FormElementStatusBuilder";

const buildBuilderWithFormElement = (formElement) => {
    const context = {formElement, individual: {}};
    return new FormElementStatusBuilder(context);
};

const buildSubjectFormElement = (name = 'Subject FE') => {
    const concept = EntityFactory.createConcept('Person Concept', Concept.dataType.Subject);
    return EntityFactory.createFormElement(name, false, concept, 1, 'SingleSelect');
};

const buildCodedFormElement = (answerNames = ['Yes', 'No']) => {
    const concept = EntityFactory.createConcept('Coded Concept', Concept.dataType.Coded);
    EntityFactory.addCodedAnswers(concept, answerNames);
    return EntityFactory.createFormElement('Coded FE', false, concept, 1, 'SingleSelect');
};

describe('FormElementStatusBuilderTest', () => {
    beforeAll(() => {
        // lib().log dereferences global.ruleServiceLibraryInterfaceForSharingModules,
        // which the host runtime usually injects. Stub a no-op logger so warn paths
        // don't throw during tests.
        global.ruleServiceLibraryInterfaceForSharingModules = {log: () => {}};
    });

    describe('skipAnswers', () => {
        it('keeps subject UUID strings as-is', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('subject-uuid-a', 'subject-uuid-b');
            const status = builder.build();
            assert.deepEqual(status.answersToSkip, ['subject-uuid-a', 'subject-uuid-b']);
        });

        it('drops non-string entries for subject concepts (with warning)', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('subject-uuid-a', {not: 'a string'}, 42);
            const status = builder.build();
            assert.deepEqual(status.answersToSkip, ['subject-uuid-a']);
        });

        it('resolves coded answers by concept name to ConceptAnswer objects', () => {
            const fe = buildCodedFormElement(['Yes', 'No']);
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('Yes');
            const status = builder.build();
            assert.lengthOf(status.answersToSkip, 1);
            assert.equal(status.answersToSkip[0].concept.name, 'Yes');
        });

        it('drops coded names that do not match any concept-answer (with warning)', () => {
            const fe = buildCodedFormElement(['Yes', 'No']);
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('Yes', 'Maybe');
            const status = builder.build();
            assert.lengthOf(status.answersToSkip, 1);
            assert.equal(status.answersToSkip[0].concept.name, 'Yes');
        });
    });

    describe('showAnswers', () => {
        it('keeps subject UUID strings as-is', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.showAnswers('subject-uuid-a', 'subject-uuid-b');
            const status = builder.build();
            assert.deepEqual(status.answersToShow, ['subject-uuid-a', 'subject-uuid-b']);
        });

        it('drops non-string entries for subject concepts (with warning)', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.showAnswers('subject-uuid-a', null, undefined, {bad: true});
            const status = builder.build();
            assert.deepEqual(status.answersToShow, ['subject-uuid-a']);
        });

        it('passes coded names through unchanged', () => {
            const fe = buildCodedFormElement(['Yes', 'No', 'Maybe']);
            const builder = buildBuilderWithFormElement(fe);
            builder.showAnswers('Yes', 'No');
            const status = builder.build();
            assert.deepEqual(status.answersToShow, ['Yes', 'No']);
        });
    });

    describe('build', () => {
        it('throws when both skipAnswers and showAnswers rules produce answers', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('uuid-a');
            builder.showAnswers('uuid-b');
            expect(() => builder.build()).to.throw(/uses both skipAnswers and showAnswers/);
        });

        it('does not throw when only one of them produces answers', () => {
            const fe = buildSubjectFormElement();
            const builder = buildBuilderWithFormElement(fe);
            builder.skipAnswers('uuid-a');
            const status = builder.build();
            assert.deepEqual(status.answersToSkip, ['uuid-a']);
            assert.deepEqual(status.answersToShow, []);
        });
    });
});
