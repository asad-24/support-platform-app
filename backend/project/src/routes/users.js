module.exports = [
  { method: 'GET', path: '/me', name: 'me', middleware: 'auth', handler: 'user/UserController.me' },
  { method: 'PATCH', path: '/me/volunteer-profile', name: 'me.volunteerProfile', middleware: 'auth', handler: 'user/UserController.update_volunteer_profile' },
];
