import { spawn, ChildProcess } from "child_process";
import path from "path";
import ElectronSettings from "./ElectronSettings";
import Errors from "./Errors";
import RendererSettings from "./RendererSettings";
import fs from "fs-extra";
import chokidar, { FSWatcher } from "chokidar";
import { logging } from "@illuxdev/oxide-terminal";

export default class Dev {
	/**
	 * All processes living status
	 */
	private life = {
		renderer: false,
		electron: false,
	};

	/**
	 * All processes that are booting
	 */
	private bootUpProcesses = {
		renderer: false,
		electron: false,
	};

	/**
	 * Process of the renderer
	 */
	private rendererProcess?: ChildProcess;

	/**
	 * Process of the Electron development app
	 */
	private electronProcess?: ChildProcess;

	/**
	 * The TypeScript watch compiler process
	 */
	private typeScriptProcess?: ChildProcess;

	/**
	 * Command for running npx via spawn
	 */
	private npxTrigger: string;

	/**
	 * Create a new development server
	 * @param settings Settings for the dev server
	 */
	public constructor() {
		this.npxTrigger = process.platform == "win32" ? "npx.cmd" : "npx";
	}

	/**
	 * Stop the renderer development server
	 */
	public stopRenderer() {
		if (this.rendererProcess && !this.rendererProcess.killed) {
			this.rendererProcess.kill("SIGTERM");
			this.life.renderer = false;
		}
	}

	/**
	 * Start the rendering server
	 * @param settings Settings for the renderer
	 * @returns A promise containing the server port if successful
	 */
	public startRenderer(settings: RendererSettings): Promise<number> {
		return new Promise((resolve, reject) => {
			if (this.bootUpProcesses.renderer) {
				reject(Errors.alreadyStarting);
				return;
			}

			if (this.life.renderer) {
				reject(Errors.alreadyRunning);
				return;
			}

			this.bootUpProcesses.renderer = true;

			const portFlag = settings.forcedPort ? settings.forcedPort + "" : "";

			this.rendererProcess = spawn(
				"node",
				["process/vite.js", settings.projectRoot, portFlag],
				{
					cwd: __dirname,
				}
			);

			const output = (text: string) => {
				if (!this.life.renderer) {
					const regexp = /> Local: http:\/\/(.*?):(.*?)\//.exec(text.replace(/\x1b\[[0-9;]*[mGKH]/g, ''));

					console.log(regexp);
					if (regexp) {
						this.bootUpProcesses.renderer = false;
						this.life.renderer = true;
						resolve(+regexp[2]);
					}
				}
			};

			this.rendererProcess?.stdout?.on("data", (t) => output(t.toString()));
			this.rendererProcess?.stderr?.on("data", (t) => output(t.toString()));
		});
	}

	/**
	 * Stop the Electron development app
	 */
	public stopElectron() {
		if (this.electronProcess && !this.electronProcess.killed) {
			this.electronProcess.kill("SIGTERM");
			this.life.electron = false;
		}
	}

	/**
	 * Stop the TypeScript watch compiler
	 */
	public stopTypeScript() {
		if (this.typeScriptProcess && !this.typeScriptProcess.killed) {
			this.typeScriptProcess.kill("SIGTERM");
		}
	}

	/**
	 * Start an Electron development app
	 * @param settings Settings for the Electron starter
	 * @returns Promise for when app has been started, error will contain an error from Error export
	 */
	public startElectron(settings: ElectronSettings): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.bootUpProcesses.electron) {
				reject(Errors.alreadyStarting);
				return;
			}

			if (this.life.electron) {
				reject(Errors.alreadyRunning);
			}

			let tscRunning = false;

			const startTypeScript = (done: CallableFunction) => {
				this.typeScriptProcess = spawn(
					"node",
					["process/tsc.js", settings.electronRoot],
					{
						cwd: __dirname,
					}
				);

				this.typeScriptProcess.stdout?.on("data", (data) => {
					if (!tscRunning) {
						if (data.toString().includes("Watching for file changes.\r\n")) {
							tscRunning = true;
							done();
						}
					}
				});
			};

			this.bootUpProcesses.electron = true;

			let electronFullMainPath = path.join(
				settings.projectRoot,
				settings.electronMain
			);
			if (electronFullMainPath.endsWith(".ts")) {
				electronFullMainPath.slice(0, -1) + ".ts";
			}

			if (!fs.existsSync(electronFullMainPath)) {
				this.bootUpProcesses.electron = false;
				reject(Errors.entryNotFound);
				return;
			}

			startTypeScript(() => {
				const startElectron = () => {
					this.electronProcess = spawn(
						"node",
						[
							"process/electron.js",
							settings.projectRoot,
							settings.electronMain.slice(0, -2) + "js",
							settings.port + "",
						],
						{
							cwd: __dirname,
						}
					);

					this.electronProcess!.stdout?.on("data", (data) => {
						const promiseJsonParse = <ObjectType>(stringifiedJson: string) => {
							return new Promise<ObjectType>((resolve, reject) => {
								try {
									const jsonObject = JSON.parse(stringifiedJson);
									resolve(jsonObject);
								} catch (error) {
									reject(error);
								}
							});
						};

						const dataLines = data.toString().split("\n") as string[];

						dataLines.forEach((dataLine) => {
							promiseJsonParse<any>(dataLine.toString())
								.then((message) => {
									switch (message.channel) {
										case "_internal:setup:task":
											if (
												!this.life.electron &&
												message.message.renderer.success
											) {
												this.life.electron = true;
												this.bootUpProcesses.electron = false;

												startChokidar();
												resolve();
											}
											break;
									}
								})
								.catch(() => {});
						});
					});
				};

				const stopElectron = () => {
					this.electronProcess?.kill("SIGTERM");
				};

				const restartElectron = () => {
					stopElectron();
					startElectron();
				};

				let watcher: FSWatcher;
				startElectron();

				const startChokidar = () => {
					watcher = chokidar.watch(settings.electronRoot);

					watcher.on("all", (action, pathName) => {
						if (pathName.endsWith(".js")) {
							restartElectron();
						}
					});

					settings.otherElectronDirs.forEach(otherDir => {
						watcher = chokidar.watch(path.join(settings.projectRoot, otherDir));

						watcher.on("all", (action, pathName) => {
							if (pathName.endsWith(".js")) {
								restartElectron();
							}
						});
					})
				};
			});
		});
	}
}
