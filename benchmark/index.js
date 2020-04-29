/* eslint-disable id-length */
/* eslint-disable no-mixed-operators */
"use strict";

const fs = require("fs");
const { join } = require("path");
const { Struct, Types } = require("..");
const protobuf = require("protocol-buffers");

const messages = protobuf(fs.readFileSync(join(__dirname, "test.proto")));

function str2ab(str) {
    const array = new Uint8Array(str.length);
    for (let id = 0; id < str.length; id++) {
        array[id] = str.charCodeAt(id);
    }

    return array.buffer;
}

const CLikeStruct = new Struct({
    foo: Types.char(10),
    boo: Types.uInt8,
    isHuman: Types.bool
});

const payload = {
    foo: "hello",
    boo: 55,
    isHuman: false
};

const arrBuffer = CLikeStruct.encode(payload);
console.log(arrBuffer);
console.log(CLikeStruct.decode(arrBuffer));

console.time("encode_ab");
for (let i = 0; i < 1e6; i++) {
    CLikeStruct.encode(payload);
}
console.timeEnd("encode_ab");

console.time("encode_json");
for (let i = 0; i < 1e6; i++) {
    str2ab(JSON.stringify(payload));
}
console.timeEnd("encode_json");

console.time("encode_protobuf");
for (let i = 0; i < 1e6; i++) {
    messages.Test.encode(payload);
}
console.timeEnd("encode_protobuf");

// const arrBuffer = CLikeStruct.encode(payload);

console.time("decode_ab");
for (let i = 0; i < 1e6; i++) {
    CLikeStruct.decode(arrBuffer);
}
console.timeEnd("decode_ab");

const bufPayload = str2ab(JSON.stringify(payload));
console.time("decode_json");
for (let i = 0; i < 1e6; i++) {
    JSON.parse(Buffer.from(bufPayload).toString());
}
console.timeEnd("decode_json");

const protoPayload = messages.Test.encode(payload);
console.time("decode_protobuf");
for (let i = 0; i < 1e6; i++) {
    messages.Test.decode(protoPayload);
}
console.timeEnd("decode_protobuf");
