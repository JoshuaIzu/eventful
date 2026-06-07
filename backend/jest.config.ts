import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/auth'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.service.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['auth/**/*.ts'],
};

export default config;
