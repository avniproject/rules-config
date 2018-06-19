const _ = require("lodash");
const RuleCondition = require("../RuleCondition");

class ComplicationsBuilder {

    constructor(context) {
        this.context = context;
        this.complicationConditions = [];
    }

    addComplication(complicationConcept) {
        const ruleCondition = new RuleCondition(this.context);
        this.complicationConditions.push({concept: complicationConcept, condition: ruleCondition});
        return ruleCondition;
    }

    getComplications() {
        let complications = [];
        _.forEach(this.complicationConditions, (conditionObj) => {
            if (conditionObj.condition.matches()) {
                complications.push(conditionObj.concept);
            }
        });
        return {name: this.context.complicationsConcept, value: _.uniq(complications)};
    }

    hasComplications() {
        return !_.isEmpty(this.getComplications().value);
    }
}

module.exports = ComplicationsBuilder;