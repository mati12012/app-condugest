import { Router } from "express";

import {
  deleteSolicitudMatriculaController,
  getSolicitudMatriculaController,
  getSolicitudesMatriculaController,
  updateSolicitudMatriculaController,
} from "../controllers/solicitudMatricula.controller.js";

const router = Router();

router.get("/", getSolicitudesMatriculaController);
router.get("/:id", getSolicitudMatriculaController);
router.patch("/:id", updateSolicitudMatriculaController);
router.delete("/:id", deleteSolicitudMatriculaController);

export default router;
