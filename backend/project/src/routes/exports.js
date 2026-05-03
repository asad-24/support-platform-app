module.exports = [
  { method: 'GET', path: '/sites', name: 'sites', middleware: ['auth', 'admin'], handler: 'site/SiteExportController.sites' },
];
