const fs = require('fs');
const path = require('path');

const vLog = (...args) => { if (process.env.JEST_VERBOSE === '1') console.log(...args); };

describe('core/debug helper', () => {
  const debugModulePath = path.join(process.cwd(), 'core', 'util', 'functions', 'debug.js');

  describe('module presence', () => {
    test('debug.js file exists', () => {
      expect(fs.existsSync(debugModulePath)).toBe(true);
    });

    test('exports a function', () => {
      const debug = require('@core/util/functions/debug');
      expect(typeof debug).toBe('function');
    });
  });

  describe('logging behavior when enabled', () => {
    const tmpLogsDir = path.join(process.cwd(), 'tmp_test_logs');
    const debug = require('@core/util/functions/debug');

    beforeAll(() => {
      process.env.LOGS_DIR = tmpLogsDir;
      try { fs.rmSync(tmpLogsDir, { recursive: true, force: true }); } catch (_) {}
    });

    afterAll(() => {
      try { fs.rmSync(tmpLogsDir, { recursive: true, force: true }); } catch (_) {}
      delete process.env.LOGS_DIR;
    });

    test('writes a log line to a file', () => {
      const marker = `debug-test-${Date.now()}`;
      debug('hello from debug test', { marker });

      function findLogFiles(dir) {
        let found = [];
        if (!fs.existsSync(dir)) return found;
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) found = found.concat(findLogFiles(full));
          else if (entry.endsWith('-debug.log')) found.push(full);
        }
        return found;
      }

      const files = findLogFiles(tmpLogsDir);
      expect(files.length).toBeGreaterThan(0);

      const latest = files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
      const content = fs.readFileSync(latest, 'utf8');
      vLog('debug log file:', latest);
      vLog('debug log content (first 120 chars):', content.slice(0, 120));

      expect(content.includes('hello from debug test')).toBe(true);
      expect(content.includes(marker)).toBe(true);
    });
  });
});
