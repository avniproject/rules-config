const FormRuleChain = require("./RuleChain");
const _ = require("lodash");
const moment = require("moment");

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

    _obsFromEntireEnrolment(enrolment, concept) {
        return enrolment.findObservationInEntireEnrolment(concept);
    }

    _obsFromEnrolment(enrolment, concept) {
        return enrolment.findObservation(concept);
    }

    _obsFromExit(enrolment, concept) {
        return enrolment.findExitObservation(concept);
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

    _containsAnswerConceptName(conceptName, context) {
        const answerConcept = context.obsToBeChecked.concept.getPossibleAnswerConcept(conceptName);
        const answerUuid = answerConcept && answerConcept.concept.uuid;
        return context.obsToBeChecked.getValueWrapper().hasValue(answerUuid);
    }

    _containsAnswerConceptNameOtherThan(conceptName, context) {
        const conceptAnswers = _.filter(context.obsToBeChecked.concept.getAnswers(),
            (conceptAnswer)  => conceptAnswer.concept.name !== conceptName);
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

    valueInEntireEnrolment(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromEntireEnrolment(this._getEnrolment(context), conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInAllEncounters(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividualOrEnrolment(context)
                .findLatestObservationFromEncounters(conceptName, this._getEncounter(context));
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInEntireEnrolment(conceptName) {
        return this._addToChain((next, context) => {
            const enrolment = this._getEnrolment(context);
            const obs = enrolment.findLatestObservationFromEncounters(conceptName, context.programEncounter, true);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    latestValueInPreviousEncounters(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividualOrEnrolment(context)
                .findLatestObservationFromPreviousEncounters(conceptName, this._getEncounter(context));
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInLastEncounter(conceptName, encounterTypes) {
        return this._addToChain((next, context) => {
            const lastEncounter = this._getIndividualOrEnrolment(context)
                .findLastEncounterOfType(this._getEncounter(context), encounterTypes);
            const obs = _.defaultTo(lastEncounter, {findObservation: _.noop}).findObservation(conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInEnrolment(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromEnrolment(this._getEnrolment(context), conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInExit(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._obsFromExit(this._getEnrolment(context), conceptName);
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

    valueInEncounter(conceptName) {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            const obs = encounter && encounter.findObservation(conceptName);
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

    valueInRegistration(conceptName) {
        return this._addToChain((next, context) => {
            const obs = this._getIndividual(context).findObservation(conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInCancelEncounter(conceptName) {
        return this._addToChain((next, context) => {
            const encounter = this._getEncounter(context);
            const obs = encounter.findCancelEncounterObservation(conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    valueInChecklistItem(conceptName){
        return this._addToChain((next, context) => {
            const obs = context.checklistItem.findObservation(conceptName);
            context.obsToBeChecked = obs;
            context.valueToBeChecked = obs && obs.getValue();
            return next(context);
        });
    }

    containsAnswerConceptName(conceptName) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = this._containsAnswerConceptName(conceptName, context);
            return next(context);
        });
    }

    containsAnyAnswerConceptName(...conceptNames) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = _.some(conceptNames, (conceptName) => this._containsAnswerConceptName(conceptName, context));
            return next(context);
        });
    }

    containsAnswerConceptNameOtherThan(conceptName) {
        return this._addToChain((next, context) => {
            if (!this._hasCodedObs(context)) {
                context.matches = false;
                return next(context);
            }

            context.matches = this._containsAnswerConceptNameOtherThan(conceptName, context);
            return next(context);
        });
    }


    equals(value) {
        return this._addToChain((next, context) => {
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
                context.matches = moment.duration(context.valueToBeChecked) < moment.duration(value, unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked < value;
            return next(context);
        });
    }

    lessThanOrEqualTo(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment.duration(context.valueToBeChecked) <= moment.duration(value, unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked <= value;
            return next(context);
        });
    }

    greaterThan(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment.duration(context.valueToBeChecked) > moment.duration(value, unitIfDate);
                return next(context);
            }

            context.matches = context.valueToBeChecked > value;
            return next(context);
        });
    }

    greaterThanOrEqualTo(value, unitIfDate) {
        return this._addToChain((next, context) => {
            if (unitIfDate) {
                context.matches = moment.duration(context.valueToBeChecked) >= moment.duration(value, unitIfDate);
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

module.exports = RuleCondition;
