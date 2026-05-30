/**
 * services/users/validators/users.schema.ts
 *
 * Zod schema untuk validasi update profil pengguna (VAL-005).
 */

import { z } from "zod";

// ── Schema ─────────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z
  .object({
    full_name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
  })
  .refine((d) => d.full_name !== undefined || d.email !== undefined, {
    message: "Minimal satu field harus diisi",
  });

// ── Inferred Type ──────────────────────────────────────────────────────────────

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
