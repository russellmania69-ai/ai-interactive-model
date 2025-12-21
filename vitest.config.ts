import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/**', 'e2e/**', 'examples/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      // minimum global thresholds — CI will fail if coverage drops below these
      statements: 70,
      branches: 50,
      functions: 60,
      lines: 70,
    },
  },
})

