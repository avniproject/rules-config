import _ from "lodash";

class ConceptScope {
    static formTypeToScopeMap = {
        IndividualProfile: {
            'ThisRegistration': 'registration',
            'ThisQuestionGroupRegistration': 'questionGroupRegistration'
        },
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
            'ThisQuestionGroupEncounter': 'questionGroupEncounter'
        },
        ProgramEnrolment: {
            'ThisEnrolment': 'enrolment',
            'Registration': 'registration',
            'ThisQuestionGroupEnrolment': 'questionGroupEnrolment'
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
            'ThisQuestionGroupEncounter': 'questionGroupEncounter'
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
        // Approval and Rejection forms attach to four different mapping shapes (subject
        // registration, enrolment, encounter, checklist item), and formTypeToScopeMap is keyed
        // by form type alone. Only the intersection is offered: a scope such as lastEncounter
        // is valid on an encounter mapping but resolves to nothing on a registration one.
        Approval: {
            'ThisApprovalStatus': 'entityApprovalStatus',
            'Registration': 'registration',
        },
        Rejection: {
            'ThisApprovalStatus': 'entityApprovalStatus',
            'Registration': 'registration',
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

    // Deliberately kept out of `scopes`: that map doubles as the fallback list for form types
    // absent from formTypeToScopeMap, so adding it there would start offering the approval
    // status scope on unrelated forms such as SubjectEnrolmentEligibility.
    static approvalScopes = {
        'ThisApprovalStatus': 'entityApprovalStatus'
    };

    static getAllScopes() {
        return {...ConceptScope.scopes, ...ConceptScope.approvalScopes};
    }

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
        'questionGroupRegistration': 'questionGroupValueInRegistration',
        'questionGroupEncounter': 'questionGroupValueInEncounter',
        'questionGroupEnrolment': 'questionGroupValueInEnrolment',
        'entityApprovalStatus': 'valueInEntityApprovalStatus',
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
        'entityApprovalStatus': 'findObservation',
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
