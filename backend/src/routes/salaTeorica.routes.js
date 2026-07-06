"use strict";

import { Router } from "express";

import {
  createSalaTeoricaController,
  deleteSalaTeoricaController,
  getSalaTeoricaController,
  getSalasTeoricasController,
  updateSalaTeoricaController,
} from "../controllers/salaTeorica.controller.js";

const router = Router();

router.get("/", getSalasTeoricasController);
router.get("/:id", getSalaTeoricaController);
router.post("/", createSalaTeoricaController);
router.patch("/:id", updateSalaTeoricaController);
router.delete("/:id", deleteSalaTeoricaController);

export default router;
