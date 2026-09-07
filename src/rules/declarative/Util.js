export const assertTrue = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
};

// The rule variable Approval and Rejection forms run against, matching the ruleVariableName
// App Designer registers for those form types.
export const APPROVAL_STATUS_ENTITY_NAME = 'entityApprovalStatus';

// An EntityApprovalStatus holds only the UUID and type of the record being approved, so the
// subject cannot be reached from it by navigation the way it can from an encounter or an
// enrolment. The client passes the subject alongside in entityContext instead; binding it here
// is what lets the registration scope resolve on these forms. Emitted only for approval form
// types — anywhere else `individual` is either already the entity or reachable from it, and a
// second declaration would be a syntax error.
export const getApprovedSubjectDeclaration = (entityName) =>
    entityName === APPROVAL_STATUS_ENTITY_NAME
        ? `\n  const individual = params.entityContext && params.entityContext.individual;`
        : '';

export const getViewFilterRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;${getApprovedSubjectDeclaration(entityName)}
  const moment = imports.moment;
  const formElement = params.formElement;
  const _ = imports.lodash;
  let visibility = true;
  let value = null;
  let answersToSkip = [];
  let answersToShow = [];
  let validationErrors = [];
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return new imports.rulesConfig.FormElementStatus(formElement.uuid, visibility, value, answersToSkip, validationErrors, answersToShow);
};`;

export const getFormElementGroupRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
    const ${entityName} = params.entity;${getApprovedSubjectDeclaration(entityName)}
    const moment = imports.moment;
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
  const moment = imports.moment;
  let eligibility = true;
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return eligibility;
};`;

export const getFormValidationErrorRuleTemplate = (entityName) =>
`'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;${getApprovedSubjectDeclaration(entityName)}
  const moment = imports.moment;
  const validationResults = [];
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return validationResults;
};`;

export const getDecisionRuleTemplate = (entityName) =>
`"use strict";
({params, imports}) => {
    const ${entityName} = params.entity;
    const moment = imports.moment;
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


export const getVisitScheduleRuleTemplate = (entityName) =>
`"use strict";
({ params, imports }) => {
  const ${entityName} = params.entity;
  const moment = imports.moment;
  const scheduleBuilder = new imports.rulesConfig.VisitScheduleBuilder({${entityName}});
  $RULE_CONDITIONS
  $ACTION_CONDITIONS
  return scheduleBuilder.getAll();
};`;
