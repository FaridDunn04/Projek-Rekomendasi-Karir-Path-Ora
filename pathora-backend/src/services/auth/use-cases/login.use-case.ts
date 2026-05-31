/**
 * services/auth/use-cases/login.use-case.ts
 *
 * Use-case login pengguna (FR-002, SEC-001).
 * Pesan error generik — tidak memberi petunjuk field mana yang salah (SEC-001).
 */

import { AuthenticationError } from "../../../exceptions/authentication-error";
import type { User, UserWithHash } from "../repositories/auth.repository";
import type { LoginDto } from "../validators/auth.schema";

// ── Dependencies Interface ─────────────────────────────────────────────────────

interface AuthRepo {
  findByEmail(email: string): Promise<UserWithHash | null>;
}

interface PasswordManager {
  compare(plain: string, hash: string): Promise<boolean>;
}

interface TokenManager {
  sign(payload: { id: string; email: string }): string;
}

interface LoginDeps {
  authRepo: AuthRepo;
  passwordManager: PasswordManager;
  tokenManager: TokenManager;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createLoginUseCase({
  authRepo,
  passwordManager,
  tokenManager,
}: LoginDeps) {
  return {
    /**
     * Memverifikasi kredensial dan mengembalikan JWT + data user.
     * Pesan error identik untuk email tidak ditemukan maupun password salah
     * agar tidak membocorkan informasi (SEC-001).
     */
    async execute({
      email,
      password,
    }: LoginDto): Promise<{ token: string; user: User }> {
      const GENERIC_ERROR = "Email atau password salah";

      // 1. Cari user berdasarkan email
      const userWithHash = await authRepo.findByEmail(email);
      if (!userWithHash) {
        throw new AuthenticationError(GENERIC_ERROR);
      }

      // 2. Verifikasi password
      const isValid = await passwordManager.compare(
        password,
        userWithHash.password_hash,
      );
      if (!isValid) {
        throw new AuthenticationError(GENERIC_ERROR);
      }

      // 3. Buat token JWT
      const token = tokenManager.sign({
        id: userWithHash.id,
        email: userWithHash.email,
      });

      // 4. Kembalikan token + user tanpa password_hash (SEC-001)
      const { password_hash: _omit, ...user } = userWithHash;

      return { token, user };
    },
  };
}
