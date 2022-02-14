import _ from 'lodash';
import {assertTrue} from "./Util";

class LHS {
    static numericTypes = {
        'AgeInDays': 'ageInDays',
        'AgeInWeeks': 'ageInWeeks',
        'AgeInMonths': 'ageInMonths',
        'AgeInYears': 'ageInYears',
    };

    static otherTypes = {
        'LowestAddressLevelType': 'lowestAddressLevelType',
        'LowestAddressLevel': 'lowestAddressLevel',
    };

    static types = {
        ...LHS.numericTypes,
        ...LHS.otherTypes,
        'Gender': 'gender',
        'Concept': 'concept',
    };

    static noPersonTypes = {
        ...LHS.otherTypes,
        'Concept': 'concept',
    };

    static formTypeToScopeMap = {
        IndividualProfile: {'ThisRegistration': 'thisRegistration', 'ThisDecisions': 'thisDecisions',},
        IndividualEncounterCancellation: {
            'ThisEncounter': 'thisEncounter',
            'ThisRegistration': 'thisRegistration',
            'LatestInAllVisits': 'latestInAllVisits',
            'LatestInPreviousVisits': 'latestInPreviousVisits',
            'LastVisit': 'lastVisit',
            'ThisCancelEncounter': 'thisCancelEncounter',
            'ThisDecisions': 'thisDecisions',
        },
        Encounter: {
            'ThisEncounter': 'thisEncounter',
            'ThisRegistration': 'thisRegistration',
            'LatestInAllVisits': 'latestInAllVisits',
            'LatestInPreviousVisits': 'latestInPreviousVisits',
            'LastVisit': 'lastVisit',
            'ThisDecisions': 'thisDecisions',
        },
        ProgramEnrolment: {
            'ThisEnrolment': 'thisEnrolment',
            'ThisRegistration': 'thisRegistration',
            'EntireEnrolment': 'entireEnrolment',
            'ThisDecisions': 'thisDecisions',
        },
        ProgramExit: {
            'ThisExit': 'thisExit', 'ThisEnrolment': 'thisEnrolment',
            'ThisRegistration': 'thisRegistration',
            'EntireEnrolment': 'entireEnrolment',
            'ThisDecisions': 'thisDecisions',
        },
        ProgramEncounter: {
            'ThisRegistration': 'thisRegistration',
            'ThisEncounter': 'thisEncounter',
            'LatestInEntireEnrolment': 'latestInEntireEnrolment',
            'LatestInAllVisits': 'latestInAllVisits',
            'LatestInPreviousVisits': 'latestInPreviousVisits',
            'LastVisit': 'lastVisit',
            'ThisDecisions': 'thisDecisions',
        },
        ProgramEncounterCancellation: {
            'ThisCancelEncounter': 'thisCancelEncounter',
            'ThisRegistration': 'thisRegistration',
            'LatestInEntireEnrolment': 'latestInEntireEnrolment',
            'LatestInAllVisits': 'latestInAllVisits',
            'LatestInPreviousVisits': 'latestInPreviousVisits',
            'LastVisit': 'lastVisit',
            'ThisDecisions': 'thisDecisions',
        },
        ChecklistItem: {
            'ThisChecklistItem': 'thisChecklistItem',
            'ThisDecisions': 'thisDecisions',
        },
    };

    static scopes = {
        'EntireEnrolment': 'entireEnrolment',
        'LatestInAllVisits': 'latestInAllVisits',
        'LatestInEntireEnrolment': 'latestInEntireEnrolment',
        'LatestInPreviousVisits': 'latestInPreviousVisits',
        'LastVisit': 'lastVisit',
        'ThisEnrolment': 'thisEnrolment',
        'ThisExit': 'thisExit',
        'ThisEncounter': 'thisEncounter',
        'ThisDecisions': 'thisDecisions',
        'ThisRegistration': 'thisRegistration',
        'ThisCancelEncounter': 'thisCancelEncounter',
        'ThisChecklistItem': 'thisChecklistItem'
    };

