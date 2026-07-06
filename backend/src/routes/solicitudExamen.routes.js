import { Router } from "express";

import {
  getSolicitudExamenSecretariaController,
  getSolicitudesExamenSecretariaController,
  updateSolicitudExamenSecretariaController,
} from "../controllers/solicitudExamen.controller.js";

const router = Router();

router.get("/", getSolicitudesExamenSecretariaController);
router.get("/:id", getSolicitudExamenSecretariaController);
router.patch("/:id", updateSolicitudExamenSecretariaController);

export default router;
