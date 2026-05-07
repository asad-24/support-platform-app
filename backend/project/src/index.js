const express = require('express');
const path = require('path');
const cors = require('cors');

const config = require('@core/util/functions/config');
const routes = require('@src/routes');
const bind_routes = require('@core/util/functions/bind_routes');
const debug = require('@core/util/functions/debug');
const FileStorage = require('@src/services/FileStorage');

const app = express();
const corsOrigins = String(config('server.corsOrigins', ''))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAnyCorsOrigin = !corsOrigins.length || corsOrigins.includes('*');
app.use((req, res, next) => {
  const origin = req.header('origin');
  const allowedOrigin = allowAnyCorsOrigin
    ? origin
    : (corsOrigins.includes(origin) ? origin : null);

  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      req.header('access-control-request-headers') || 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.use(cors({ origin: false }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(FileStorage.uploadRoot()));

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
