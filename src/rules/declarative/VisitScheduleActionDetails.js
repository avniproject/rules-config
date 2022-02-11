import {assertTrue} from "./Util";
import _ from "lodash";

class VisitScheduleActionDetails {

    static formTypeToDateFieldMap = {
        IndividualProfile: ['registrationDate'],
        IndividualEncounterCancellation: ['cancelDateTime', 'earliestVisitDateTime', 'registrationDate'],
        Encounter: ['encounterDateTime', 'earliestVisitDateTime', 'registrationDate'],
        ProgramEnrolment: ['enrolmentDateTime', 'registrationDate'],
        ProgramExit: ['programExitDateTime', 'registrationDate'],
        ProgramEncounter: ['encounterDateTime', 'earliestVisitDateTime', 'enrolmentDateTime', 'registrationDate'],
        ProgramEncounterCancellation: ['cancelDateTime', 'earliestVisitDateTime', 'enrolmentDateTime', 'registrationDate']
    };

    constructor() {
    }

    static fromResource(json) {
        const actionDetails = new VisitScheduleActionDetails();
        actionDetails.encounterType = json.encounterType;
        actionDetails.dateField = json.dateField;
        actionDetails.daysToSchedule = json.daysToSchedule;
        actionDetails.daysToOverdue = json.daysToOverdue;
        return actionDetails;
    }

    static buildVisitScheduleAction(actionDetails, entityName) {
        const getDateFieldPath = () => {
            switch (entityName) {
                case 'individual':
                    return `individual.registrationDate`;
                case 'encounter':
                    return actionDetails.dateField === 'registrationDate' ? `encounter.individual.registrationDate` : `encounter.${actionDetails.dateField}`;
                case 'programEnrolment':
                    return actionDetails.dateField === 'registrationDate' ? `programEnrolment.individual.registrationDate` : `programEnrolment.${actionDetails.dateField}`;
                case 'programEncounter':
                    return actionDetails.dateField === 'enrolmentDateTime' ? `programEncounter.programEnrolment.enrolmentDateTime` : (actionDetails.dateField === 'registrationDate' ? `programEncounter.programEnrolment.individual.registrationDate` : `programEncounter.${actionDetails.dateField}`);
            }
        };
        const dateFieldPath = getDateFieldPath();
        return `const earliestDate = moment(${dateFieldPath}).add(${actionDetails.daysToSchedule}, 'days').toDate();\n    `
            .concat(`const maxDate = moment(${dateFieldPath}).add(${actionDetails.daysToOverdue}, 'days').toDate();\n    `)
            .concat(`scheduleBuilder.add({name: "${actionDetails.encounterType}", encounterType: "${actionDetails.encounterType}", earliestDate, maxDate});`)
    }

    clone() {
        const details = new VisitScheduleActionDetails();
        details.encounterType = this.encounterType;
        details.dateField = this.dateField;
        details.daysToSchedule = this.daysToSchedule;
        details.daysToOverdue = this.daysToOverdue;
        return details;
    }

    validate() {
        assertTrue(!_.isEmpty(this.encounterType), "Visit schedule encounter type cannot be empty");
        assertTrue(!_.isEmpty(this.dateField), "Visit schedule date field cannot be empty");
        assertTrue(!_.isEmpty(this.daysToSchedule), "Visit schedule days to schedule cannot be empty");
        assertTrue(!_.isEmpty(this.daysToOverdue), "Visit schedule days to overdue cannot be empty");
    }

}


export default VisitScheduleActionDetails;
