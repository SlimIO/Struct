"use strict";

// Require Third-party Dependencies
const is = require("@slimio/is");

// Require Internal Dependencies
const CONSTANTS = require("./constants");

/**
 * @function flattenObject
 * @param {!any} obj
 * @param {string | null} [rootKey]
 */
function* flattenObject(obj, rootKey = null) {
    for (const [keyName, value] of Object.entries(obj)) {
        const key = rootKey === null ? keyName : `${rootKey}.${keyName}`;
        if (is.plainObject(value)) {
            yield* flattenObject(value, key);
        }
        else {
            yield [key, value];
        }
    }
}

/**
 * @function parseType
 * @param {!string} type
 * @returns {any}
 */
function parseType(type) {
    const rV = type in CONSTANTS.types ? [void 0, type, CONSTANTS.types[type]] : /^([a-z0-9]+)\[([0-9]+)?\]$/g.exec(type);

    if (rV === null) {
        return null;
    }
    const [, name, length] = rV;

    return { name, length: Number(length) };
}

module.exports = {
    flattenObject,
    parseType
};
