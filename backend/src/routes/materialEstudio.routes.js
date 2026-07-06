import { Router } from "express";

import { uploadMaterialEstudio } from "../middlewares/upload.middleware.js";
import { handleErrorClient } from "../handlers/responseHandlers.js";
import {
  createMaterialEstudioController,
  deleteMaterialEstudioController,
  getMaterialEstudioController,
  getMaterialesEstudioController,
  updateMaterialEstudioController,
} from "../controllers/materialEstudio.controller.js";

const router = Router();

function procesarUploadMaterialEstudio(req, res, next) {
  uploadMaterialEstudio.single("archivo")(req, res, (error) => {
    if (!error) {
      return next();
    }

    const mensaje =
      error.code === "LIMIT_FILE_SIZE"
        ? "El archivo no puede superar los 10 MB."
        : error.message;

    return handleErrorClient(res, 400, "Archivo de material invalido", [
      mensaje,
    ]);
  });
}

router.get("/", getMaterialesEstudioController);
router.get("/:id", getMaterialEstudioController);
router.post("/", procesarUploadMaterialEstudio, createMaterialEstudioController);
router.patch("/:id", procesarUploadMaterialEstudio, updateMaterialEstudioController);
router.delete("/:id", deleteMaterialEstudioController);

export default router;
