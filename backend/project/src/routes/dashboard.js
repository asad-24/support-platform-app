module.exports = [
  { method: 'GET', path: '/summary', name: 'summary', middleware: 'auth', handler: 'site/SiteDashboardController.summary' },
];
