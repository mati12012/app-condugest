import { Router } from "express";

import {
  getPlanesPublicosController,
} from "../controllers/publicPlan.controller.js";
import {
  createSolicitudMatriculaPublicaController,
} from "../controllers/solicitudMatricula.controller.js";

const router = Router();

router.get("/planes", getPlanesPublicosController);
router.post(
  "/solicitudes-matricula",
  createSolicitudMatriculaPublicaController
);

export default router;
