import { TCPNodeServer } from "../../src/TCPNode";
import fs from "fs";



const server = new TCPNodeServer({
	port: 9099,
	host: "0.0.0.0",
	ssl: {
		certificate: fs.readFileSync("C:\\Users\\xfaon\\Documents\\certificate.pem").toString(),
		key: fs.readFileSync("C:\\Users\\xfaon\\Documents\\key.pem").toString(),
	},
});

server.on("open", (conn) => {
	console.log(
		`TCP/TLS > New connection | CurrentlyConnected = ${server.totalAlive} SocketIP = ${conn.remoteIPAddress}`
	);

    conn.request("main", undefined, (msg) => {
        JSON.stringify(msg, null, 4).split("\n").forEach(line => {
            console.log("TCP/TLS > " + line);
        });

        server.send("main:socket", undefined, {
            action: "received",
            contents: msg
        });
    });

	conn.on("close", () => {
		console.log(
			`TCP/TLS > Lost connection | CurrentlyConnected = ${server.totalAlive} SocketIP = ${conn.remoteIPAddress}`
		);
	});
});

server.on("ready", (addr) => {
	console.log(`Server running at ${addr}`);
});

server.start();
