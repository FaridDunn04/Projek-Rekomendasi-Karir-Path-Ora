import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('categories', {
    code: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    display_name: {
      type: 'text',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
  });

  // Seed data referensi kategori karir (DATA-004)
  // Selaras dengan kategori pada docs/contract-api-Ai.json
  pgm.sql(`
    INSERT INTO categories (code, display_name, description) VALUES
      ('INFORMATION-TECHNOLOGY', 'Information Technology', 'Bidang IT & Software Development'),
      ('DATA-SCIENCE',           'Data Science',           'Analisis data, ML, dan statistik'),
      ('ENGINEERING',            'Engineering',            'Rekayasa teknik'),
      ('DIGITAL-MEDIA',          'Digital Media',          'Media digital, desain, dan konten'),
      ('BUSINESS-DEVELOPMENT',   'Business Development',   'Pengembangan bisnis dan penjualan'),
      ('FINANCE',                'Finance',                'Keuangan dan akuntansi')
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('categories');
}
