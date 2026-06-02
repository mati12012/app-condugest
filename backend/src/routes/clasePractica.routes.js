import { Router } from "express";

import {
  createClasePracticaController,
  getClasePracticaController,
  getClasesPracticasController,
  updateClasePracticaController,
} from "../controllers/clasePractica.controller.js";

const router = Router();

router.get("/", getClasesPracticasController);
router.get("/:id", getClasePracticaController);
router.post("/", createClasePracticaController);
router.patch("/:id", updateClasePracticaController);

export default router;