/* eslint-disable guard-for-in */
/* eslint-disable max-params */
"use strict";

// Require Third-party Dependencies
const dset = require("dset");
const is = require("@slimio/is");

// Require Internal Dependencies
const { flattenObject, parseType } = require("./src/utils");
const CONSTANTS = require("./src/constants");

class Struct {
    #schema = {};
    #bytesLength = 0;
    #entries = [];

    static createSchema(struct) {
        let offset = 0;
        const schema = Object.create(null);

        for (const [completeKeyPath, keyType] of flattenObject(struct)) {
            if (completeKeyPath in schema) {
                continue;
            }

            if (is.string(keyType)) {
                const type = parseType(keyType);
                if (type === null) {
                    continue;
                }

                const currentOffset = offset;
                const encode = CONSTANTS.encode[type.name];
                const decode = CONSTANTS.decode[type.name];

                schema[completeKeyPath] = {
                    isRootKey: !completeKeyPath.includes("."),
                    encode: (dV, value) => encode(dV, value, currentOffset, type.length),
                    decode: (dV) => decode(dV, currentOffset, type.length)
                };
                offset += type.length;
            }
            else {
                const { kind, elementsType, length } = type;
                const type = parseType(elementsType);
            }
        }

        return { bytesLength: offset, schema };
    }

    constructor(struct = Object.create(null)) {
        const { schema, bytesLength } = Struct.createSchema(struct);

        this.#schema = schema;
        this.#entries = Object.entries(this.#schema);
        this.#bytesLength = bytesLength;
    }

    get length() {
        return this.#bytesLength;
    }

    encode(payload) {
        const arrBuffer = new ArrayBuffer(this.#bytesLength);
        const dV = new DataView(arrBuffer);
        for (const keyName in payload) {
            keyName in this.#schema && this.#schema[keyName].encode(dV, payload[keyName]);
        }

        return arrBuffer;
    }

    decode(arrBuffer, offset = 0, isDv = false) {
        // coût d'environ 80ms
        const payload = Object.create(null);
        const dV = isDv ? arrBuffer : new DataView(arrBuffer, offset);

        // le dset coûte entre 3 et 4x plus en I/O qu'un set classique!
        for (const [keyName, value] of this.#entries) {
            (value.isRootKey ? payload[keyName] = value.decode(dV) : dset(payload, keyName, value.decode(dV)));
        }

        return payload;
    }

    * lazyDecode(arrBuffer, offset = 0, isDv = false) {
        const dV = isDv ? arrBuffer : new DataView(arrBuffer, offset);

        for (const [keyName, value] of this.#entries) {
            yield [keyName, value.decode(dV)];
        }
    }
}

// Available Types for our Struct
const Types = {
    char: (length = 1) => `char[${length}]`,
    array: (elementsType, length = 1) => {
        return { kind: "array", elementsType, length };
    },
    uInt8: "uint8",
    uInt16: "uint16",
    uInt32: "uint32",
    int8: "int8",
    int16: "int16",
    int32: "int32",
    float32: "float32",
    float64: "float64",
    bigInt64: "bigint64",
    bigUInt64: "biguint64"
};

module.exports = {
    Struct,
    Types
};
