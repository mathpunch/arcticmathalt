import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import request from '@cypress/request';
import chalk from 'chalk';

const __dirname = path.resolve();
const server = http.createServer();
const app = express();

// FORCE MOBILE USER-AGENT HERE
const bareServer = createBareServer('/seal/', {
    logErrors: false,
    // This function runs before the proxy fetches the website
    maintainer: {
        email: "admin@arctic.icu"
    }
});

app.use(express.static(path.join(__dirname, 'static')));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Routes for your pages
const routes = ['/mastery', '/apps', '/gms', '/lessons', '/info', '/mycourses'];
routes.forEach(route => {
    app.get(route, (req, res) => {
        const fileName = route === '/mastery' ? 'loader.html' : 
                         route === '/lessons' ? 'agloader.html' : 
                         route === '/mycourses' ? 'loading.html' : `${route.slice(1)}.html`;
        res.sendFile(path.join(__dirname, 'static', fileName));
    });
});

// Worker mirror
app.get('/worker.js', (req, res) => {
    request('https://worker.mirror.ftp.sh/worker.js', (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
            res.setHeader('Content-Type', 'text/javascript');
            res.send(body);
        } else {
            res.status(500).send('console.error("Mirror Down")');
        }
    });
});

server.on("request", (req, res) => {
    if (bareServer.shouldRoute(req)) {
        // SPOOFING LOGIC: We inject a mobile header before routing
        req.headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else if (req.url.includes("/wisp")) {
        wisp.routeRequest(req, socket, head);
    } else {
        socket.end();
    }
});

server.listen({ port: 8001 }, () => {
    console.log(chalk.magenta.bold('Arctic 1.0: Mobile-Spoof Mode Engaged'));
});
