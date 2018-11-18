const { Struct, Types } = require("../");

const Player = new Struct({
    name: Types.char(10),
    hp: Types.uint8(),
    foo: Types.char(10),
    bar: Types.uint8()
});

const DATA = {
    name: "fraxken",
    hp: 100,
    foo: "world!",
    bar: 10
};

const TIMES = 1000000;
const then = Date.now();
for (let i = 0; i < TIMES; i++) {
    Player.encode(DATA);
}
const diff = Date.now() - then;
console.log("Encoded %d objects in %d ms (%d enc/s)\n", TIMES, diff, (1000 * TIMES / diff).toFixed(0));

// const buf = Player.encode({
//     name: "fraxken",
//     hp: 100,
//     foo: "world!",
//     bar: 10
// });
// console.log(buf);
