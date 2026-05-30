"use strict";

exports.shorthands = undefined;

exports.up = async function up(pgm) {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createTable("cvs", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    source_type: {
      type: "text",
      notNull: true,
    },
    // raw_text diisi HANYA untuk source_type='text'.
    // Untuk source_type='file', ekstraksi teks dilakukan oleh layanan AI,
    // sehingga raw_text boleh NULL di sisi backend (DATA-002, revisi v1.1).
    raw_text: {
      type: "text",
      notNull: false,
    },
    // Metadata & konten berkas (source_type='file') yang akan diteruskan
    // apa adanya ke layanan AI untuk diekstraksi di sana.
    file_name: {
      type: "text",
      notNull: false,
    },
    file_mime: {
      type: "text",
      notNull: false,
    },
    // Konten biner berkas; disimpan agar dapat diteruskan ke AI saat analyze
    // (alur dua langkah: POST /cvs lalu POST /cvs/:id/analyze).
    file_data: {
      type: "bytea",
      notNull: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });

  // CHECK constraint: source_type hanya boleh 'text' atau 'file' (DATA-002)
  pgm.addConstraint(
    "cvs",
    "cvs_source_type_check",
    `CHECK (source_type IN ('text', 'file'))`,
  );

  // Integritas konsistensi sumber (revisi v1.1):
  //  - 'text' WAJIB punya raw_text
  //  - 'file' WAJIB punya file_data + file_mime (teks diekstraksi AI, bukan backend)
  pgm.addConstraint(
    "cvs",
    "cvs_source_consistency_check",
    `CHECK (
      (source_type = 'text' AND raw_text IS NOT NULL) OR
      (source_type = 'file' AND file_data IS NOT NULL AND file_mime IS NOT NULL)
    )`,
  );
};

exports.down = async function down(pgm) {
  pgm.dropTable("cvs");
};
