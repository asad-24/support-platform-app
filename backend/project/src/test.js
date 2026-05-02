// Ensure path aliases are available when running this file directly
require('../core/util/register-aliases');

const config = require('@core/util/functions/config');

console.log('debug =>', config('debug'));
console.log('server.host =>', config('server.host'));
