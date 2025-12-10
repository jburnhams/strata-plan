const baseConfig = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|lucide-react|three|@react-three/fiber|@react-three/drei)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.ts'],
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
};

export default baseConfig;
