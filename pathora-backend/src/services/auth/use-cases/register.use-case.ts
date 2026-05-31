/**
 * services/auth/use-cases/register.use-case.ts
 *
 * Use-case registrasi pengguna baru (FR-001, SEC-001).
 * Menggunakan dependency injection agar mudah di-test.
 */

import { ConflictError } from "../../../exceptions/conflict-error.js";
import type { User, CreateUserDto } from "../repositories/auth.repository.js";
import type { RegisterDto } from "../validators/auth.schema.js";

// ── Dependencies Interface ─────────────────────────────────────────────────────

interface AuthRepo {
  findByEmail(email: string): Promise<{ id: string } | null>;
  createUser(data: CreateUserDto): Promise<User>;
}

interface PasswordManager {
  hash(plain: string): Promise<string>;
}

interface RegisterDeps {
  authRepo: AuthRepo;
  passwordManager: PasswordManager;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createRegisterUseCase({
  authRepo,
  passwordManager,
}: RegisterDeps) {
  return {
    /**
     * Mendaftarkan pengguna baru.
     * Melempar ConflictError bila email sudah terdaftar.
     * Mengembalikan user tanpa password_hash (SEC-001).
     */
    async execute({ full_name, email, password }: RegisterDto): Promise<User> {
      // 1. Cek apakah email sudah terdaftar
      const existing = await authRepo.findByEmail(email);
      if (existing) {
        throw new ConflictError("Email sudah terdaftar");
      }

      // 2. Hash password
      const password_hash = await passwordManager.hash(password);

      // 3. Buat user baru (RETURNING tanpa password_hash — SEC-001)
      const user = await authRepo.createUser({
        email,
        full_name,
        password_hash,
      });

      return user;
    },
  };
}
