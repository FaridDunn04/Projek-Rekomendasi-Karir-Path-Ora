/**
 * services/auth/controllers/auth.controller.ts
 *
 * Controller untuk endpoint auth (FR-001, FR-002).
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "../../../utils/response";
import type { User } from "../repositories/auth.repository";
import type { RegisterDto, LoginDto } from "../validators/auth.schema";

// ── Dependency Interfaces ──────────────────────────────────────────────────────

interface RegisterUseCase {
  execute(dto: RegisterDto): Promise<User>;
}

interface LoginUseCase {
  execute(dto: LoginDto): Promise<{ token: string; user: User }>;
}

interface AuthControllerDeps {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createAuthController({
  registerUseCase,
  loginUseCase,
}: AuthControllerDeps) {
  /**
   * POST /auth/register
   * Mendaftarkan pengguna baru dan mengembalikan data user (201).
   */
  async function register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await registerUseCase.execute(req.body as RegisterDto);
      res.status(201).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/login
   * Memverifikasi kredensial dan mengembalikan token + user (200).
   */
  async function login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await loginUseCase.execute(req.body as LoginDto);
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }

  return { register, login };
}
