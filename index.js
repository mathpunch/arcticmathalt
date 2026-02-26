import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const __dirname = path.resolve();
const server = http.createServer();
const app = express();
const bareServer = createBareServer('/seal/');

// Middleware for parsing and serving your static folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// Serve the internal UV/Bare/Epoxy files from node_modules
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Defined Page Routes
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

app.get('/student', (req, res) => res.redirect('/mastery'));

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, './static/404.html'));
});

// Routing for Bare Server
server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

// Routing for Wisp (WebSockets)
server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else if (req.url.startsWith("/wisp")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8001;
server.listen({ port: PORT }, () => {
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.green('  🌟 Arctic 1.0 Status: ') + chalk.bold('Active'));
  console.log(chalk.green('  🌍 Port: ') + chalk.bold(PORT));
  console.log(chalk.blue('  🔗 URL: ') + chalk.underline(`http://localhost:${PORT}`));
  console.log(chalk.cyan('-----------------------------------------------'));
});
