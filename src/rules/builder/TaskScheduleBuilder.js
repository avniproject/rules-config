import RuleCondition from "../RuleCondition";
import _ from "lodash";
import moment from 'moment';

class TaskScheduleBuilder {
    constructor(context) {
        this.context = context;
        this.scheduledTasks = [];
    }

    add(schedule) {
        const ruleCondition = new RuleCondition(this.context);
        this.scheduledTasks.push({
            data: schedule,
            condition: ruleCondition
        });
        return ruleCondition;
    }

    getAll() {
        return this.scheduledTasks.filter(task => task.condition.matches())
            .map(({data}) => data);
    }
}

export default TaskScheduleBuilder;
