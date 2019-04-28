const { Struct, Types } = require("../");

const Schema = {
    name: Types.char(10),
    hp: Types.uint8()
};
const Player = new Struct(Schema);

const buf = Player.encode({
    name: "fraxken",
    hp: 100
});
console.log(buf);

const DATA = {
    name: "fraxken",
    hp: 100
};

const TIMES = 1000000;
const then = Date.now();
for (let i = 0; i < TIMES; i++) {
    Player.encode(DATA);
}
const diff = Date.now() - then;
console.log("Encoded %d objects in %d ms (%d enc/s)\n", TIMES, diff, (1000 * TIMES / diff).toFixed(0));

