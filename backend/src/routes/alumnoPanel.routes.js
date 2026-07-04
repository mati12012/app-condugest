import { Router } from "express";
import { verificarToken, permitirRoles } from "../middlewares/auth.middleware.js";
import { getMiPerfilAlumnoController, getMisClasesAlumnoController, cancelarClaseAlumnoController } from "../controllers/alumnoPanel.controller.js";

const router = Router();

router.use(verificarToken, permitirRoles("alumno")); 
router.get("/mi-perfil", getMiPerfilAlumnoController);
router.get("/mis-clases", getMisClasesAlumnoController);
router.put("/cancelar-clase/:idClase", cancelarClaseAlumnoController);

export default router;