"use strict";

const types = {
    bool: 1,
    uint8: 1,
    int8: 1,
    uint16: 2,
    int16: 2,
    uint32: 4,
    int32: 4,
    float32: 4,
    float64: 8,
    biguint64: 8,
    bigint64: 8
};

const encode = {
    // eslint-disable-next-line max-params
    char(dV, value, offset, length) {
        const maxLength = value.length < length ? value.length : length;
        for (let id = 0; id < maxLength; id++) {
            dV.setUint8(offset + id, value[id].charCodeAt(0));
        }
    },
    bool: (dV, value, offset) => (dV.setUint8(offset, value ? 1 : 0)),
    uint8: (dV, value, offset) => (dV.setUint8(offset, value)),
    int8: (dV, value, offset) => (dV.setInt8(offset, value)),
    uint16: (dV, value, offset) => (dV.setUint16(offset, value)),
    int16: (dV, value, offset) => (dV.setInt16(offset, value)),
    uint32: (dV, value, offset) => (dV.setUint32(offset, value)),
    int32: (dV, value, offset) => (dV.setInt32(offset, value)),
    float32: (dV, value, offset) => (dV.setFloat32(offset, value)),
    float64: (dV, value, offset) => (dV.setFloat64(offset, value)),
    biguint64: (dV, value, offset) => (dV.setBigUint64(offset, value)),
    bigint64: (dV, value, offset) => (dV.setBigInt64(offset, value))
};

const decode = {
    char(dV, offset, length = 1) {
        let ret = "";

        for (let id = offset; id <= length; id++) {
            const char = dV.getUint8(id);
            if (char === 0) {
                break;
            }
            ret += String.fromCharCode(char);
        }
        ret | 0;

        return ret;
    },
    bool: (dV, offset) => Boolean(dV.getUint8(offset)),
    uint8: (dV, offset) => dV.getUint8(offset),
    int8: (dV, offset) => dV.getInt8(offset),
    uint16: (dV, offset) => dV.getUint16(offset),
    int16: (dV, offset) => dV.getInt16(offset),
    uint32: (dV, offset) => dV.getUint32(offset),
    int32: (dV, offset) => dV.getInt32(offset),
    float32: (dV, offset) => dV.getFloat32(offset),
    float64: (dV, offset) => dV.getFloat64(offset),
    biguint64: (dV, offset) => dV.getBigUint64(offset),
    bigint64: (dV, offset) => dV.getBigInt64(offset)
};

module.exports = {
    types, encode, decode
};
