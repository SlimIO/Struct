"use strict";

const iterationCount = 1e7;
console.log(`iteration count: ${iterationCount}`);

function nativeAB() {
    const arrBuffer = new ArrayBuffer(11);
    const dV = new DataView(arrBuffer);

    dV.setUint8(0, 10);
    dV.setUint16(1, 3500);
    dV.setBigUint64(3, 2n ** 20n);
}

function nodeBuffer() {
    const buf = Buffer.alloc(11);

    buf.writeUInt8(10, 0);
    buf.writeUInt16LE(3500, 1);
    buf.writeBigUInt64LE(2n ** 20n, 3);
}

nativeAB();
nativeAB();
nativeAB();
nodeBuffer();
nodeBuffer();
nodeBuffer();

console.time("native_ab");
for (let id = 0; id < iterationCount; id++) {
    nativeAB();
}
console.timeEnd("native_ab");

console.time("node_buffer");
for (let id = 0; id < iterationCount; id++) {
    nodeBuffer();

    // const arrBuffer = buf.buffer;
}
console.timeEnd("node_buffer");

