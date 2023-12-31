import deepmerge from 'deepmerge';
import * as app from '../app/app';
import {DeepPartial, NextsError} from '@nexts-stack/internal';
import {BrowserWindow} from 'electron';
import {EventEmitter} from 'events';
import electronLocalShortcut from 'electron-localshortcut';
import path from 'path';
import {enable} from '@electron/remote/main';
import Channel from './Channel';
import TypedEmitter, {EventMap} from 'typed-emitter';

/**
 * Errors for the window.
 */
export enum Errors {
	/**
	 * The Nexts app is not yet ready.
	 */
	APP_NOT_READY = 'APP_NOT_READY',

	/**
	 * You can't act on this window because it's closed.
	 */
	WINDOW_CLOSED = 'WINDOW_CLOSED',
}

/**
 * Window load settings.
 */
export interface Settings {
	/**
	 * The window frame settings.
	 */
	frame: {
		/**
		 * The width of the window by default.
		 */
		width: number;

		/**
		 * The height of the window by default.
		 */
		height: number;

		/**
		 * Whether the window should be in full screen mode.
		 */
		fullscreen: boolean;

		/**
		 * Window restrictions.
		 */
		restrictions: {
			/**
			 * If the window is resizable.
			 */
			resize: boolean;

			/**
			 * If the window can fullscreen.
			 */
			fullscreen: boolean;

			/**
			 * Window size settings.
			 */
			size: {
				/**
				 * The minimum width of the window.
				 */
				maxWidth: number;

				/**
				 * The minimum height of the window.
				 */
				maxHeight: number;

				/**
				 * The minimum width of the window.
				 */
				minWidth: number;

				/**
				 * The minimum height of the window.
				 */
				minHeight: number;
			}
		}
	};

	/**
	 * The default URL path.
	 */
	defaultPath: string;
}

const defaultSettings: Settings = {
	frame: {
		width: 800,
		height: 600,
		fullscreen: false,
		restrictions: {
			resize: true,
			fullscreen: true,
			size: {
				maxWidth: Infinity,
				maxHeight: Infinity,
				minWidth: 100,
				minHeight: 250,
			},
		},
	},
	defaultPath: '/',
};

/**
 * The event types.
 */
interface EventTypes extends EventMap {
	/**
	 * Listen for when the window is closed.
	 */
	close(): void;

	/**
	 * Listen for when the window is ready.
	 */
	ready(): void;
}

/**
 * A browser window.
 */
export default class Window extends (EventEmitter as unknown as new () => TypedEmitter<EventTypes>) {
	/**
	 * The window settings.
	 */
	#settings: Settings;

	/**
	 * The window.
	 */
	readonly #browserWindow: BrowserWindow;

	/**
	 * If the renderer is ready.
	 */
	#rendererReady = false;

	/**
	 * If the window is ready.
	 */
	#windowReady = false;

	/**
	 * If the window is closed.
	 */
	#closed = false;

	/**
	 * The window ID.
	 */
	public readonly id: number;

	/**
	 * Create a new window.
	 * @param settings The window settings.
	 */
	public constructor(settings: DeepPartial<Settings>) {
		super();

		this.#settings = deepmerge<Settings, typeof settings>(defaultSettings, settings);

		if (!app.isReady()) {
			throw new NextsError(Errors.APP_NOT_READY, 'The Nexts app is not yet ready.');
		}

		this.#browserWindow = new BrowserWindow({
			width: this.#settings.frame.width,
			height: this.#settings.frame.height,
			minWidth: this.#settings.frame.restrictions.size.minWidth,
			minHeight: this.#settings.frame.restrictions.size.minHeight,
			maxWidth: this.#settings.frame.restrictions.size.maxWidth,
			maxHeight: this.#settings.frame.restrictions.size.maxHeight,
			fullscreen: this.#settings.frame.fullscreen,
			resizable: this.#settings.frame.restrictions.resize,
			show: false,
			icon: process.env.NEXTS_DEV_ICON,
			webPreferences: {
				nodeIntegration: true,
				webSecurity: false,
				contextIsolation: false,
				webviewTag: true,
			},
			frame: false,
		});

		this.id = this.#browserWindow.id;
		enable(this.#browserWindow.webContents);

		const progressiveLogicAction = () => {
			if (!this.#rendererReady || !this.#windowReady) return;
			this.emit('ready');
		};

		this.#browserWindow.once('close', () => {
			this.#closed = true;
			this.emit('close');
		});

		this.#browserWindow.once('ready-to-show', () => {
			this.#windowReady = true;
			this.#browserWindow.show();

			progressiveLogicAction();
		});

		if (process.env.NEXTS_DEV_RENDERER) {
			this.#browserWindow.loadURL(new URL(this.#settings.defaultPath, process.env.NEXTS_DEV_RENDERER).href).then(() => {
				this.#rendererReady = true;
				progressiveLogicAction();
			});

			return;
		}

		// This build is relative to the build location
		this.#browserWindow.loadFile(path.join(__dirname, '../build/renderer/index.html')).then(() => {
			this.#rendererReady = true;
			progressiveLogicAction();
		});
	}

	/**
	 * Register a shortcut in the window.
	 * @param shortcut The shortcut.
	 * @param listener The event listener.
	 * @returns {void}
	 */
	public registerShortcut(shortcut: string, listener: () => void) {
		electronLocalShortcut.register(this.#browserWindow, shortcut, listener);
	}

	/**
	 * Create a new communication channel.
	 * @param name The channel name.
	 * @returns {void}
	 */
	public channel(name: string) {
		return new Channel(this, name);
	}

	/**
	 * Close the window.
	 * @returns {void}
	 */
	public close() {
		if (this.#closed) {
			throw new NextsError(Errors.WINDOW_CLOSED, 'The window is already closed');
		}

		this.#browserWindow.close();
		this.#rendererReady = false;
		this.#windowReady = false;
		this.#closed = true;
	}

	/**
	 * If the window is already closed.
	 */
	public get closed() {
		return this.#closed;
	}

	/**
	 * Write a message to the web contents IPC listeners.
	 * @param channel The channel name.
	 * @param exactMessage The exact message.
	 * @returns {void}
	 */
	public writeWebContentsData(channel: string, exactMessage: { [key: string]: any }) {
		if (this.#closed) {
			throw new NextsError(Errors.WINDOW_CLOSED, 'The window is already closed');
		}

		this.#browserWindow.webContents.send(channel, exactMessage);
	}
}
