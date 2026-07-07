"use strict";

import { Router } from "express";
import {
  getAsistenciasPracticasAlumnoController,
  getAsistenciasPracticasController,
  getAsistenciasPracticasProfesorSecretariaController,
} from "../controllers/asistenciaPractica.controller.js";

const router = Router();

router.get("/", getAsistenciasPracticasController);
router.get("/alumno/:id_alumno", getAsistenciasPracticasAlumnoController);
router.get(
  "/profesor/:id_profesor",
  getAsistenciasPracticasProfesorSecretariaController
);

export default router;
