/**
 * services/users/use-cases/update-profile.use-case.ts
 *
 * Use-case memperbarui profil pengguna (FR-022, API-004, VAL-005).
 * Cek konflik email bila email disertakan dalam update.
 */

import { ConflictError } from "../../../exceptions/conflict-error";
import type { User } from "../repositories/users.repository";
import type { UpdateProfileDto } from "../validators/users.schema";

// ── Dependencies Interface ─────────────────────────────────────────────────────

interface UsersRepo {
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<UpdateProfileDto>): Promise<User>;
}

interface UpdateProfileDeps {
  usersRepo: UsersRepo;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createUpdateProfileUseCase({ usersRepo }: UpdateProfileDeps) {
  return {
    /**
     * Memperbarui profil pengguna.
     * Bila email disertakan, cek apakah sudah digunakan pengguna lain.
     */
    async execute(userId: string, data: UpdateProfileDto): Promise<User> {
      // Cek konflik email bila email disertakan
      if (data.email !== undefined) {
        const existing = await usersRepo.findByEmail(data.email);
        if (existing && existing.id !== userId) {
          throw new ConflictError("Email sudah digunakan");
        }
      }

      // Perbarui hanya field yang disediakan
      const user = await usersRepo.update(userId, data);
      return user;
    },
  };
}
