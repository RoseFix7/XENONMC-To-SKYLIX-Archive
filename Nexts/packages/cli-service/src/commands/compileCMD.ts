import {Argv} from 'yargs';
import {BuildOptions, BuildResult} from 'esBuild';
import type ESBuildModuleType from 'esbuild';
import logger from '@nexts-stack/logger';
import readConfig from '../misc/readConfig';
import getAppPackages from '../manager/getAppPackages';
import path from 'path';
import {spawn} from 'child_process';
import crashError from '../misc/crashError';
import fsSync from 'fs';
import fs from 'fs/promises';
import generateAppPkg from '../misc/generateAppPkg';

/**
 * The compile command.
 * @param program The yargs program.
 * @returns {void}
 */
export default function compileCMD(program: Argv) {
	program
		.command('compile [path]', 'Compile your project.', {
			config: {
				type: 'string',
				default: '*',
				describe: 'Path to the config file.',
				alias: 'c',
			},
			path: {
				type: 'string',
				default: './',
				describe: 'Path to the project.',
			},
			watch: {
				type: 'boolean',
				default: false,
				describe: 'Watch for changes and compile on the fly.',
				alias: 'w',
			},
		}, async (argv) => {
			const startTime = performance.now();

			logger.log('Checking environment for compilation');
			logger.log('Fetching sub projects');

			// This dynamic import was designed to not be built by ESBuild
			const esBuild = await import(['es', 'build'].join('')) as typeof ESBuildModuleType;
			const config = await readConfig(argv.path, argv.config);
			const projects = await getAppPackages(argv.path, config);
			const esBuilders = [] as BuildResult[];
			const maxBuilds = projects.packages?.length;
			let buildsStarted = 0;
			let tsBuildsFinished = 0;
			let loggedTSStarting = false;

			if ((projects.apps ?? []).length === 0 && (projects.packages ??[]).length === 0) {
				logger.error('There are no packages or apps to compile.');
				process.exit(1);
			}

			if ((projects.apps ?? []).length > 0) {
				logger.log('Generating cache for apps');
				for (const app of projects.apps ?? []) {
					await generateAppPkg(config, app, path.join(process.cwd(), argv.path, app.path));
				}
			}

			if ((projects.packages ?? []).length === 0) {
				logger.success(`Successfully compiled project after ${Math.round(performance.now() - startTime)}ms`);
				return;
			}

			logger.log('Starting ESBuild compiler');

			const generalESBuildConfig: BuildOptions = {
				logLevel: 'silent',
				jsx: 'preserve',
				bundle: true,
				incremental: true,
				target: 'ESNext',
				sourcemap: true,
				platform: 'node',
			};

			for (const pkg of projects.packages ?? []) {
				const mainPathExact = path.join(process.cwd(), argv.path, pkg.path, pkg.main);
				const buildDirExact = path.join(process.cwd(), argv.path, pkg.path, 'build');

				if (!fsSync.existsSync(path.join(process.cwd(), argv.path, pkg.path, 'tsconfig.json')) && config.typescript) {
					logger.error([
						'This project is using TypeScript as specified in the config,',
						`but the package called ${pkg.name} does not have a tsconfig.json file.`,
						'Please make sure to have a tsconfig.json file in the root of the package.',
					].join(' '));
					process.exit(1);
				}

				if (fsSync.lstatSync(path.join(process.cwd(), argv.path, pkg.path, 'tsconfig.json')).isFile() && config.typescript) {
					generalESBuildConfig.tsconfig = path.join(process.cwd(), argv.path, pkg.path, 'tsconfig.json');
				} else if (config.typescript) {
					logger.error([
						`The package called ${pkg.name} is using TypeScript as specified in the config,`,
						`but tsconfig.json seems to be a directory but not a file.`,
						`Please make sure to have a tsconfig.json file in the root of the package.`,
					].join(' '));
					process.exit(1);
				}

				try {
					const dtsRelativeFileName = `${pkg.main.slice(0, -2) }d.ts`;

					const packageFile = {
						name: `${pkg.org ? `@${pkg.org}/` : ''}${pkg.name}`,
						version: config.version,
						author: config.author,
						main: pkg.main,
						exports: {
							require: './build/dist.commonjs.cjs',
							import: './build/dist.esm.mjs',
						},
						...(config.typescript && {types: `./${ path.join('./build/types/', dtsRelativeFileName).replace(/\\/g, '/')}`}),
						...(pkg.license && {license: pkg.license}),
						...(pkg.description && {description: pkg.description}),
						...(pkg.keywords && {keywords: pkg.keywords}),
						...(pkg.dependencies && {dependencies: pkg.dependencies}),
					};

					await fs.writeFile(
						path.join(process.cwd(), argv.path, pkg.path, 'package.json'),
						`${JSON.stringify(packageFile, null, config.formatting?.package?.indent ?? '\t') }\n`,
					);
				} catch (error) {
					logger.error(`Failed to generate package file for ${pkg.name}`);
				}

				const esBuilderCommon = await esBuild.build({
					...generalESBuildConfig,
					entryPoints: [mainPathExact],
					outfile: path.join(buildDirExact, 'dist.commonjs.cjs'),
					format: 'cjs',
					watch: argv.watch ? {
						onRebuild: () => {
							logger.log(`All (${maxBuilds}) project(s) will be rebuilt for CJS`);
						},
					} : false,
				});

				const esBuilderESM = await esBuild.build({
					...generalESBuildConfig,
					entryPoints: [mainPathExact],
					outfile: path.join(buildDirExact, 'dist.esm.mjs'),
					format: 'esm',
					watch: argv.watch ? {
						onRebuild: () => {
							logger.log(`All (${maxBuilds}) project(s) will be rebuilt for ESM`);
						},
					} : false,
				});

				esBuilders.push(esBuilderCommon, esBuilderESM);
				buildsStarted++;

				const getBootTime = () => Math.round(performance.now() - startTime);

				if (config.typescript) {
					if (!loggedTSStarting) {
						logger.log('Starting TypeScript type generations');
						loggedTSStarting = true;
					}

					let tsFinished = false;
					let tsOutDataLog = '';
					let spawnArgs = [] as string[];

					if (argv.watch) {
						spawnArgs = [
							'../../node_modules/typescript/bin/tsc',
							'--watch',
							'--rootDir',
							'./',
							'--emitDeclarationOnly',
							'--declaration',
							'--declarationDir',
							path.join(process.cwd(), argv.path, pkg.path, 'build', 'types'),
						];
					} else {
						spawnArgs = [
							path.join(process.cwd(), './node_modules/typescript/bin/tsc'),
							'--emitDeclarationOnly',
							'--rootDir',
							'./',
							'--declaration',
							'--declarationDir',
							path.join(process.cwd(), argv.path, pkg.path, `build`, 'types'),
						];
					}

					const typescriptChild = spawn(`node`, spawnArgs, {
						cwd: path.join(process.cwd(), argv.path, pkg.path),
					});

					typescriptChild.on('error', (error) => {
						logger.error(`Failed to start TypeScript type generation`);
						crashError(error);

						process.exit(1);
					});

					const setTSDone = () => {
						if (tsOutDataLog.split('').length == 0) {
							tsFinished = true;
						}
					};

					typescriptChild.on('exit', () => {
						if (!argv.watch) {
							setTSDone();
						}

						if (tsFinished) {
							tsBuildsFinished++;
						}

						if (tsFinished && tsBuildsFinished === maxBuilds) {
							logger.success(`Finished compiling all (${maxBuilds}) project(s) in ${getBootTime()}ms`);
							process.exit(0);
						} else if (tsFinished && tsBuildsFinished !== maxBuilds) {
							return;
						}

						logger.error('The TypeScript processed seems to have crashed for an unknown reason');
						logger.error(`Spawn Args: ${ spawnArgs.join(' ')}`);
						logger.error(`Spawn CWD: ${ path.join(process.cwd(), argv.path)}`);

						tsOutDataLog.split('\n').forEach((line) => {
							logger.error(line);
						});

						process.exit(1);
					});

					const onStandardMessage = (text: string) => {
						// Used for debugging the TS compiler
						// console.log(text.split(''))
						// process.stdout.write(text)

						if (!argv.watch) {
							tsOutDataLog += text;
							setTSDone();

							return;
						}

						if (/Watching for file changes/.test(text) && !tsFinished) {
							tsFinished = true;
							tsBuildsFinished++;

							if (tsBuildsFinished === maxBuilds) {
								logger.success(`Successfully watching all (${maxBuilds}) project(s) for changes after ${getBootTime()}ms`);
							}
						} else if (/Watching for file changes/.test(text) && tsFinished) {
							logger.log(`All (${maxBuilds}) project(s) will have their TypeScript declarations rebuild`);
						}
					};

					typescriptChild.stdout.on('data', (d) => onStandardMessage(d.toString()));
					typescriptChild.stderr.on('data', (d) => onStandardMessage(d.toString()));
				} else if (buildsStarted === maxBuilds) {
					if (argv.watch) {
						logger.success(`Successfully started watch compiler for all (${maxBuilds}) project(s) in ${getBootTime()}ms`);
					} else {
						logger.success(`Successfully compiled all (${maxBuilds}) project(s) in ${getBootTime()}ms`);
						process.exit(0);
					}
				}
			}
		});
}
