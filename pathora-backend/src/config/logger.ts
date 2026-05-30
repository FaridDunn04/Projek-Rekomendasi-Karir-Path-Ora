/**
 * config/logger.ts
 *
 * Instance Pino logger terpusat untuk seluruh aplikasi.
 * Seluruh modul mengimpor `logger` dari sini — tidak membuat logger sendiri.
 *
 * Perilaku berdasarkan environment (NFR-022, SDD §3.1):
 * - development : output pretty-print ke stdout (mudah dibaca manusia)
 * - production  : output JSON ke stdout (kompatibel log aggregator: Datadog, Loki, dsb.)
 * - test        : level 'silent' agar tidak mengotori output test runner
 */

import pino from 'pino';
import { config } from '@/config';

// ── Transport (pretty-print hanya di development) ─────────────────────────────

const transport =
  config.NODE_ENV === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      })
    : undefined;

// ── Logger Instance ────────────────────────────────────────────────────────────

export const logger = pino(
  {
    // Level diambil dari config; test menggunakan 'silent'
    level: config.IS_TEST ? 'silent' : config.LOG_LEVEL,

    // Serializer standar untuk Error object
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },

    // Tambahkan field `env` di setiap log entry (berguna di log aggregator)
    base: {
      env: config.NODE_ENV,
    },

    // Format timestamp ISO 8601
    timestamp: pino.stdTimeFunctions.isoTime,

    // Redact field sensitif agar tidak masuk log (SEC-001, SEC-002)
    redact: {
      paths: [
        'password',
        'password_hash',
        'token',
        'authorization',
        'req.headers.authorization',
        'body.password',
        '*.password',
        '*.password_hash',
        '*.token',
      ],
      censor: '[REDACTED]',
    },
  },
  transport,
);

// ── Child Logger Factory ───────────────────────────────────────────────────────

/**
 * Membuat child logger dengan konteks tambahan (mis. nama modul/domain).
 * Berguna untuk membedakan log dari domain yang berbeda.
 *
 * @example
 * const log = createLogger('auth');
 * log.info('User logged in');  // → { module: 'auth', msg: 'User logged in' }
 */
export function createLogger(module: string) {
  return logger.child({ module });
}
