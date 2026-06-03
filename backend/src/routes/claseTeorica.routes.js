import { Router } from "express";
import { getClasesTeoricasController, getClaseTeoricaController, createClaseTeoricaController, updateClaseTeoricaController} from "../controllers/claseTeorica.controller.js";

const router = Router();

router.get("/", getClasesTeoricasController);
router.get("/:id", getClaseTeoricaController);
router.post("/", createClaseTeoricaController);
router.patch("/:id", updateClaseTeoricaController);

export default router;