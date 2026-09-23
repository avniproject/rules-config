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

    describe('captureGuidance', () => {
        const guidance = {
            reckoner: '/Avni/guidance/aaa.png',
            overlay: '/Avni/guidance/bbb.png',
            label: '3 of 14 — Left buccal mucosa',
            flash: 'on'
        };

        it('is settable through addCaptureGuidance, the way openchs-models exposes it', () => {
            const status = new FormElementStatus('fe-uuid', true, null);
            status.addCaptureGuidance(guidance);
            assert.deepEqual(status.captureGuidance, guidance);
        });

        it('survives or(), so combining statuses cannot drop a guided row to an unguided one', () => {
            const guided = new FormElementStatus('fe-uuid', true, null);
            guided.addCaptureGuidance(guidance);
            assert.deepEqual(guided.or(new FormElementStatus('fe-uuid', false, null)).captureGuidance, guidance);
        });

        it('survives and()', () => {
            const guided = new FormElementStatus('fe-uuid', true, null);
            guided.addCaptureGuidance(guidance);
            assert.deepEqual(guided.and(new FormElementStatus('fe-uuid', true, null)).captureGuidance, guidance);
        });

        it('carries a block through the combinators, so a blocked row stays blocked', () => {
            const blocked = new FormElementStatus('fe-uuid', true, null);
            blocked.addCaptureGuidance({blockCapture: {reason: 'guidanceMissing'}});
            const combined = blocked.or(new FormElementStatus('fe-uuid', true, null));
            assert.deepEqual(combined.captureGuidance.blockCapture, {reason: 'guidanceMissing'});
        });

        it('is taken from the receiver only — matching questionGroupIndex and openchs-models', () => {
            const plain = new FormElementStatus('fe-uuid', true, null);
            const guided = new FormElementStatus('fe-uuid', true, null);
            guided.addCaptureGuidance(guidance);
            assert.isUndefined(plain.or(guided).captureGuidance);
        });

        it('stays undefined when no rule set it', () => {
            const status = new FormElementStatus('fe-uuid', true, null);
            assert.isUndefined(status.or(new FormElementStatus('fe-uuid', true, null)).captureGuidance);
        });
    });
});
