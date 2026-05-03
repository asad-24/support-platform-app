const debug = require('@core/util/functions/debug');
const auth_routes = require("./auth");
const user_routes = require("./users");
const volunteer_application_routes = require("./volunteer-applications");
const volunteer_routes = require("./volunteer");
const admin_routes = require("./admin");
const school_routes = require("./schools");
const site_routes = require("./sites");
const dashboard_routes = require("./dashboard");
const export_routes = require("./exports");
const location_routes = require("./locations");
debug('routes:index: loaded');

module.exports = [
  { path: "/auth", name: "auth.", group: auth_routes },
  { path: "/users", name: "users.", group: user_routes },
  { path: "/volunteer-applications", name: "volunteerApplications.", group: volunteer_application_routes },
  { path: "/volunteer", name: "volunteer.", group: volunteer_routes },
  { path: "/admin", name: "admin.", group: admin_routes },
  { path: "/schools", name: "schools.", group: school_routes },
  { path: "/sites", name: "sites.", group: site_routes },
  { path: "/dashboard", name: "dashboard.", group: dashboard_routes },
  { path: "/exports", name: "exports.", group: export_routes },
  { path: "/locations", name: "locations.", group: location_routes },
];
