import {assert, expect} from "chai";
import FormElementStatus from "../../src/rules/model/FormElementStatus";

describe('FormElementStatusTest', () => {
    describe('mutual exclusion of answersToSkip and answersToShow', () => {
        it('throws when both answersToSkip and answersToShow are non-empty', () => {
            expect(() => new FormElementStatus('fe-uuid', true, null, ['skip-1'], [], ['show-1']))
                .to.throw(/uses both answersToSkip and answersToShow/);
        });

        it('does not throw when only answersToSkip is set', () => {
            const status = new FormElementStatus('fe-uuid', true, null, ['skip-1'], []);
            assert.deepEqual(status.answersToSkip, ['skip-1']);
            assert.deepEqual(status.answersToShow, []);
        });

        it('does not throw when only answersToShow is set', () => {
            const status = new FormElementStatus('fe-uuid', true, null, [], [], ['show-1']);
            assert.deepEqual(status.answersToShow, ['show-1']);
            assert.deepEqual(status.answersToSkip, []);
        });

        it('does not throw when both are empty (default)', () => {
            const status = new FormElementStatus('fe-uuid', true, null);
            assert.deepEqual(status.answersToSkip, []);
            assert.deepEqual(status.answersToShow, []);
        });
    });

    describe('resetIfValueIsNull static factory', () => {
        it('routes through the constructor and inherits the mutual-exclusion guard', () => {
            expect(() => FormElementStatus.resetIfValueIsNull('fe-uuid', true, null, ['skip'], [], ['show']))
                .to.throw(/uses both answersToSkip and answersToShow/);
        });

        it('marks initializedWithNullValueOnPurpose only when value is nil', () => {
            const nullStatus = FormElementStatus.resetIfValueIsNull('fe-uuid', true, null);
            assert.isTrue(nullStatus.initializedWithNullValueOnPurpose);

            const valueStatus = FormElementStatus.resetIfValueIsNull('fe-uuid', true, 'x');
            assert.isFalse(valueStatus.initializedWithNullValueOnPurpose);
        });
    });

    describe('or/and combinators preserve the invariant', () => {
        it('or copies answer fields from the receiver only', () => {
            const skipOnly = new FormElementStatus('fe-uuid', true, null, ['skip-1'], []);
            const showOnly = new FormElementStatus('fe-uuid', false, null, [], [], ['show-1']);
            const combined = skipOnly.or(showOnly);
            assert.deepEqual(combined.answersToSkip, ['skip-1']);
            assert.deepEqual(combined.answersToShow, []);
            assert.isTrue(combined.visibility);
        });
    });
});
