const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');

const stacksPath = path.join(__dirname, 'node_modules/@nexts-stack');
fs.rmSync(stacksPath, {
	recursive: true,
	force: true,
});

exec('npm i');
