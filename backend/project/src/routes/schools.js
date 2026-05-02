module.exports = [
  { method: 'GET', path: '/', name: 'index', middleware: 'auth', handler: 'school/SchoolController.index' },
  { method: 'GET', path: '/:id', name: 'show', middleware: 'auth', handler: 'school/SchoolController.show' },
];
