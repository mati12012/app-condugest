import { Router } from "express";

import {
  getEvaluacionesPracticasSecretariaController,
} from "../controllers/evaluacionPractica.controller.js";

const router = Router();

router.get("/", getEvaluacionesPracticasSecretariaController);

export default router;
