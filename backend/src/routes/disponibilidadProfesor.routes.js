import { Router } from "express";

import {
  createDisponibilidadProfesorController,
  deleteDisponibilidadProfesorController,
  getDisponibilidadProfesorController,
  getDisponibilidadesProfesorController,
  getDisponibilidadesProfesoresController,
  updateDisponibilidadProfesorController,
} from "../controllers/disponibilidadProfesor.controller.js";

const router = Router();

router.get("/", getDisponibilidadesProfesoresController);
router.get("/profesor/:id_profesor", getDisponibilidadesProfesorController);
router.get("/:id", getDisponibilidadProfesorController);
router.post("/", createDisponibilidadProfesorController);
router.patch("/:id", updateDisponibilidadProfesorController);
router.delete("/:id", deleteDisponibilidadProfesorController);

export default router;
