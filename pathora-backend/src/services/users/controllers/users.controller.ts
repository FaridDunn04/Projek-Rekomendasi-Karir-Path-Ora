/**
 * services/users/controllers/users.controller.ts
 *
 * Controller untuk endpoint users (FR-022).
 * Identitas pengguna selalu dari req.user (JWT), tidak dari body (SEC-003).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response.js";
import type { User } from "../repositories/users.repository.js";
import type { UpdateProfileDto } from "../validators/users.schema.js";

// ── Dependency Interfaces ──────────────────────────────────────────────────────

interface GetProfileUseCase {
  execute(userId: string): Promise<User>;
}

interface UpdateProfileUseCase {
  execute(userId: string, data: UpdateProfileDto): Promise<User>;
}

interface UsersControllerDeps {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createUsersController({
  getProfileUseCase,
  updateProfileUseCase,
}: UsersControllerDeps) {
  /**
   * GET /users/me
   * Mengembalikan profil pengguna yang sedang login (200).
   */
  async function getMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await getProfileUseCase.execute(req.user!.id);
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /users/me
   * Memperbarui profil pengguna yang sedang login (200).
   */
  async function updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await updateProfileUseCase.execute(
        req.user!.id,
        req.body as UpdateProfileDto,
      );
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  return { getMe, updateMe };
}
