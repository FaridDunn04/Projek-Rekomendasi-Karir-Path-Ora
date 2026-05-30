/**
 * src/routes/index.ts
 *
 * Mount seluruh domain router ke base path /api/v1 (SDD §2.2, API-*).
 *
 * Urutan mount tidak berpengaruh pada fungsionalitas karena setiap domain
 * memiliki prefix unik. Health & categories tidak memerlukan auth.
 */

import { Router } from "express";
import authRouter from "@/services/auth/routes/auth.route.js";
import usersRouter from "@/services/users/routes/users.route.js";
import cvsRouter from "@/services/cvs/routes/cvs.route.js";
import analysesRouter from "@/services/analyses/routes/analyses.route.js";
import dashboardRouter from "@/services/dashboard/routes/dashboard.route.js";
import categoriesRouter from "@/services/categories/routes/categories.route.js";
import healthRouter from "@/services/health/health.route.js";

const router = Router();

// ── Domain Routes ──────────────────────────────────────────────────────────────

router.use("/auth", authRouter); // POST /auth/register, /auth/login
router.use("/users", usersRouter); // GET/PATCH /users/me
router.use("/cvs", cvsRouter); // CRUD /cvs + /cvs/:id/analyze
router.use("/analyses", analysesRouter); // GET /analyses, /analyses/:id
router.use("/dashboard", dashboardRouter); // GET /dashboard/me
router.use("/categories", categoriesRouter); // GET /categories
router.use("/health", healthRouter); // GET /health

export default router;
