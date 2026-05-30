/**
 * services/users/use-cases/get-profile.use-case.ts
 *
 * Use-case mengambil profil pengguna (FR-022, API-003).
 */

import { NotFoundError } from "@/exceptions/not-found-error.js";
import type { User } from "@/services/users/repositories/users.repository.js";

// ── Dependencies Interface ─────────────────────────────────────────────────────

interface UsersRepo {
  findById(id: string): Promise<User | null>;
}

interface GetProfileDeps {
  usersRepo: UsersRepo;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createGetProfileUseCase({ usersRepo }: GetProfileDeps) {
  return {
    /**
     * Mengambil profil pengguna berdasarkan userId.
     * Melempar NotFoundError bila pengguna tidak ditemukan.
     */
    async execute(userId: string): Promise<User> {
      const user = await usersRepo.findById(userId);
      if (!user) {
        throw new NotFoundError("Pengguna tidak ditemukan");
      }
      return user;
    },
  };
}
