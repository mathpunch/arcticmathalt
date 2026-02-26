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
import packageJson from './package.json' with { type: 'json' };

const __dirname = path.resolve();
const server = http.createServer();
const app = express();
const bareServer = createBareServer('/seal/');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'static')));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Routes
const routes = [
  { route: '/mastery', file: './static/loader.html' },
  { route: '/apps', file: './static/apps.html' },
  { route: '/gms', file: './static/gms.html' },
  { route: '/lessons', file: './static/agloader.html' },
  { route: '/info', file: './static/info.html' },
  { route: '/mycourses', file: './static/loading.html' }
];

routes.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Worker.js fallback (Fixes blank screens/loading loops)
app.get('/worker.js', (req, res) => {
  request('https://worker.mirror.ftp.sh/worker.js', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.setHeader('Content-Type', 'text/javascript');
      res.send(body);
    } else {
      res.status(500).send('console.error("Worker Mirror Down");');
    }
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, './static/404.html'));
});

// Handle standard Proxy Requests
server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

// Handle WebSocket (Wisp) Upgrades - FIXED FOR DESKTOP
server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else if (req.url.startsWith("/wisp")) {
    // Desktop browsers sometimes add a trailing slash or parameters
    // wisp-js handles the handshake internally
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = 8001;
server.listen({ port: PORT }, () => {
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.green('  🌟 Arctic 1.0 Status: ') + chalk.bold('Active'));
  console.log(chalk.green('  🌍 Port: ') + chalk.bold(PORT));
  console.log(chalk.cyan('-----------------------------------------------'));
});
