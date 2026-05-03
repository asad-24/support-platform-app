module.exports = [
  { method: 'GET', path: '/drafts', name: 'drafts.index', middleware: 'auth', handler: 'site/DraftController.index' },
  { method: 'POST', path: '/drafts', name: 'drafts.store', middleware: 'auth', handler: 'site/DraftController.store' },
  { method: 'GET', path: '/drafts/:id', name: 'drafts.show', middleware: 'auth', handler: 'site/DraftController.show' },
  { method: 'PUT', path: '/drafts/:id', name: 'drafts.update', middleware: 'auth', handler: 'site/DraftController.update' },
  { method: 'PATCH', path: '/drafts/:id', name: 'drafts.patch', middleware: 'auth', handler: 'site/DraftController.update' },
  { method: 'DELETE', path: '/drafts/:id', name: 'drafts.destroy', middleware: 'auth', handler: 'site/DraftController.destroy' },
  { method: 'POST', path: '/drafts/:id/submit', name: 'drafts.submit', middleware: 'auth', handler: 'site/DraftController.submit' },

  { method: 'GET', path: '/', name: 'index', middleware: 'auth', handler: 'site/SiteController.index' },
  { method: 'POST', path: '/', name: 'store', middleware: 'auth', handler: 'site/SiteController.store' },
  { method: 'GET', path: '/:id', name: 'show', middleware: 'auth', handler: 'site/SiteController.show' },
  { method: 'PUT', path: '/:id', name: 'update', middleware: 'auth', handler: 'site/SiteController.update' },
  { method: 'PATCH', path: '/:id', name: 'patch', middleware: 'auth', handler: 'site/SiteController.update' },
  { method: 'DELETE', path: '/:id', name: 'destroy', middleware: 'auth', handler: 'site/SiteController.destroy' },
  { method: 'POST', path: '/:id/media', name: 'media', middleware: ['auth', 'UploadMiddleware.single(media)'], handler: 'site/SiteController.media' },
  { method: 'POST', path: '/:id/assessment', name: 'assessment', middleware: 'auth', handler: 'site/SiteController.assessment' },
];
