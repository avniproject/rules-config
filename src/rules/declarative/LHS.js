import _ from 'lodash';
import {assertTrue} from "./Util";

class LHS {
    static types = {
        'AgeInDays': 'ageInDays',
        'AgeInWeeks': 'ageInWeeks',
        'AgeInMonths': 'ageInMonths',
        'AgeInYears': 'ageInYears',
        'LowestAddressLevelType': 'lowestAddressLevelType',
        'LowestAddressLevel': 'lowestAddressLevel',
        'Gender': 'gender',
        'Concept': 'concept',
    };

    static numericRHSValueTypes = ['ageInDays', 'ageInWeeks', 'ageInMonths', 'ageInYears'];

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

    getJSCode() {
        if (this.scope) {
            const functionMap = LHS.scopeToRuleFunctionMap;
            return `${functionMap[this.scope]}("${this.conceptName}")`;
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
