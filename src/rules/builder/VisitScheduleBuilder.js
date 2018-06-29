const RuleCondition = require("../RuleCondition");
const _ = require("lodash");

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

    getAllUnique(keyPath) {
        const allScheduledVisits = this.getAll();
        const visitsGroupedByPath = _.groupBy(allScheduledVisits, (v) => v[keyPath]);
        return _.map(visitsGroupedByPath,
            (vals) => _.defaults(vals.find(val => !_.isEmpty(val['uuid'])), _.tail(vals)));
    }
}

module.exports = VisitScheduleBuilder;