"use strict";
import { Router } from "express";
import {
  verificarToken,
  permitirRoles,
} from "../middlewares/auth.middleware.js";

import {
  getMiPerfilProfesorController,
  getMisClasesProfesorController,
  getMisClasesTeoricasController, 
  getDetalleClaseTeoricaProfesorController, 
  updateRecursosClaseTeoricaProfesorController,
  marcarAsistenciaTeoricaController,
} from "../controllers/profesorPanel.controller.js";

import {
  createEvaluacionPracticaProfesorController,
  getEvaluacionProfesorPorClaseController,
  getEvaluacionesProfesorController,
  updateEvaluacionPracticaProfesorController,
} from "../controllers/evaluacionPractica.controller.js";


import { marcarAsistenciaPracticaController } from "../controllers/clasePractica.controller.js";

const router = Router();


router.get(
  "/mi-perfil",
  verificarToken,
  permitirRoles("profesor", "Profesor"),
  getMiPerfilProfesorController
);

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
  "/clase-teorica/:idClase/recursos",
  verificarToken,
  permitirRoles("profesor", "Profesor"),
  updateRecursosClaseTeoricaProfesorController
);


router.patch(
  "/asistencia-teorica/:idAsistencia", 
  verificarToken, 
  permitirRoles("profesor", "Profesor"), 
  marcarAsistenciaTeoricaController
);

router.get(
  "/evaluaciones",
  verificarToken,
  permitirRoles("profesor"),
  getEvaluacionesProfesorController
);

router.get(
  "/evaluaciones/clase/:id_clase_practica",
  verificarToken,
  permitirRoles("profesor"),
  getEvaluacionProfesorPorClaseController
);

router.post(
  "/evaluaciones",
  verificarToken,
  permitirRoles("profesor"),
  createEvaluacionPracticaProfesorController
);

router.patch(
  "/evaluaciones/:id",
  verificarToken,
  permitirRoles("profesor"),
  updateEvaluacionPracticaProfesorController
);

export default router;
