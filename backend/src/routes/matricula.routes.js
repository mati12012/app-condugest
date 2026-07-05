import { Router } from "express";

import {
  createMatriculaController,
  deleteMatriculaController,
  getMatriculaController,
  getMatriculasController,
  getMatriculasPorAlumnoController,
  updateMatriculaController,
} from "../controllers/matricula.controller.js";

const router = Router();

router.get("/", getMatriculasController);
router.get("/alumno/:id_alumno", getMatriculasPorAlumnoController);
router.get("/:id", getMatriculaController);
router.post("/", createMatriculaController);
router.patch("/:id", updateMatriculaController);
router.delete("/:id", deleteMatriculaController);

export default router;
