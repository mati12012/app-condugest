import { Router } from "express";

import {
  createProfesorController,
  deleteProfesorController,
  getProfesorController,
  getProfesoresController,
  updateProfesorController,
} from "../controllers/profesor.controller.js";

const router = Router();

router.get("/", getProfesoresController);
router.get("/:id", getProfesorController);
router.post("/", createProfesorController);
router.patch("/:id", updateProfesorController);
router.delete("/:id", deleteProfesorController);

export default router;