export const assertTrue = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
};

export const getViewFilterRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const formElement = params.formElement;
  const _ = imports.lodash;
  let visibility = true;
  let value = null;
  let answersToSkip = [];
  let validationErrors = [];
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, value, answersToSkip, validationErrors);
};`;

export const getFormElementGroupRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
    const ${entityName} = params.entity;
    const formElementGroup = params.formElementGroup;
    const _ = imports.lodash;
    let visibility = true;
    return formElementGroup.formElements.map((formElement) => {
        $RULE_CONDITIONS
        $ACTION_CONDITIONS
        return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, null);
    });
};`;

export const getEligibilityRuleTemplate = () =>
`'use strict';
({params, imports}) => {
  const individual = params.entity;
  $RULE_CONDITIONS
  return $ACTION_CONDITIONS
};`;

export const getFormValidationErrorRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const createValidationError = imports.common.createValidationError;
  const validationResults = [];
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return validationResults;
};`;

export const getDecisionRuleTemplate = (entityName) =>
`"use strict";
({params, imports}) => {
    const ${entityName} = params.entity;
    const decisions = params.decisions;
    const enrolmentDecisions = [];
    const encounterDecisions = [];
    const registrationDecisions = [];
    $RULE_CONDITIONS
    $ACTION_CONDITIONS
    decisions.enrolmentDecisions.push(...enrolmentDecisions);
    decisions.encounterDecisions.push(...encounterDecisions);
    decisions.registrationDecisions.push(...registrationDecisions);
    return decisions;
};`;
