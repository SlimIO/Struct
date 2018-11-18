// Require Third-party Dependencies
const is = require("@slimio/is");
const get = require("lodash.get");

/**
 * @typedef {Object} inlinedSchema
 * @property {Number} bytesLength
 * @property {*} result
 */

// CONSTANTS
const E_TYPES = new Set(["char", "uint8"]);

// SYMBOLS
const SCHEMA = Symbol("Schema");

/**
 * @class Struct
 *
 * @property {Number} bytesLength
 */
class Struct {

    /**
     * @static
     * @func inline
     * @param {String=} rootName rootName
     * @param {Number} [defaultByteOffset=0] defaultByteOffset
     * @param {*} payload Schema payload
     * @returns {inlinedSchema}
     */
    static inline(rootName = "", defaultByteOffset = 0, payload) {
        const result = [];

        let byteOffset = defaultByteOffset;
        for (const [key, value] of Object.entries(payload)) {
            const isPlainObject = is.plainObject(value);
            if (isPlainObject || is.array(value)) {
                result.push([`${rootName}${key}`, isPlainObject ? "object" : "array"]);
                const sub = Struct.inline(`${rootName}${key}.`, byteOffset, value);

                byteOffset = sub.bytesLength;
                result.push(...sub.result);
            }
            else if (typeof value === "string") {
                const rV = /^([a-z0-9]+)\[([0-9]+)?\]$/g.exec(value);
                if (rV === null) {
                    continue;
                }

                const typeName = rV[1];
                const byteLength = rV.length === 2 ? 1 : Number(rV[2]);
                if (!E_TYPES.has(typeName)) {
                    throw new Error(`Unknow type ${typeName} !`);
                }

                result.push([`${rootName}${key}`, typeName, byteOffset, byteLength]);
                byteOffset = byteOffset + byteLength;
            }
        }

        return {
            bytesLength: byteOffset,
            result
        };
    }

    /**
     * @constructor
     * @param {*} schema Schema
     * @throws {TypeError}
     */
    constructor(schema) {
        if (!is.object(schema)) {
            throw new TypeError("schema argument should be a JavaScript object!");
        }

        const inlinedSchema = Struct.inline(void 0, 0, schema);
        this.bytesLength = inlinedSchema.bytesLength;
        this[SCHEMA] = inlinedSchema.result;
    }

    /**
     * @func encode
     * @param {*} payload payload
     * @returns {Buffer}
     */
    encode(payload) {
        const arrBuffer = new ArrayBuffer(this.bytesLength);
        const u8Arr = new Uint8Array(arrBuffer);

        for (const [path, type, offset] of this[SCHEMA]) {
            const pValue = payload[path];
            if (type === "char") {
                u8Arr.set([...pValue].map((char) => char.charCodeAt(0)), offset);
            }
            else if (type === "uint8") {
                u8Arr[offset] = pValue;
            }

        }

        return Buffer.from(arrBuffer);
    }

    /**
     * @func decode
     * @param {!Buffer} buf Buffer to decode
     * @returns {*}
     */
    decode(buf) {
        if (!Buffer.isBuffer(buf)) {
            throw new TypeError("buf should be a Node.js buffer!");
        }

        return {};
    }

}

// Available Types for our Struct
const Types = {
    char: (length = 1) => `char[${length}]`,
    uint8: () => "uint8[1]"
};

module.exports = {
    Struct,
    Types
};
