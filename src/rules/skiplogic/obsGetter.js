
class GetObsValueByConceptName {
    constructor(conceptName) {
        this.strategy = 'valueInEncounter';
        this.conceptName = conceptName;
        this.entityType = 'programEncounter';
    }
    find(entity, formElement) {
        const context = { formElement };
        context[this.entityType] = entity;
        return {
            context,
            findingStrategy: this.strategy,
            inputForStrategy: this.conceptName
        };
    }
}

class GetObsValueByFunc {
    constructor(func) {
        this.strategy = 'whenItem';
        this.strategyFn = func;
        this.entityType = 'programEncounter';
    }
    find(entity, formElement) {
        const context = { formElement };
        context[this.entityType] = entity;
        return {
            context,
            findingStrategy: this.strategy,
            inputForStrategy: this.strategyFn(entity, formElement)
        };
    }
}

const getObsGetter = (data) => {
    if (typeof data == 'string') {
        return new GetObsValueByConceptName(data);
    }
    if (typeof data == 'function') {
        return new GetObsValueByFunc(data);
    }
    return data;
}

export { getObsGetter };