const upload = require('@src/middlewares/UploadMiddleware');

module.exports = [
  { method: 'GET', path: '/me', name: 'me', middleware: 'auth', handler: 'user/UserController.me' },
  { method: 'PATCH', path: '/me/volunteer-profile', name: 'me.volunteerProfile', middleware: ['auth', upload.single('profileImage')], handler: 'user/UserController.update_volunteer_profile' },
  { method: 'GET', path: '/:userId/submitted-sites', name: 'submittedSites', middleware: 'auth', handler: 'user/UserController.submitted_sites' },
];
