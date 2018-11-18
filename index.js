// Require Third-party Dependencies
const is = require("@slimio/is");
const get = require("lodash.get");

const Types = {
    char(length) {
        return `char[${length}]`;
    },
    uint8() {
        return "uint8[1]";
    }
};

/**
 * @typedef {Object} InlinePayload
 * @property {Number} bytesLength
 * @property {*} inlined
 */

// CONSTANTS
const E_TYPES = new Set(["char", "uint8"]);

/**
 * @class Struct
 */
class Struct {

    /**
     * @static
     * @func inline
     * @param {String=} rootName rootName
     * @param {Number} [defaultByteOffset=0] defaultByteOffset
     * @param {*} payload Schema payload
     * @returns {InlinePayload}
     */
    static inline(rootName = "", defaultByteOffset = 0, payload) {
        const ret = [];

        let byteOffset = defaultByteOffset;
        for (const [key, value] of Object.entries(payload)) {
            const isPlainObject = is.plainObject(value);
            if (isPlainObject || is.array(value)) {
                ret.push([`${rootName}${key}`, isPlainObject ? "object" : "array"]);
                const sub = Struct.inline(`${rootName}${key}.`, byteOffset, value);

                byteOffset = sub.bytesLength;
                ret.push(...sub.inlined);
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

                ret.push([`${rootName}${key}`, typeName, byteOffset, byteLength]);
                byteOffset = byteOffset + byteLength;
            }
        }

        return {
            bytesLength: byteOffset,
            inlined: ret
        };
    }

    /**
     * @constructor
     * @param {*} schema Schema
     */
    constructor(schema) {
        this.schema = Struct.inline(void 0, 0, schema);
    }

    /**
     * @func encode
     * @param {*} payload payload
     * @returns {Buffer}
     */
    encode(payload) {
        const arrBuffer = new ArrayBuffer(this.schema.bytesLength);
        const u8Arr = new Uint8Array(arrBuffer);

        for (const [path, type, offset] of this.schema.inlined) {
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

    decode(buf) {

    }
}

module.exports = {
    Struct,
    Types
};
