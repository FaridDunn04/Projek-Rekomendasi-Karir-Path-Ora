/**
 * services/auth/validators/auth.schema.ts
 *
 * Zod schemas untuk validasi input auth (VAL-001, VAL-002).
 */

import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// ── Inferred Types ─────────────────────────────────────────────────────────────

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
