import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('cvs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      notNull: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    source_type: {
      type: 'text',
      notNull: true,
    },
    raw_text: {
      type: 'text',
      notNull: true,
    },
    file_url: {
      type: 'text',
      notNull: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // CHECK constraint: source_type hanya boleh 'text' atau 'file' (DATA-002)
  pgm.addConstraint(
    'cvs',
    'cvs_source_type_check',
    `CHECK (source_type IN ('text', 'file'))`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('cvs');
}
