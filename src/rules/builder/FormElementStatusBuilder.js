const RuleCondition = require("../RuleCondition");
const FormElementStatus = require("../model/FormElementStatus");
const _ = require("lodash");
const lib = require('../lib');

class FormElementStatusBuilder {

    constructor(context) {
        this.context = context;
        this.visibilityRule = new RuleCondition(context);
        this.answerSkipRules = [];
        this.answersToShow = [];
        this.valueRule = new RuleCondition(context);
        this.validationErrorRules = []
    }

    show() {
        return this.visibilityRule;
    }

    validationError(errorMessage) {
        let validationErrorRule = {
            rule: new RuleCondition(Object.assign({}, this.context)),
            errorMessage: errorMessage
        };
        this.validationErrorRules.push(validationErrorRule);
        return validationErrorRule.rule;
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

    showAnswers(...answers) {
        let answerShowRule = {
            rule: new RuleCondition(this.context),
            answers: _.map(answers, (answer) => {
              return answer;
            })
        };
        this.answersToShow.push(answerShowRule);
        return answerShowRule.rule;
    }

    value(value) {
        this._value = value;
        return this.valueRule;
    }

    build() {
        const validationErrors = this.validationErrorRules.filter(e => e.rule.matches()).map(({errorMessage}) => errorMessage);
        const validations = this.visibilityRule.matches() ? validationErrors : [];
        const answersToSkip = _.reduce(this.answerSkipRules, (acc, ruleItem) => ruleItem.rule.matches() ? _.concat(acc, ruleItem.answers) : acc, []);
        const answersToShow = _.reduce(this.answersToShow, (acc, ruleItem) => ruleItem.rule.matches() ? _.concat(acc, ruleItem.answers) : acc, []);

        if (answersToSkip.length > 0 && answersToShow.length > 0) {
            throw Error(`Rule for FormElement '${this.context.formElement.name}' uses both skipAnswers and showAnswers.`);
        }

        return new FormElementStatus(this.context.formElement.uuid, this.visibilityRule.matches(),
            this.valueRule.matches() ? this._value : null, answersToSkip, validations, answersToShow);
    }
}

module.exports = FormElementStatusBuilder;
