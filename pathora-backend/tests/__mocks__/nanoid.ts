/**
 * tests/__mocks__/nanoid.ts
 *
 * Mock CJS untuk nanoid v5 (ESM-only) agar kompatibel dengan Jest CommonJS.
 * Digunakan via moduleNameMapper di jest.config.ts.
 *
 * Menghasilkan ID unik yang cukup untuk keperluan test (correlation ID logging).
 */

let counter = 0;

export function nanoid(size = 21): string {
  return `test-id-${++counter}-${Math.random().toString(36).slice(2, size)}`;
}
