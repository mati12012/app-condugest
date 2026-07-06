import { Router } from "express";

import {
  getReprogramacionSecretariaController,
  getReprogramacionesSecretariaController,
  updateReprogramacionSecretariaController,
} from "../controllers/solicitudReprogramacion.controller.js";

const router = Router();

router.get("/", getReprogramacionesSecretariaController);
router.get("/:id", getReprogramacionSecretariaController);
router.patch("/:id", updateReprogramacionSecretariaController);

export default router;
