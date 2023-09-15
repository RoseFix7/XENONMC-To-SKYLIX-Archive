const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync(path.join(__dirname, "../test/scratch.ts"))) {
    console.error("[ERROR] Missing test/scratch.ts source");
    process.exit(1);
}

esbuild.build({
    outfile: path.join(__dirname, "../test/scratch.js"),
    entryPoints: [path.join(__dirname, "../test/scratch.ts")],
    bundle: true,
    platform: "node",
});

esbuild.build({
    outfile: path.join(__dirname, "../packages/nitrojs-cli/build/bin/Binary.js"),
    entryPoints: [path.join(__dirname, "../packages/nitrojs-cli/bin/Binary.ts")],
    bundle: true,
    platform: "node",
});

esbuild.build({
    outfile: path.join(__dirname, "../packages/nitrojs-terminal/build/src/Terminal.js"),
    entryPoints: [path.join(__dirname, "../packages/nitrojs-terminal/src/Terminal.ts")],
    bundle: true,
    platform: "node",
});