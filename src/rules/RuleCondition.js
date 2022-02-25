import FormRuleChain from "./RuleChain";
import _ from "lodash";
import moment from "moment";

class RuleCondition {

    constructor(context) {
        this.context = _.merge(context, {matches: true});
        this.chain = new FormRuleChain();
    }

    _noop() {
        return this._addToChain((next, context) => next(context));
    }

    _addToChain(fn) {
        this.chain.add(fn);
        return this;
    }

    get look() {
        return this._addToChain((next, context) => {
            return next(context);
        });
    }

    _obsFromEntireEnrolment(enrolment, conceptNameOrUuid) {
        return enrolment.findObservationInEntireEnrolment(conceptNameOrUuid);
    }

    _obsFromEnrolment(enrolment, conceptNameOrUuid) {
        return enrolment.findObservation(conceptNameOrUuid);
    }

    _obsFromExit(enrolment, conceptNameOrUuid) {
        return enrolment.findExitObservation(conceptNameOrUuid);
    }

    _getEnrolment(context) {
        return _.get(context, "programEnrolment") || _.get(context, "programEncounter.programEnrolment");
    }

    _getIndividualOrEnrolment(context) {
        return this._getEnrolment(context) || this._getIndividual(context);
    }

    _getIndividual(context) {
        return context.individual
            || _.get(context, 'programEncounter.individual')
            || _.get(context, 'encounter.individual')
            || this._getEnrolment(context).individual;
    }

    _getEncounter(context) {
        return context.encounter || context.programEncounter;
    }

    _containsAnswerConceptName(conceptNameOrUuid, context) {
        const answerConcept = context.obsToBeChecked.concept.getPossibleAnswerConcept(conceptNameOrUuid);
        const answerUuid = answerConcept && answerConcept.concept.uuid;
        return context.obsToBeChecked.getValueWrapper().hasValue(answerUuid);
    }

    _containsAnswerConceptNameOtherThan(conceptNameOrUuid, context) {
        const conceptAnswers = _.filter(context.obsToBeChecked.concept.getAnswers(),
            (conceptAnswer)  => conceptAnswer.concept.name !== conceptNameOrUuid && conceptAnswer.concept.uuid !== conceptNameOrUuid);
        return _.some(conceptAnswers,  (conceptAnswer) => context.obsToBeChecked.getValueWrapper()
            .hasValue(conceptAnswer.concept.uuid));
    }

    _hasCodedObs(context) {
        return context.obsToBeChecked && context.obsToBeChecked.concept.isCodedConcept();
    }

    _contextualTime(context) {
        return moment(_.get(context, 'programEncounter.encounterDateTime') ||
            _.get(context, 'encounter.encounterDateTime') ||
            _.get(context, 'programEnrolment.enrolmentDateTime') ||
            _.get(context, 'programEncounter.programEnrolment.enrolmentDateTime') ||
            _.get(context, 'individual.registrationDate') ||
            this._throwError('context does not have reference datetime'));
    }

    _throwError(message) {
        throw new Error(message);
    }

    get is() {
        return this._noop();
    }

    get when() {
        return this._noop();
    }

    get not() {
        return this._addToChain((next, context) => {
            let contextFromChain = next(context);
            return _.merge(contextFromChain, {matches: !contextFromChain.matches});
        });
    }

    get and() {
        return this._addToChain((next, context) => {
            const currentMatches = context.matches;
            let contextFromChain = next(context);
            return _.merge(contextFromChain, {matches: contextFromChain.matches && currentMatches});
        });
    }

    get or() {
        return this._addToChain((next, context) => {
            const currentMatches = context.matches;
            let contextFromChain = next(context);
            return _.merge(contextFromChain, {matches: contextFromChain.matches || currentMatches});
        });
    }

    matches() {
        this.context = this.chain.execute(this.context);
        return this.context.matches;
    }

