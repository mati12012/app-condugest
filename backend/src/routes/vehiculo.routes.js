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

function manejarUploadRevision(req, res, next) {
  uploadRevision.single("documento")(req, res, (error) => {
    if (!error) {
      return next();
    }

    const mensaje =
      error.code === "LIMIT_FILE_SIZE"
        ? "El documento no puede superar los 5 MB."
        : error.message || "No se pudo cargar el documento.";

    return res.status(400).json({
      message: mensaje,
      errorDetails: [mensaje],
      status: "Client error",
    });
  });
}

router.get("/", getVehiculosController);
router.get("/:id", getVehiculoController);
router.post("/", createVehiculoController);
router.patch("/:id", updateVehiculoController);
router.delete("/:id", deleteVehiculoController);
router.post("/:id/revision-tecnica", manejarUploadRevision, subirRevisionController);

export default router;
