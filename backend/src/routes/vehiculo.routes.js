import { Router } from "express";

import {
  createVehiculoController,
  deleteVehiculoController,
  getVehiculoController,
  getVehiculosController,
  updateVehiculoController,
} from "../controllers/vehiculo.controller.js";

const router = Router();

router.get("/", getVehiculosController);
router.get("/:id", getVehiculoController);
router.post("/", createVehiculoController);
router.patch("/:id", updateVehiculoController);
router.delete("/:id", deleteVehiculoController);

export default router;