import _ from "lodash";

class ConceptScope {
    static formTypeToScopeMap = {
        IndividualProfile: {'ThisRegistration': 'registration'},
        IndividualEncounterCancellation: {
            'ThisCancelEncounter': 'cancelEncounter',
            'LastEncounter': 'lastEncounter',
            'LatestInAllEncounters': 'latestInAllEncounters',
            'LatestInPreviousEncounters': 'latestInPreviousEncounters',
            'Registration': 'registration',
        },
        Encounter: {
            'ThisEncounter': 'encounter',
            'LastEncounter': 'lastEncounter',
            'LatestInAllEncounters': 'latestInAllEncounters',
            'LatestInPreviousEncounters': 'latestInPreviousEncounters',
            'Registration': 'registration',
        },
        ProgramEnrolment: {
            'ThisEnrolment': 'enrolment',
            'Registration': 'registration',
        },
        ProgramExit: {
            'ThisExit': 'exit',
            'Registration': 'registration',
        },
        ProgramEncounter: {
            'ThisEncounter': 'encounter',
            'LastEncounter': 'lastEncounter',
            'LatestInAllEncounters': 'latestInAllEncounters',
            'LatestInPreviousEncounters': 'latestInPreviousEncounters',
            'LatestInEntireEnrolment': 'latestInEntireEnrolment',
            'EntireEnrolment': 'entireEnrolment',
            'Enrolment': 'enrolment',
            'Registration': 'registration',
        },
        ProgramEncounterCancellation: {
            'ThisCancelEncounter': 'cancelEncounter',
            'LastEncounter': 'lastEncounter',
            'LatestInAllEncounters': 'latestInAllEncounters',
            'LatestInPreviousEncounters': 'latestInPreviousEncounters',
            'LatestInEntireEnrolment': 'latestInEntireEnrolment',
            'Enrolment': 'enrolment',
            'Registration': 'registration',
        },
        ChecklistItem: {
            'ThisChecklistItem': 'checklistItem',
        },
    };

    static scopes = {
        'Registration': 'registration',
        'Enrolment': 'enrolment',
        'Encounter': 'encounter',
        'EntireEnrolment': 'entireEnrolment',
        'LatestInAllEncounters': 'latestInAllEncounters',
        'LatestInPreviousEncounters': 'latestInPreviousEncounters',
        'LastEncounter': 'lastEncounter',
        'LatestInEntireEnrolment': 'latestInEntireEnrolment',
        'Exit': 'exit',
        'CancelEncounter': 'cancelEncounter',
        'ChecklistItem': 'checklistItem'
    };

    static scopeToRuleFunctionMap = {
        'entireEnrolment': 'valueInEntireEnrolment',
        'latestInAllEncounters': 'latestValueInAllEncounters',
        'latestInEntireEnrolment': 'latestValueInEntireEnrolment',
        'latestInPreviousEncounters': 'latestValueInPreviousEncounters',
        'lastEncounter': 'valueInLastEncounter',
        'enrolment': 'valueInEnrolment',
        'exit': 'valueInExit',
        'encounter': 'valueInEncounter',
        'registration': 'valueInRegistration',
        'cancelEncounter': 'valueInCancelEncounter',
        'checklistItem': 'valueInChecklistItem',
    };

    static scopeToObservationFunctionMap = {
        'entireEnrolment': 'findObservationInEntireEnrolment',
        'latestInAllEncounters': 'findLatestObservationFromEncounters',
        'latestInEntireEnrolment': 'findLatestObservationInEntireEnrolment',
        'latestInPreviousEncounters': 'findLatestObservationFromPreviousEncounters',
        'lastEncounter': 'findObservationInLastEncounter',
        'enrolment': 'findObservation',
        'exit': 'findObservation',
        'encounter': 'findObservation',
        'registration': 'findObservation',
        'cancelEncounter': 'findObservation',
        'checklistItem': 'findObservation',
    };

    static isCurrentEncounterRequired(scope) {
        return _.includes(['entireEnrolment', 'latestInAllEncounters', 'latestInEntireEnrolment', 'latestInPreviousEncounters', 'lastEncounter'], scope)
    }

    static getScopeByFormType(formType) {
        const formTypeScopes = ConceptScope.formTypeToScopeMap[formType];
        return _.isEmpty(formTypeScopes) ? ConceptScope.scopes : formTypeScopes;
    }

    static getScopeOptionsByFormType(formType) {
        const applicableScopes = ConceptScope.getScopeByFormType(formType);
        return _.map(applicableScopes, (v, k) => ({value: v, label: _.startCase(k)}))
    }
}


export default ConceptScope;
