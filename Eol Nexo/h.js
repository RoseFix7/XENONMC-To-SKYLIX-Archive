(async () => {
    const pixels = require('image-pixels');

var { data, width, height } = await pixels('https://cdn.discordapp.com/attachments/924410965708111902/952407475234160691/download.png');

let ratB = 0;
let ratW = 0;
let ratT = 0;

console.log(` MTXWH: ${width} x ${height}`);
console.log(` MTXLL: ${data.length}`);

data.forEach((px) => {
    if (px === 0) ratT++;
    else if (px === 255) ratW++;
    else ratB++;
})

console.log(` MTXBB: ${ratB}`);
console.log(` MTXWW: ${ratW}`);
console.log(` MTXTT: ${ratT}`);

while(true) {}
})()