import { Router } from "express";

import {
  getReservasController,
  getReservaController,
  createReservaController,
  updateReservaController,
  deleteReservaController,
  consultarDisponibilidadController,
} from "../controllers/reservaSala.controller.js";

const router = Router();

router.get("/", getReservasController);
router.get("/disponibilidad", consultarDisponibilidadController);
router.get("/:id", getReservaController);
router.post("/", createReservaController);
router.put("/:id", updateReservaController);
router.patch("/:id", updateReservaController);
router.delete("/:id", deleteReservaController);

export default router;