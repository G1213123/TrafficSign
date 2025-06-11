module.exports = {
  // Test environment - jsdom for DOM testing
  testEnvironment: 'jsdom',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping for ES6 imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/js/**/*.test.js'
  ],
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/tests/**',
    '!js/**/*.test.js',
    '!js/dxf/**', // Exclude external libraries
  ],
  
  // Transform ES6 modules
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['js'],
  
  // Global variables available in tests
  globals: {
    'fabric': {}
  }
};
