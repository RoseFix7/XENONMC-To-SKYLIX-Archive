export default interface AppConfig {
	/**
	 * The product name of your app
	 */
	name?: string;

	/**
	 * All file resource paths
	 */
	paths?: {
		/**
		 * Path for the electron main process file
		 */
		electronMain?: string;

		/**
		 * Root directory for all files relating for electron
		 */
		electronRoot?: string;

		/**
		 * Path to the electron preload file
		 */
		electronPreload?: string;

		/**
		 * Other directories that could be related to Electron, when files or folders are changed here, your Electron development app will auto reload
		 */
		otherElectronDirs?: string[];
	};
}
