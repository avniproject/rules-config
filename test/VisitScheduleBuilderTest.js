const {assert, expect} = require("chai");
const VisitScheduleBuilder = require("../src/rules/builder/VisitScheduleBuilder");

const monthlyVisit = {
    name: 'Monthly Visit',
    encounterType: 'Monthly Visit',
    earliestDate: new Date(),
    maxDate: new Date()
};

const dropoutVisit = {
    name: 'Dropout Home Visit',
    encounterType: 'Dropout Home Visit',
    earliestDate: new Date(),
    maxDate: new Date()
};

describe("ScheduleBuilderTest", () => {
    let scheduleBuilder;
    beforeEach(() => {
        scheduleBuilder = new VisitScheduleBuilder({
            programEnrolment: {
                encounters: [],
            }
        });
    });

    it("Should not matter what order I run things return unique visits", () => {
        scheduleBuilder.add(monthlyVisit).whenItem(true).equals(false);
        scheduleBuilder.add(dropoutVisit).whenItem(true).truthy;

        const allVisits = scheduleBuilder.getAll();
        console.log(allVisits);
        assert.lengthOf(allVisits, 1);
    });

    describe('getAllUnique', () => {
        it("Should only return unique visits", () => {
            scheduleBuilder.add(monthlyVisit).whenItem(true).truthy;
            scheduleBuilder.add(monthlyVisit).whenItem(true).truthy;
            scheduleBuilder.add(dropoutVisit).whenItem(true).truthy;
            scheduleBuilder.add(dropoutVisit).whenItem(true).truthy;
            const allVisits = scheduleBuilder.getAll();
            const uniqueVisits = scheduleBuilder.getAllUnique("encounterType");
            assert.lengthOf(allVisits, 4);
            assert.lengthOf(uniqueVisits, 2);
            assert.deepInclude(uniqueVisits, monthlyVisit);
            assert.deepInclude(uniqueVisits, dropoutVisit);
        });


        it("Should remove encounters that match the earliestVisitDateTime and encounterType when avoidExistingVisits = true", () => {
            let scheduledEncounters = [{earliestVisitDateTime: new Date(), encounterType: {name: 'Monthly Visit'}}];
            const builder = new VisitScheduleBuilder({programEnrolment: {encounters: scheduledEncounters}});
            builder.add(monthlyVisit);

            expect(builder.getAllUnique("encounterType").length).to.equal(1);
            expect(builder.getAllUnique("encounterType", true).length).to.equal(0);
        })
    })
;
});