const fs = require('fs');
const path = require('path');

describe('core/config', () => {
  const config = require('@core/util/functions/config');

  beforeAll(() => {
    // Ensure we load a fresh snapshot of configs
    config.reload();
  });

  describe('app config file', () => {
    test('src/config/app.js exists', () => {
      const appConfigPath = path.join(process.cwd(), 'src', 'config', 'app.js');
      expect(fs.existsSync(appConfigPath)).toBe(true);
    });

    test('imported app config object has debug', () => {
      const appConfig = require('@src/config/app');
      expect(typeof appConfig).toBe('object');
      expect('debug' in appConfig).toBe(true);
    });
  });

  describe('config helper function', () => {
    test('function exists', () => {
      const fn = require('@core/util/functions/config');
      expect(typeof fn).toBe('function');
    });

    test('debug value via function matches app config', () => {
      const appConfig = require('@src/config/app');
      expect(config.has('debug')).toBe(true);
      expect(typeof config('debug')).toBe('boolean');
      expect(config('debug')).toBe(appConfig.debug);
    });
  });

  describe('missing keys', () => {
    test('"lorem-ipsum" returns null', () => {
      expect(config('lorem-ipsum')).toBeNull();
    });
  });
});

