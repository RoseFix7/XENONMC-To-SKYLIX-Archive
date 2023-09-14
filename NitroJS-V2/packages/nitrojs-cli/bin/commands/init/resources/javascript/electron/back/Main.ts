const ElectronMainJS = `import { DesktopElectron } from "@skylixgh/nitrojs-desktop-electron";

/**
 * Application main class
 */
new class Main {
    /**
     * The application
     */
    app;
    
    /**
     * Application main entry
     */
    constructor() {
        this.app = new DesktopElectron();
        this.app.start();
    }
}
`;

export default ElectronMainJS;
