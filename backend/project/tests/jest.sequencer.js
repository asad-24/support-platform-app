const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

// Define desired order by test file suffixes (relative names).
// Later tests can be added here without changing filenames.
const ORDER = [
  path.join('basic', 'hello.test.js'),
  
  path.join('core', 'env.test.js'),
  path.join('core', 'config.test.js'),
  path.join('core', 'debug.test.js'),
  path.join('db', 'sequalize.test.js'),
  path.join('db', 'sequalize-cli.test.js'),
  path.join('db', 'seeders.test.js'),
  path.join('jobs', 'testmeta.test.js'),
  path.join('jobs', 'testmeta-cli.test.js'),
];

class OrderedSequencer extends Sequencer {
  sort(tests) {
    const weight = (testPath) => {
      const rel = testPath.path.replace(process.cwd() + path.sep, '');
      const idx = ORDER.findIndex((suffix) => rel.endsWith(path.join('tests', suffix)) || rel.endsWith(suffix));
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    return Array.from(tests).sort((a, b) => {
      const wa = weight(a);
      const wb = weight(b);
      if (wa !== wb) return wa - wb;
      // Stable tie-breaker: alphabetical
      return a.path.localeCompare(b.path);
    });
  }
}

module.exports = OrderedSequencer;
