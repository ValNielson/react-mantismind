import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The test files import the implementation with a bare `app/...` specifier
// (e.g. `import { Colors } from "app/constants.ts"`). Map that prefix to the
// project's `app/` directory so Vitest can resolve it.
export default defineConfig({
  resolve: {
    alias: {
      app: fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
