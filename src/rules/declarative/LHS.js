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
            'EntireEnrolment': 'entireEnrolment',
            'Registration': 'registration',
        },
        ProgramExit: {
            'ThisExit': 'exit',
            'EntireEnrolment': 'entireEnrolment',
            'Registration': 'registration',
        },
        ProgramEncounter: {
            'ThisEncounter': 'encounter',
            'LastEncounter': 'lastEncounter',
            'LatestInAllEncounters': 'latestInAllEncounters',
            'LatestInPreviousEncounters': 'latestInPreviousEncounters',
            'LatestInEntireEnrolment': 'latestInEntireEnrolment',
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

    isAddressLevel() {
        return LHS.types.LowestAddressLevel === this.type;
    }

    isAddressLevelType() {
        return LHS.types.LowestAddressLevelType === this.type;
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

    getDefaultTypeOptions(form, isPerson) {
        const typeOptions = _.map(LHS.getTypesBySubjectType(isPerson), (v, k) => ({
            label: _.startCase(k),
            value: {name: v, uuid: null, dataType: null, toString: () => v}
        }));
        const conceptOptions = [];
        _.forEach(form.formElementGroups, ({formElements}) => {
            _.forEach(formElements, ({concept}) => {
                const {name, uuid, dataType} = concept;
                conceptOptions.push({
                    label: name,
                    value: {name, uuid, dataType, toString: () => uuid}
                });
            })
        });
        return [..._.filter(typeOptions, ({label}) => label !== 'Concept'), ...conceptOptions];
    }

    getTypeOptionValue() {
        return _.isEmpty(this.type) ? null : (this.isConcept() ?
            {
                label: this.conceptName,
                value: {
                    name: this.conceptName,
                    uuid: this.conceptUuid,
                    dataType: this.conceptDataType,
                    toString: () => this.conceptUuid
                }
            } :
            {
                label: _.startCase(this.type),
                value: {name: this.type, uuid: null, dataType: null, toString: () => this.type}
            });
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
