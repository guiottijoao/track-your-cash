import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test'
    },
    envFiles: ['.env.test'],
    globalSetup: './src/tests/setup.ts'
  }
})
