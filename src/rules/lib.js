export default () => ({

    /* Until we find a good way to share modules during rule evaluation, we use globals */
    /* ruleServiceLibraryInterfaceForSharingModules is globally available */
    get log() {
        return this.ruleServiceLibraryInterfaceForSharingModules.log;
    },
    get C() {
        return this.ruleServiceLibraryInterfaceForSharingModules.common;
    },
    get calculations() {
        return this.ruleServiceLibraryInterfaceForSharingModules.motherCalculations;
    },
    get models() {
        return this.ruleServiceLibraryInterfaceForSharingModules.models;
    },
    get ruleServiceLibraryInterfaceForSharingModules() {
        if (ruleServiceLibraryInterfaceForSharingModules) return ruleServiceLibraryInterfaceForSharingModules;
        if (global) return global.ruleServiceLibraryInterfaceForSharingModules;
    }
});
