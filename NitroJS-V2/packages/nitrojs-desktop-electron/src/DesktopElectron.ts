import DesktopElectronSettings from "./DesktopElectronSettings";
import deepmerge from "deepmerge";
import { PartialDeep } from "type-fest";
import electronIsDev from "electron-is-dev";
import { app as electronApp, BrowserWindow as ElectronBrowserWindow } from "electron";

/**
 * ElectronJS handle for NitroJS desktop apps
 */
export default class DesktopElectron {
	/**
	 * Desktop Electron settings
	 */
	private _settings: DesktopElectronSettings;

	/**
	 * If the Electron app is ready
	 */
	private electronAppReady = false;

	/**
	 * The default Electron window
	 */
	private baseWindow?: ElectronBrowserWindow;

	/**
	 * New desktop Electron app
	 * @param settings Settings for the Electron app
	 */
	public constructor(settings: PartialDeep<DesktopElectronSettings> = {}) {
		if (electronApp.isReady()) this.electronAppReady = true;
		else electronApp.once("ready", () => (this.electronAppReady = true));

		this._settings = deepmerge<DesktopElectronSettings, typeof settings>(
			{
				window: {
					height: 800,
					width: 1400,
					minWidth: 400,
					minHeight: 200,
					maxHeight: Infinity,
					maxWidth: Infinity,
				},
			},
			settings
		);
	}

	/**
	 * Start the app
	 */
	public start() {
		const logicApplication = () => {
			this.baseWindow = new ElectronBrowserWindow({
				width: this._settings.window.width,
				height: this._settings.window.height,
				maxWidth: this._settings.window.maxWidth,
				maxHeight: this._settings.window.maxHeight,
				minWidth: this._settings.window.minWidth,
                minHeight: this._settings.window.minHeight,
                show: false
            });

            this.baseWindow.loadURL("https://google.com");
            
            this.baseWindow.once("ready-to-show", () => {
                this.baseWindow?.show();
            });
		};

		if (this.electronAppReady) logicApplication();
		else {
			electronApp.once("ready", () => {
				this.electronAppReady = true;
				logicApplication();
			});
		}
	}
}
