/**
 * services/users/routes/users.route.ts
 *
 * Routing untuk domain users (API-003, API-004).
 * Dependency wiring dilakukan di sini: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "@/middlewares/auth.js";
import { validate } from "@/middlewares/validate.js";
import { usersRepository } from "@/services/users/repositories/users.repository.js";
import { UpdateProfileSchema } from "@/services/users/validators/users.schema.js";
import { createGetProfileUseCase } from "@/services/users/use-cases/get-profile.use-case.js";
import { createUpdateProfileUseCase } from "@/services/users/use-cases/update-profile.use-case.js";
import { UsersController } from "@/services/users/controllers/users.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const getProfileUseCase = createGetProfileUseCase({
  usersRepo: usersRepository,
});
const updateProfileUseCase = createUpdateProfileUseCase({
  usersRepo: usersRepository,
});
const controller = new UsersController({
  getProfileUseCase,
  updateProfileUseCase,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /users/me
 * Mengambil profil pengguna yang sedang login.
 */
router.get("/me", auth, controller.getMe);

/**
 * PATCH /users/me
 * Memperbarui profil pengguna yang sedang login.
 */
router.patch(
  "/me",
  auth,
  validate(UpdateProfileSchema, "body"),
  controller.updateMe,
);

export default router;
