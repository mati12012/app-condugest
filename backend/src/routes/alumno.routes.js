import { Router } from "express";
import * as alumnoController from "../controllers/alumno.controller.js";

const router = Router();

router.get("/", alumnoController.getAlumnosController);
router.get("/:id", alumnoController.getAlumnoController);
router.post("/", alumnoController.createAlumnoController);
router.put("/:id", alumnoController.updateAlumnoController);
router.delete("/:id", alumnoController.deleteAlumnoController);

export default router;