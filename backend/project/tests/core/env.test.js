const fs = require('fs');
const path = require('path');

describe('core/env checks', () => {
  const envFilePath = path.join(process.cwd(), '.env');

  describe('env file presence', () => {
    test('.env file exists', () => {
      expect(fs.existsSync(envFilePath)).toBe(true);
    });

    test('.env contains DEBUG key', () => {
      const content = fs.readFileSync(envFilePath, 'utf8');
      expect(/^\s*DEBUG\s*=/.test(content)).toBe(true);
    });
  });

  describe('env helper module', () => {
    test('module file exists', () => {
      const helperPath = path.join(process.cwd(), 'core', 'util', 'functions', 'env.js');
      expect(fs.existsSync(helperPath)).toBe(true);
    });

    const vLog = (...args) => { if (process.env.JEST_VERBOSE === '1') console.log(...args); };

    test('env.bool("DEBUG") returns a boolean and logs value', () => {
      const env = require('@core/util/functions/env');
      const val = env.bool('DEBUG', null);
      vLog('DEBUG value from env.bool:', val);
      expect(typeof val).toBe('boolean');
    });
  });
});
