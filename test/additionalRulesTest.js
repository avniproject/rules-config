import {assert} from "chai";
import {rule1Brah, rule2Brah} from './additional/Rulez';
import RuleRegistry from '../src/rules/additional/RuleRegistry';

describe('Additional Rules Test', () => {
    it('should get all additional rules for a given program, entity type and type of rule', function () {
        const allRules = RuleRegistry.getRulesFor("e1472f56-c057-4aea-9f46-0decd9d068fe", "decision");
        let ruleExecOutput = allRules.map(({fn}, idx) => fn.exec(String(idx)));
        assert.deepEqual(["Rule 2 - 0", "Rule 1 - 1"], ruleExecOutput);
    });
});
