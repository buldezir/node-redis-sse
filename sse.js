const http = require("http");
const { Redis } = require("ioredis");
const { Readable } = require("stream");
const { v4 } = require("uuid");

const host = process.env.LISTEN_HOST || "127.0.0.1";
const port = process.env.LISTEN_PORT || 8081;
const redisURL = process.env.REDIS_URL || "127.0.0.1:6379";

const pingIntervalSeconds = 5;
const streams = new Set();

function sendSSE(data, event = "message") {
    if (streams.size > 0) {
        const uuid = v4();
        const json = JSON.stringify(data);
        streams.forEach((istream) => {
            istream.push(`id: ${uuid}\n`);
            istream.push(`event: ${event}\n`);
            istream.push(`data: ${json}\n\n`);
        });
    }
}

/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const requestListener = function (req, res) {
    const stream = new Readable({
        read() {},
    });

    streams.add(stream);

    req.socket.addListener("close", () => {
        streams.delete(stream);
        stream.push(null);
        stream.unpipe(res);
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.statusCode = 200;

    stream.pipe(res);
};

const server = http.createServer(requestListener);
const redis = new Redis(redisURL);

server.listen(port, host, () => {
    console.log(`server running at http://${host}:${port}`);

    redis.on("pmessage", (pattern, channel, message) => {
        const data = JSON.parse(message);
        data.time = Date.now();
        sendSSE(data, channel);
    });
    redis.psubscribe("*", (err, count) => {
        if (err) console.error(err);
    });

    // ping
    setInterval(() => {
        sendSSE({ time: Date.now() }, "ping");
    }, pingIntervalSeconds * 1000);
});

const gracefulShutdown = () => {
    console.info("SIGTERM signal received.");
    console.log("Closing http server.");
    redis.disconnect();
    server.close(() => {
        console.log("Http server closed.");
        process.exit(0);
    });
}
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
