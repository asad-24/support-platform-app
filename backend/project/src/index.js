const express = require('express');
const path = require('path');
const cors = require('cors');

const config = require('@core/util/functions/config');
const routes = require('@src/routes');
const bind_routes = require('@core/util/functions/bind_routes');
const debug = require('@core/util/functions/debug');

const app = express();
const corsOrigins = String(config('server.corsOrigins', ''))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : true, credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

debug('server: binding routes');
bind_routes(app, routes, {
  controllers_base_dir: path.resolve(__dirname, 'controllers'),
});

const host = config('server.host', '127.0.0.1');
const port = config('server.port', 3000);
debug(`server: starting at http://${host}:${port}`);
app.listen(port, host, () => {
  debug(`server: listening at http://${host}:${port}`);
  console.log(`Server running on http://${host}:${port}`);
});
