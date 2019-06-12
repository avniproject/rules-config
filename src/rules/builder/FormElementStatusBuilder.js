const RuleCondition = require("../RuleCondition");
const FormElementStatus = require("../model/FormElementStatus");
const _ = require("lodash");
const lib = require('../lib');

class FormElementStatusBuilder {

    constructor(context) {
        this.context = context;
        this.visibilityRule = new RuleCondition(context);
        this.answerSkipRules = [];
        this.valueRule = new RuleCondition(context);
    }

    show() {
        return this.visibilityRule;
    }

    skipAnswers(...answers) {
        let answerSkipRule = {
            rule: new RuleCondition(this.context),
            answers: _.reject(_.map(answers, (answer) => {
                const answerToSkip = _.isString(answer) ? this.context.formElement.getAnswerWithConceptName(answer) : answer;
                if (answerToSkip) {
                    return answerToSkip;
                }
                lib().log(`[RulesConfig][Warn] Can't Skip Answer '${answer}' in '${this.context.formElement.concept.name}'. Answer is either voided or not found.`);
            }), _.isNil)
        };
        this.answerSkipRules.push(answerSkipRule);
        return answerSkipRule.rule;
    }

    value(value) {
        this._value = value;
        return this.valueRule;
    }

    build() {
        const answersToSkip = _.reduce(this.answerSkipRules, (acc, ruleItem) => ruleItem.rule.matches() ? _.concat(acc, ruleItem.answers) : acc, []);
        return new FormElementStatus(this.context.formElement.uuid, this.visibilityRule.matches(), this.valueRule.matches() ? this._value : null, answersToSkip);
    }
}

module.exports = FormElementStatusBuilder;