    static scopeToRuleFunctionMap = {
        'entireEnrolment': 'valueInEntireEnrolment',
        'latestInAllVisits': 'latestValueInAllEncounters',
        'latestInEntireEnrolment': 'latestValueInEntireEnrolment',
        'latestInPreviousVisits': 'latestValueInPreviousEncounters',
        'lastVisit': 'valueInLastEncounter',
        'thisEnrolment': 'valueInEnrolment',
        'thisExit': 'valueInExit',
        'thisEncounter': 'valueInEncounter',
        'thisDecisions': 'valueInDecisions',
        'thisRegistration': 'valueInRegistration',
        'thisCancelEncounter': 'valueInCancelEncounter',
        'thisChecklistItem': 'valueInChecklistItem',
    };

    constructor() {
    }

    static fromResource(json) {
        const lhs = new LHS();
        lhs.type = json.type;
        lhs.conceptName = json.conceptName;
        lhs.conceptUuid = json.conceptUuid;
        lhs.conceptDataType = json.conceptDataType;
        lhs.scope = json.scope;
        lhs.encounterTypes = json.encounterTypes;
        return lhs;
    }

    static getTypesBySubjectType(isPerson) {
        return isPerson ? LHS.types : LHS.noPersonTypes;
    }

    static getScopeByFormType(formType) {
        const formTypeScopes = LHS.formTypeToScopeMap[formType];
        return _.isEmpty(formTypeScopes) ? LHS.scopes : formTypeScopes;
    }

    setType(type) {
        const types = _.values(LHS.types);
        assertTrue(_.includes(types, type), `Types must be one of the ${types}`);
        this.type = type;
    }

    setConceptName(conceptName) {
        this.conceptName = conceptName;
    }

    setConceptUuid(conceptUuid) {
        this.conceptUuid = conceptUuid;
    }

    setConceptDataType(conceptDataType) {
        this.conceptDataType = conceptDataType;
    }

    setEncounterTypes(encounterTypes) {
        this.encounterTypes = encounterTypes;
    }

    setScope(scope) {
        const scopes = _.values(LHS.scopes);
        assertTrue(_.includes(scopes, scope), `Scopes must be one of the ${scopes}`);
        assertTrue(!_.isNil(this.conceptName), `Scope cannot be set without concept`);
        this.scope = scope;
    }

    isScopeRequired() {
        return !_.isNil(this.type) && this.type === LHS.types.Concept;
    }

    isNumeric() {
        return _.includes(_.values(LHS.numericTypes), this.type) || _.includes(['Numeric', 'Id'], this.conceptDataType)
    }

    isOther() {
        return _.includes(_.values(LHS.otherTypes), this.type);
    }

    isGender() {
        return LHS.types.Gender === this.type;
    }

    isConcept() {
        return LHS.types.Concept === this.type
    }

    isCodedConcept() {
        return this.isConcept() && this.conceptDataType === 'Coded';
    }

    getJSCode() {
        if (this.scope) {
            const functionMap = LHS.scopeToRuleFunctionMap;
            return `${functionMap[this.scope]}("${this.conceptUuid}")`;
        } else {
            return this.type;
        }
    }

    getRuleSummary() {
        const conceptRelated = _.isEmpty(this.conceptName) ? '' : ` ${this.conceptName} in ${_.lowerCase(this.scope)}`;
        return `If ${_.lowerCase(this.type)}${conceptRelated}`
    }

    clone() {
        const lhs = new LHS();
        lhs.type = this.type;
        lhs.conceptName = this.conceptName;
        lhs.conceptUuid = this.conceptUuid;
        lhs.conceptDataType = this.conceptDataType;
        lhs.scope = this.scope;
        lhs.encounterTypes = this.encounterTypes;
        return lhs;
    }

    validate() {
        assertTrue(!_.isNil(this.type), "Type cannot be empty");
        if (_.isEqual(this.type, LHS.types.Concept)) {
            assertTrue(!_.isNil(this.conceptName), "Concept cannot be empty");
            assertTrue(!_.isNil(this.scope), "Scope cannot be empty");
        }
    }
}

export default LHS;
