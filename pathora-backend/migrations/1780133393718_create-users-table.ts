import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Aktifkan ekstensi pgcrypto untuk gen_random_uuid() (DATA-001)
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'text',
      notNull: true,
    },
    full_name: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
