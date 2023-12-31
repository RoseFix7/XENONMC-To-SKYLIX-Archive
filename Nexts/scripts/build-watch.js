import {info} from './util/logger.js';
import {exec} from 'child_process';
import getProjects from './util/getProjects.js';
import fs from 'fs/promises';
import * as esBuild from 'esBuild';
import * as path from 'path';
import scssModulePlugin from 'esbuild-plugin-sass-modules';

info('Watch compiler');

const projects = await getProjects();
const builders = [];
const tsc = [];

projects.paths.filter(p => true).forEach(async (project) => {
	const packageFile = JSON.parse(await fs.readFile(path.join(project, 'package.json'), 'utf8'));
	const dependencies = Object.keys(packageFile.dependencies ?? {});

	const isReact = packageFile.react ?? false;
	const outFileCJS = isReact ? "common.jsx" : "common.cjs";
	const outFileMJS = isReact ? "module.jsx" : "module.mjs";

	packageFile.main = path.join('./build', outFileCJS);
	packageFile.type = 'module';
	packageFile.types = './build/types/index.d.ts';

	packageFile.exports = {
		import: `./${ path.join('./build', outFileMJS)}`,
		require: `./${ path.join('./build', outFileCJS)}`,
	};

	await fs.writeFile(path.join(project, 'package.json'), `${JSON.stringify(packageFile, null, '\t') }\n`, 'utf8');

	tsc.push(exec('npx tsc --watch', {
		cwd: project,
	}));

	info(`[Debug] ${project} -> ${dependencies.join(', ')}`);

	const buildAgain = async (type) => {
		try {
			if (['cjs', 'both'].indexOf(type)) {
				builders.push(await esBuild.build({
					format: 'cjs',
					outfile: path.join(project, './build', outFileCJS),
					bundle: true,
					target: 'ESNext',
					entryPoints: [path.join(project, 'src/index.ts')],
					incremental: true,
					external: isReact ? ['react'] : dependencies,
					sourcemap: true,
					watch: true,
					platform: isReact ? 'browser' : 'node',
					plugins: [
						scssModulePlugin(),
					],
					loader: {'.js': 'jsx'},
				}));
			}
		} catch (error) {
			console.error(error);
			await buildAgain('cjs');
		}

		try {
			if (['esm', 'both'].indexOf(type)) {
				builders.push(await esBuild.build({
					format: 'esm',
					outfile: path.join(project, './build', outFileMJS),
					bundle: true,
					target: 'ESNext',
					entryPoints: [path.join(project, 'src/index.ts')],
					incremental: true,
					external: isReact ? ['react'] : dependencies,
					sourcemap: true,
					watch: true,
					platform: isReact ? 'browser' : 'node',
					plugins: [
						scssModulePlugin(),
					],
					loader: {'.js': 'jsx'},
				}));
			}
		} catch (error) {
			console.error(error);
			await buildAgain('esm');
		}
	};

	await buildAgain('both');
});
