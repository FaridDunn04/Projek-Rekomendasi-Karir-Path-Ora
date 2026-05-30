/**
 * services/auth/controllers/auth.controller.ts
 *
 * Controller untuk endpoint auth (FR-001, FR-002).
 * Menerima use-case via constructor injection.
 */

import type { Request, Response, NextFunction } from "express";
import { response } from "@/utils/response.js";
import type { User } from "@/services/auth/repositories/auth.repository.js";
import type { RegisterDto } from "@/services/auth/validators/auth.schema.js";
import type { LoginDto } from "@/services/auth/validators/auth.schema.js";

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

// ── Controller ─────────────────────────────────────────────────────────────────

export class AuthController {
  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;

  constructor({ registerUseCase, loginUseCase }: AuthControllerDeps) {
    this.registerUseCase = registerUseCase;
    this.loginUseCase = loginUseCase;

    // Bind agar `this` tetap benar saat digunakan sebagai route handler
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  /**
   * POST /auth/register
   * Mendaftarkan pengguna baru dan mengembalikan data user (201).
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.registerUseCase.execute(req.body as RegisterDto);
      res.status(201).json(response.success(user));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /auth/login
   * Memverifikasi kredensial dan mengembalikan token + user (200).
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.loginUseCase.execute(req.body as LoginDto);
      res.status(200).json(response.success(result));
    } catch (err) {
      next(err);
    }
  }
}
