/**
 * services/users/controllers/users.controller.ts
 *
 * Controller untuk endpoint users (FR-022).
 * Identitas pengguna selalu diambil dari req.user (hasil verifikasi JWT),
 * tidak pernah dari body/query (SEC-003, DATA-007).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "@/utils/response.js";
import type { User } from "@/services/users/repositories/users.repository.js";
import type { UpdateProfileDto } from "@/services/users/validators/users.schema.js";

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

// ── Controller ─────────────────────────────────────────────────────────────────

export class UsersController {
  private readonly getProfileUseCase: GetProfileUseCase;
  private readonly updateProfileUseCase: UpdateProfileUseCase;

  constructor({
    getProfileUseCase,
    updateProfileUseCase,
  }: UsersControllerDeps) {
    this.getProfileUseCase = getProfileUseCase;
    this.updateProfileUseCase = updateProfileUseCase;

    // Bind agar `this` tetap benar saat digunakan sebagai route handler
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
  }

  /**
   * GET /users/me
   * Mengembalikan profil pengguna yang sedang login (200).
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.getProfileUseCase.execute(req.user!.id);
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /users/me
   * Memperbarui profil pengguna yang sedang login (200).
   */
  async updateMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.updateProfileUseCase.execute(
        req.user!.id,
        req.body as UpdateProfileDto,
      );
      res.status(200).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }
}
