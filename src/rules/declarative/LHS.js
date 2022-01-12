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

    withType(type) {
        const types = _.values(LHS.types);
        assertTrue(_.includes(types, type), `Types must be one of the ${types}`);
        this.type = type;
        return this;
    }

    withConceptName(conceptName) {
        this.conceptName = conceptName;
        return this;
    }

    withConceptUuid(conceptUuid) {
        this.conceptUuid = conceptUuid;
        return this;
    }

    withEncounterTypes(encounterTypes) {
        this.encounterTypes = encounterTypes;
        return this;
    }

    withScope(scope) {
        const scopes = _.values(LHS.scopes);
        assertTrue(_.includes(scopes, scope), `Scopes must be one of the ${scopes}`);
        assertTrue(!_.isNil(this.conceptName), `Scope cannot be set without concept`);
        this.scope = scope;
        return this;
    }

    build() {
        return this;
    }

    getJSCode() {
        if (this.scope) {
            const functionMap = LHS.scopeToRuleFunctionMap;
            return `${functionMap[this.scope]}("${this.conceptName}")`;
        } else {
            return this.type;
        }
    }
}

export default LHS;
