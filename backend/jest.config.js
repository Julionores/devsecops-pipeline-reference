/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // src/server.ts (bootstrap) et src/data/seed.ts (données statiques) sont exclus : ce
  // sont des points d'entrée/données, pas de la logique à couvrir par des tests unitaires.
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/data/seed.ts'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
