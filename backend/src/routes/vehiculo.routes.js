import { Router } from "express";

import { uploadRevision } from "../middlewares/upload.middleware.js";
import {
  createVehiculoController,
  deleteVehiculoController,
  getVehiculoController,
  getVehiculosController,
  updateVehiculoController,
  subirRevisionController,
} from "../controllers/vehiculo.controller.js";

const router = Router();

router.get("/", getVehiculosController);
router.get("/:id", getVehiculoController);
router.post("/", createVehiculoController);
router.patch("/:id", updateVehiculoController);
router.delete("/:id", deleteVehiculoController);
router.post("/:id/revision-tecnica", uploadRevision.single("documento"), subirRevisionController);

export default router;