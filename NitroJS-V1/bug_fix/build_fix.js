const esbuild = import("esbuild");
const fs = require("fs");
const path = require("path");
const c_p = require("child_process");

const packages = fs.readdirSync(path.join(__dirname, "../packages"));
console.log("Detected Packages: [Building Correctly]");
packages.forEach((package) => {
    console.log(`-- ${package}`);
});
console.log("");
console.log("Building all packages");

packages.forEach((package) => {
    console.log("");
    console.log(`-- Started compiling '${package}'`);

    const result = esbuild.buildSync({
        
    });

    console.log(`-- Finished compiling '${package}'`);
});