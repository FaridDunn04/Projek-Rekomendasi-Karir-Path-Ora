import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('analyses', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      notNull: true,
    },
    cv_id: {
      type: 'uuid',
      notNull: true,
      references: '"cvs"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    // Status analisis: pending → success | failed (DATA-003)
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
    },
    // Metadata utama disimpan terpisah untuk query dashboard/riwayat yang efisien (NFR-011)
    predicted_category: {
      type: 'text',
      notNull: false,
    },
    confidence: {
      type: 'numeric(5,4)',
      notNull: false,
    },
    // Payload penuh AI disimpan sebagai JSONB agar fleksibel terhadap perubahan model (DATA-005, NFR-018)
    result: {
      type: 'jsonb',
      notNull: false,
    },
    analyzed_at: {
      type: 'timestamptz',
      notNull: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // CHECK constraint: status hanya boleh 'pending', 'success', atau 'failed' (DATA-003)
  pgm.addConstraint(
    'analyses',
    'analyses_status_check',
    `CHECK (status IN ('pending', 'success', 'failed'))`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('analyses');
}
