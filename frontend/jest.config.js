// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Put your setup here
  testEnvironment: 'jsdom',
 

  moduleNameMapper: {
    // Optional: handle CSS imports, etc.
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};

module.exports = createJestConfig(customJestConfig);
