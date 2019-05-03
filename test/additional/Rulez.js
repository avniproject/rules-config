import {RuleFactory} from "../../src/rules/additional/Rule"

const RandomProgramEncounterDecision = RuleFactory("e1472f56-c057-4aea-9f46-0decd9d068fe", "decision");

@RandomProgramEncounterDecision("57d473a0-c0a7-46ef-9688-88eabae4c8db", "GREEN", 1.2, {someData: "Goat"})
class rule1Brah {
    static exec(arg) {
        return `Rule 1 - ${arg}`;
    }
}

@RandomProgramEncounterDecision("75ea9d77-b951-43f0-84f0-8562eddd330a", "YELLOW", 1.3, {someData: "Cow"})
class rule2Brah {
    static exec(arg) {
        return `Rule 2 - ${arg}`;
    }
}

export {rule1Brah, rule2Brah};