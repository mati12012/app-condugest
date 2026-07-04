import { Router } from "express";

import {
  getPlanesPublicosController,
} from "../controllers/publicPlan.controller.js";

const router = Router();

router.get("/planes", getPlanesPublicosController);

export default router;
