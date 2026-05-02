module.exports = [
  { method: 'POST', path: '/login', name: 'login', handler: 'auth/AuthController.login' },
  { method: 'POST', path: '/refresh', name: 'refresh', handler: 'auth/AuthController.refresh' },
  { method: 'POST', path: '/logout', name: 'logout', middleware: 'auth', handler: 'auth/AuthController.logout' },
  { method: 'GET', path: '/username-available', name: 'usernameAvailable', handler: 'auth/AuthController.username_available' },
  { method: 'POST', path: '/signup', name: 'signup', handler: 'auth/AuthController.signup' },
  { method: 'POST', path: '/change-password', name: 'changePassword', middleware: 'auth', handler: 'auth/AuthController.change_password' },
  { method: 'POST', path: '/sign-up', name: 'sign-up', handler: 'auth/AuthController.sign_up' },
  { method: 'POST', path: '/sign-in', name: 'sign-in', handler: 'auth/AuthController.sign_in' },
  { method: 'POST', path: '/admin/users', name: 'admin.users.create', middleware: ['auth', 'admin'], handler: 'auth/AuthController.create_user' },
  { method: 'GET', path: '/me', name: 'me', middleware: 'auth', handler: 'auth/AuthController.me' },
];
