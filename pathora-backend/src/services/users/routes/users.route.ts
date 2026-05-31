/**
 * services/users/routes/users.route.ts
 *
 * Routing untuk domain users (API-003, API-004).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth.js";
import { validate } from "../../../middlewares/validate.js";
import { usersRepository } from "../repositories/users.repository.js";
import { UpdateProfileSchema } from "../validators/users.schema.js";
import { createGetProfileUseCase } from "../use-cases/get-profile.use-case.js";
import { createUpdateProfileUseCase } from "../use-cases/update-profile.use-case.js";
import { createUsersController } from "../controllers/users.controller.js";

// ── Dependency Wiring ──────────────────────────────────────────────────────────

const getProfileUseCase = createGetProfileUseCase({
  usersRepo: usersRepository,
});
const updateProfileUseCase = createUpdateProfileUseCase({
  usersRepo: usersRepository,
});
const { getMe, updateMe } = createUsersController({
  getProfileUseCase,
  updateProfileUseCase,
});

// ── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/** GET /users/me */
router.get("/me", auth, getMe);

/** PATCH /users/me */
router.patch("/me", auth, validate(UpdateProfileSchema, "body"), updateMe);

export default router;
