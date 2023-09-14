import { DesktopElectron } from "@skylixgh/nitrojs-desktop-electron";

/**
 * Application main class
 */
new class Main {
    /**
     * The application
     */
    private app: DesktopElectron;
    
    /**
     * Application main entry
     */
    public constructor() {
        this.app = new DesktopElectron();
        this.app.start();
    }
}
