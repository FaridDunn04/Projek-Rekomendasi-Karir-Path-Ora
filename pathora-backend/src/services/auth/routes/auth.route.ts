/**
 * services/auth/routes/auth.route.ts
 *
 * Routing untuk domain auth (API-001, API-002).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { strictLimiter } from "../../../middlewares/rate-limit";
import { validate } from "../../../middlewares/validate";
import { authRepository } from "../repositories/auth.repository";
import { RegisterSchema, LoginSchema } from "../validators/auth.schema";
import { createRegisterUseCase } from "../use-cases/register.use-case";
import { createLoginUseCase } from "../use-cases/login.use-case";
import { createAuthController } from "../controllers/auth.controller";
import { passwordManager } from "../../../security/password-manager";
import { tokenManager } from "../../../security/token-manager";

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
const { register, login } = createAuthController({
  registerUseCase,
  loginUseCase,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/** POST /auth/register */
router.post(
  "/register",
  strictLimiter,
  validate(RegisterSchema, "body"),
  register,
);

/** POST /auth/login */
router.post("/login", strictLimiter, validate(LoginSchema, "body"), login);

export default router;
