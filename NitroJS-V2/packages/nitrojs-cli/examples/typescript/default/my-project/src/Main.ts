import http from "http";

/**
 * Application main class
 */
new class Main {
    /**
     * Application main entry
     */
    public constructor() {
        const server = http.createServer((req, res) => {
            res.write("Hello world!");
            res.end();
        });

        console.log(" - Info: Starting server");

        server.listen(8080, "localhost", 10000, () => {
            console.log(" - Success: The server is running at port 8080");
        });
    }
}
