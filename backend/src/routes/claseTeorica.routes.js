import { Router } from "express";
import { getClasesTeoricasController, createClaseTeoricaController, updateClaseTeoricaController, deleteClaseTeoricaController } from "../controllers/claseTeorica.controller.js";

const router = Router();

router.get("/", getClasesTeoricasController);
router.post("/", createClaseTeoricaController);
router.put("/:id", updateClaseTeoricaController);
router.delete("/:id", deleteClaseTeoricaController);

export default router;