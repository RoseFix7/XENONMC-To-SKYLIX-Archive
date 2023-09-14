/**
 * Settings for the DesktopElectron module
 */
export default interface DesktopElectronSettings {
    /**
     * Settings for the main window
     */
    window: {
        /**
         * Window width
         */
        width: number;

        /**
         * Min window width
         */
        minWidth: number;

        /**
         * Max window width
         */
        maxWidth: number;

        /**
         * Window height
         */
        height: number;

        /**
         * Min window height
         */
        minHeight: number;

        /**
         * Max window height
         */
        maxHeight: number;
    }
}
