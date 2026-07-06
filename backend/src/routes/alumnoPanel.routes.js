import { Router } from "express";
import { verificarToken, permitirRoles } from "../middlewares/auth.middleware.js";
import {
  getMaterialesAlumnoController,
  getMiPerfilAlumnoController,
  getMisClasesAlumnoController,
} from "../controllers/alumnoPanel.controller.js";
import { getEvaluacionesAlumnoController } from "../controllers/evaluacionPractica.controller.js";
import {
  createReprogramacionAlumnoController,
  getMisReprogramacionesAlumnoController,
} from "../controllers/solicitudReprogramacion.controller.js";

const router = Router();

router.use(verificarToken, permitirRoles("alumno")); 
router.get("/mi-perfil", getMiPerfilAlumnoController);
router.get("/mis-clases", getMisClasesAlumnoController);
router.get("/materiales", getMaterialesAlumnoController);
router.get("/mis-evaluaciones", getEvaluacionesAlumnoController);
router.post("/reprogramaciones", createReprogramacionAlumnoController);
router.get("/mis-reprogramaciones", getMisReprogramacionesAlumnoController);

export default router;
