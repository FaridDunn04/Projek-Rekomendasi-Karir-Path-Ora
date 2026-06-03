
import { Router } from "express";
import { categoriesRepository } from "../repositories/categories.repository";
import { createCategoriesController } from "../controllers/categories.controller";

const { getAll } = createCategoriesController({
  categoriesRepo: categoriesRepository,
});

const router = Router();
router.get("/", getAll);
export default router;