    whenItem(item) {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = item;
            return next(context);
        });
    }

    get filledAtleastOnceInEntireEnrolment() {
        return this._addToChain((next, context) => {
            context.matches = this._obsFromEntireEnrolment(this._getEnrolment(context), context.conceptName) ? true : false;
            return next(context);
        })
    }

    valueInEntireEnrolment(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromEntireEnrolment(this._getEnrolment(context), conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInAllEncounters(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividualOrEnrolment(context)
                .findLatestObservationFromEncounters(conceptNameOrUuid, this._getEncounter(context));
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInEntireEnrolment(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const enrolment = this._getEnrolment(context);
            const obs = enrolment.findLatestObservationFromEncounters(conceptNameOrUuid, context.programEncounter, true);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInPreviousEncounters(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividualOrEnrolment(context)
                .findLatestObservationFromPreviousEncounters(conceptNameOrUuid, this._getEncounter(context));
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInLastEncounter(conceptNameOrUuid, encounterTypes) {
        return this._addToChain((next, context) => {
            const lastEncounter = this._getIndividualOrEnrolment(context)
                .findLastEncounterOfType(this._getEncounter(context), encounterTypes);
            const obs = _.defaultTo(lastEncounter, {findObservation: _.noop}).findObservation(conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInEnrolment(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromEnrolment(this._getEnrolment(context), conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInExit(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromExit(this._getEnrolment(context), conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    get asAge() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = context.valueToBeChecked && moment(this._contextualTime(context)).diff(moment(context.valueToBeChecked), "years");
            return next(context);
        });
    }

    get asDaysSince() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = context.valueToBeChecked && moment(this._contextualTime(context)).diff(moment(context.valueToBeChecked), "days");
            return next(context);
        });
    }

    get male() {
        return this._addToChain((next, context) => {
            context.matches = this._getIndividual(context).gender.name === "Male";
            return next(context);
        });
    }

    get female() {
        return this._addToChain((next, context) => {
            context.matches = this._getIndividual(context).gender.name === "Female";
            return next(context);
        });
    }

    get addressType() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._getIndividual(context).lowestAddressLevel.type;
            return next(context);
        })
    }

    get lowestAddressLevelType() {
        return this.addressType;
    }

    get lowestAddressLevel() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._getIndividual(context).lowestAddressLevel.name;
            return next(context);
        })
    }

    get gender() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._getIndividual(context).gender.name;
            return next(context);
        })
    }

    get age() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._contextualTime(context).diff(moment(this._getIndividual(context).dateOfBirth), 'years');
            return next(context);
        });
    }

    get ageInYears() {
        return this.age;
    }

    get ageInMonths() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._contextualTime(context).diff(moment(this._getIndividual(context).dateOfBirth), 'months');
            return next(context);
        });
    }

    get ageInWeeks() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._contextualTime(context).diff(moment(this._getIndividual(context).dateOfBirth), "weeks");
            return next(context);
        });
    }

    get ageInDays() {
        return this._addToChain((next, context) => {
            context.valueToBeChecked = this._contextualTime(context).diff(moment(this._getIndividual(context).dateOfBirth), 'days');
            return next(context);
        });
    }

    get encounterType() {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            context.valueToBeChecked = encounter && encounter.encounterType.name;
            return next(context);
        });

    }

    get encounterMonth() {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            context.valueToBeChecked = moment(encounter.encounterDateTime).month() + 1;
            return next(context);
        });
    }

    get yes() {
        return this.containsAnswerConceptName("Yes");
    }

    get no() {
        return this.containsAnswerConceptName("No");
    }

    valueInEncounter(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            const obs = encounter && encounter.findObservation(conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInDecisions(conceptName) {
        return this._addToChain((next, context) => {
            const obs = context.existingDecisions.find((decision) => decision.name === conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInRegistration(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividual(context).findObservation(conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInCancelEncounter(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            const obs = encounter.findCancelEncounterObservation(conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInChecklistItem(conceptNameOrUuid){
        return this._addToChain((next, context) => {
            const obs = context.checklistItem.findObservation(conceptNameOrUuid);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    containsAnswerConceptName(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = this._containsAnswerConceptName(conceptNameOrUuid, context);
            return next(context);
        });
    }

    containsAnyAnswerConceptName(...conceptNames) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = _.some(conceptNames, (conceptNameOrUuid) => this._containsAnswerConceptName(conceptNameOrUuid, context));
            return next(context);
        });
    }

    containsAnswerConceptNameOtherThan(conceptNameOrUuid) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = this._containsAnswerConceptNameOtherThan(conceptNameOrUuid, context);
            return next(context);
        });
    }


    equals(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment(context.valueToBeChecked).isSame(moment(value), unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked === value;
            return next(context);
        });
    }

    equalsOneOf(...values) {
        return this._addToChain((next, context) => {
            context.matches = _.some(values, (value) => context.valueToBeChecked === value);
            return next(context);
        });
    }

    get notDefined() {
        return this._addToChain((next, context) => {
            context.matches = context.valueToBeChecked === undefined || context.valueToBeChecked === null;
            return next(context);
        });
    }

    get defined() {
        return this._addToChain((next, context) => {
            context.matches = _.every([undefined, null], (value) => context.valueToBeChecked !== value);
            return next(context);
        });
    }

    matchesFn(fn) {
        return this._addToChain((next, context) => {
            context.matches = fn(context.valueToBeChecked) ? true : false;
            return next(context);
        });
    }

    get truthy() {
        return this._addToChain((next, context) => {
            context.matches = context.valueToBeChecked ? true : false;
            return next(context);
        });
    }

    lessThan(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment(context.valueToBeChecked).isBefore(moment(value), unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked < value;
            return next(context);
        });
    }

    lessThanOrEqualTo(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment(context.valueToBeChecked).isSameOrBefore(moment(value), unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked <= value;
            return next(context);
        });
    }

    greaterThan(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment(context.valueToBeChecked).isAfter(moment(value), unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked > value;
            return next(context);
        });
    }

    greaterThanOrEqualTo(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment(context.valueToBeChecked).isSameOrAfter(moment(value), unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked >= value;
            return next(context);
        });
    }

    then(fn) {
        if (this.matches()) {
            return fn();
        }
    }
}

export default RuleCondition;
