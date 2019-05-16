module.exports = {
    /* Until we find a good way to share modules during rule evaluation, we use globals */
    /* ruleServiceLibraryInterfaceForSharingModules is globally available */
    get log() {
        return ruleServiceLibraryInterfaceForSharingModules.log;
    },
    get C() {
        return ruleServiceLibraryInterfaceForSharingModules.common;
    },
    get calculations() {
        return ruleServiceLibraryInterfaceForSharingModules.motherCalculations;
    },
    get models() {
        return ruleServiceLibraryInterfaceForSharingModules.models;
    }
};
