import { Router } from "express";
import { getClasesTeoricasController, 
    getClaseTeoricaController, 
    createClaseTeoricaController, 
    updateClaseTeoricaController,
    getInscritosController,
    inscribirAlumnoController,
    quitarAlumnoController} from "../controllers/claseTeorica.controller.js";

const router = Router();

router.get("/", getClasesTeoricasController);
router.get("/:id", getClaseTeoricaController);
router.post("/", createClaseTeoricaController);
router.patch("/:id", updateClaseTeoricaController);
router.get("/:id/alumnos", getInscritosController);
router.post("/:id/alumnos", inscribirAlumnoController);
router.delete("/:id/alumnos/:id_alumno", quitarAlumnoController);

export default router;