"use strict";

import { Router } from "express";

import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

import {
  getMisClasesProfesorController,
} from "../controllers/profesorPanel.controller.js";

const router = Router();

router.get(
  "/mis-clases",
  verificarToken,
  permitirRoles("profesor"),
  getMisClasesProfesorController
);

export default router;