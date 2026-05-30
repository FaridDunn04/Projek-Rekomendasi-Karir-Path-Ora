/**
 * services/auth/routes/auth.route.ts
 *
 * Routing untuk domain auth (API-001, API-002).
 * Dependency wiring dilakukan di sini: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { strictLimiter } from "@/middlewares/rate-limit.js";
import { validate } from "@/middlewares/validate.js";
import { authRepository } from "@/services/auth/repositories/auth.repository.js";
import {
  RegisterSchema,
  LoginSchema,
} from "@/services/auth/validators/auth.schema.js";
import { createRegisterUseCase } from "@/services/auth/use-cases/register.use-case.js";
import { createLoginUseCase } from "@/services/auth/use-cases/login.use-case.js";
import { AuthController } from "@/services/auth/controllers/auth.controller.js";
import { passwordManager } from "@/security/password-manager.js";
import { tokenManager } from "@/security/token-manager.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const registerUseCase = createRegisterUseCase({
  authRepo: authRepository,
  passwordManager,
});
const loginUseCase = createLoginUseCase({
  authRepo: authRepository,
  passwordManager,
  tokenManager,
});
const controller = new AuthController({ registerUseCase, loginUseCase });

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * POST /auth/register
 * Mendaftarkan pengguna baru.
 */
router.post(
  "/register",
  strictLimiter,
  validate(RegisterSchema, "body"),
  controller.register,
);

/**
 * POST /auth/login
 * Login dengan email dan password.
 */
router.post(
  "/login",
  strictLimiter,
  validate(LoginSchema, "body"),
  controller.login,
);

export default router;
