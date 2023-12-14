import { spawn } from "child_process";

console.log(process.argv);

const vite = spawn(
	process.platform == "win32" ? "npx.cmd" : "npx",
	["tsc", "--watch", "--module", "commonjs", "--target", "esnext", "--noEmit", "false"],
	{
		cwd: process.argv[2],
	}
);

vite.stdout.on("data", (data) => process.stdout.write(data.toString()));
vite.stderr.on("data", (data) => process.stderr.write(data.toString()));
