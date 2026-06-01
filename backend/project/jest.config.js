/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // Look for tests inside the dedicated tests directory
  testMatch: ['**/tests/**/*.test.js'],
  // Ensure deterministic order using a custom sequencer
  testSequencer: '<rootDir>/tests/jest.sequencer.js',
  // Ensure open handles (DB pools, timers) are closed at the very end
  globalTeardown: '<rootDir>/tests/jest.global-teardown.js',
  // Run serially to respect order constraints
  maxWorkers: 1,
  // Map path aliases so Jest can resolve them
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Also register runtime aliases for any non-Jest requires
  setupFiles: ['<rootDir>/core/util/register-aliases.js'],
};
