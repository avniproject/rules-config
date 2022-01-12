export const assertTrue = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
};
