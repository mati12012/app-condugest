import { Router } from "express";

import {
  createPagoController,
  getPagoController,
  getPagosController,
  getPagosPorMatriculaController,
  getResumenFinancieroMatriculaController,
  updatePagoController,
} from "../controllers/pago.controller.js";

const router = Router();

router.get("/", getPagosController);
router.get("/resumen/matricula/:id_matricula", getResumenFinancieroMatriculaController);
router.get("/matricula/:id_matricula", getPagosPorMatriculaController);
router.get("/:id", getPagoController);
router.post("/", createPagoController);
router.patch("/:id", updatePagoController);

export default router;
