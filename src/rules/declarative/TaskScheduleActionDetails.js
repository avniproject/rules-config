import {assertTrue} from "./Util";
import _ from "lodash";

class TaskScheduleActionDetails {
    constructor() {
    }

    static fromResource(json) {
        return json;
    }

    clone() {
        return Object.assign(new TaskScheduleActionDetails(), this);
    }

    validate() {
    }
}

export default TaskScheduleActionDetails;
