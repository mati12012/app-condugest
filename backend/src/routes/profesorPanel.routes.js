"use strict";
import { Router } from "express";
import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

import {
  getMisClasesProfesorController,
  getMisClasesTeoricasController, 
  getDetalleClaseTeoricaProfesorController, 
  marcarAsistenciaTeoricaController,
} from "../controllers/profesorPanel.controller.js";


import { marcarAsistenciaPracticaController } from "../controllers/clasePractica.controller.js";

const router = Router();


router.get(
  "/mis-clases",
  verificarToken,
  permitirRoles("profesor"), 
  getMisClasesProfesorController
);


router.patch(
  "/clase-practica/:id/asistencia",
  verificarToken,
  permitirRoles("profesor", "Profesor"), 
  marcarAsistenciaPracticaController
);


router.get(
  "/mis-clases-teoricas", 
  verificarToken, 
  permitirRoles("profesor", "Profesor"), 
  getMisClasesTeoricasController
);


router.get(
  "/clase-teorica/:idClase/alumnos", 
  verificarToken, permitirRoles("profesor", "Profesor"), 
  getDetalleClaseTeoricaProfesorController
);


router.patch(
  "/asistencia-teorica/:idAsistencia", 
  verificarToken, 
  permitirRoles("profesor", "Profesor"), 
  marcarAsistenciaTeoricaController
);

export default router;