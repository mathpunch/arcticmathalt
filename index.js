import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { server as wisp } from "@mercuryworkshop/wisp-js/server"; // Use the package you actually have installed
import request from '@cypress/request';
import chalk from 'chalk';
import packageJson from './package.json' with { type: 'json' };

const __dirname = path.resolve();
const server = http.createServer();
const bareServer = createBareServer('/seal/');
const app = express(); // Standard initialization
const version = packageJson.version;
const discord = 'https://discord.gg/unblocking';

const routes = [
  { route: '/mastery', file: './static/loader.html' },
  { route: '/apps', file: './static/apps.html' },
  { route: '/gms', file: './static/gms.html' },
  { route: '/lessons', file: './static/agloader.html' },
  { route: '/info', file: './static/info.html' },
  { route: '/mycourses', file: './static/loading.html' }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'static')));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

routes.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

app.get('/student', (req, res) => res.redirect('/mastery'));

// Robust worker fetching
app.get('/worker.js', (req, res) => {
  request('https://worker.mirror.ftp.sh/worker.js', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.setHeader('Content-Type', 'text/javascript');
      res.send(body);
    } else {
      // Fallback: If mirror is down, try to send a local one or a 404
      res.status(404).send('Worker not found');
    }
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, './static/404.html'));
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else if (req.url.startsWith("/wisp")) { // Catch-all for desktop/mobile variations
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen({ port: 8001 }, () => {
  console.log(chalk.blue.bold(`Arctic 1.0 is online on port 8001`));
});
