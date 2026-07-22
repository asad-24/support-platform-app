module.exports = [
  { method: 'GET', path: '/', name: 'index', handler: 'school/SchoolController.index' },
  { method: 'GET', path: '/:id', name: 'show', handler: 'school/SchoolController.show' },
];
