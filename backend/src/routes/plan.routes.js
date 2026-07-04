import { Router } from "express";

import {
  createPlanController,
  deletePlanController,
  getPlanController,
  getPlanesController,
  updatePlanController,
} from "../controllers/plan.controller.js";

const router = Router();

router.get("/", getPlanesController);
router.get("/:id", getPlanController);
router.post("/", createPlanController);
router.patch("/:id", updatePlanController);
router.delete("/:id", deletePlanController);

export default router;
