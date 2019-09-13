const RuleCondition = require("../RuleCondition");
const _ = require("lodash");
const moment = require('moment');

class VisitScheduleBuilder {
    constructor(context) {
        this.context = context;
        this.scheduledVisits = [];
    }

    add(schedule) {
        const ruleCondition = new RuleCondition(this.context);
        this.scheduledVisits.push({
            data: schedule,
            condition: ruleCondition
        });
        return ruleCondition;
    }

    getAll() {
        return this.scheduledVisits.filter(visit => visit.condition.matches())
            .map(({data}) => data);
    }

    removeVisitsWith(key, keyList) {
        this.scheduledVisits = this.scheduledVisits.filter((sv) => keyList.indexOf(_.get(sv, `data.${key}`)) < 0);
    }

    _getAllUniqueVisits(keyPath) {
        const allScheduledVisits = this.getAll();
        const visitsGroupedByPath = _.groupBy(allScheduledVisits, (v) => v[keyPath]);
        return _.map(visitsGroupedByPath,
            (vals) => {
                let defaultVisit = _.last(vals);
                const visitToPick = _.defaults(vals.find(val => !_.isEmpty(val['uuid'])), defaultVisit);
                visitToPick.earliestDate = defaultVisit.earliestDate;
                visitToPick.maxDate = defaultVisit.maxDate;
                visitToPick.name = defaultVisit.name;
                return visitToPick;
            });
    }

    getAllUnique(keyPath, avoidExistingVisits = false) {
        let allUniqueVisits = this._getAllUniqueVisits(keyPath);
        let programEnrolment = _.get(this.context, "programEnrolment") || _.get(this.context, "programEncounter.programEnrolment");
        const allScheduledEncounters = programEnrolment.encounters.filter(encounter => encounter.earliestVisitDateTime);

        const visitExistsInEnrolment = (visit) => {
            return allScheduledEncounters.find(
                programEncounter =>
                    moment(programEncounter.earliestVisitDateTime).isSame(moment(visit.earliestDate), 'day')
                    && programEncounter.encounterType.name === visit.encounterType
            );
        };

        if (avoidExistingVisits) {
            return allUniqueVisits.filter((visit) => !visitExistsInEnrolment(visit));
        }

        return allUniqueVisits;
    };
}

module.exports = VisitScheduleBuilder;