class ObsMatcher {
    constructor(operator, value) {
        this.operator = operator;
        this.value = value;
    }
    match({ context, findingStrategy, inputForStrategy }) {
        return {
            context,
            findingStrategy,
            inputForStrategy,
            operator: this.operator,
            value: this.value
        };
    }
}

/* takes conceptNames. vararg */
const contains = (...items) => {
    if (typeof items[0] == 'string') {
        return new ObsMatcher('containsAnyAnswerConceptName', items);
    }
    throw `Not Implemented for item type '${typeof items[0]}'`;
}

/* to be implemented */
const not = function () {

}

/* right now only works with statments like `...show().whenItem(2).is.equals(2)` */
const is = function (item) {
    return new ObsMatcher('equals', item);
}

export { is, contains, not, ObsMatcher };
