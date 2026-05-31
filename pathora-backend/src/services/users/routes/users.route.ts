/**
 * services/users/routes/users.route.ts
 *
 * Routing untuk domain users (API-003, API-004).
 * Dependency wiring: repo → use-cases → controller → routes.
 */

import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { usersRepository } from "../repositories/users.repository";
import { UpdateProfileSchema } from "../validators/users.schema";
import { createGetProfileUseCase } from "../use-cases/get-profile.use-case";
import { createUpdateProfileUseCase } from "../use-cases/update-profile.use-case";
import { createUsersController } from "../controllers/users.controller";

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
