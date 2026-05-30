import { Router } from "express";

import {
  getSalasController,
  getSalaController,
  createSalaController,
  updateSalaController,
  deleteSalaController,
} from "../controllers/salaPsicotecnica.controller.js";

const router = Router();

router.get("/", getSalasController);
router.get("/:id", getSalaController);
router.post("/", createSalaController);
router.put("/:id", updateSalaController);
router.patch("/:id", updateSalaController);
router.delete("/:id", deleteSalaController);

export default router;