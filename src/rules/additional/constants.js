
const Ruleable = {
    Form: 'Form',
    Program: 'Program',
    None: 'None',
};

const RuleType = {
    Decision: "Decision",
    VisitSchedule: "VisitSchedule",
    ViewFilter: "ViewFilter", // naming preserved for legacy reasons
    Checklists: "Checklists",
    Validation: "Validation",
    EnrolmentSummary: "EnrolmentSummary",
    WorkListUpdation: "WorkListUpdation",
    EnrolmentEligibilityCheck: "EnrolmentEligibilityCheck",
};

module.exports = { Ruleable, RuleType };
