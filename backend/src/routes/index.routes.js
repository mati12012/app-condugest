import { Router } from "express";
import { verificarToken, permitirRoles } from "../middlewares/auth.middleware.js";
import alumnoRoutes from "./alumno.routes.js";
import salaPsicotecnicaRoutes from "./salaPsicotecnica.routes.js";
import reservaSalaRoutes from "./reservaSala.routes.js";
import profesorRoutes from "./profesor.routes.js";
import vehiculoRoutes from "./vehiculo.routes.js";
import clasePracticaRoutes from "./clasePractica.routes.js";
import claseTeoricaRoutes from "./claseTeorica.routes.js";
import authRoutes from "./auth.routes.js";
import alumnoPanelRoutes from "./alumnoPanel.routes.js";
import profesorPanelRoutes from "./profesorPanel.routes.js";
import planRoutes from "./plan.routes.js";
import solicitudMatriculaRoutes from "./solicitudMatricula.routes.js";
import matriculaRoutes from "./matricula.routes.js";
import pagoRoutes from "./pago.routes.js";
import publicRoutes from "./public.routes.js";

export function routerApi(app) {
  const router = Router();
  const soloSecretaria = [verificarToken, permitirRoles("secretaria")];

  app.use("/api", router);

  router.use("/alumnos", soloSecretaria, alumnoRoutes);
  router.use("/salas-psicotecnicas", soloSecretaria, salaPsicotecnicaRoutes);
  router.use("/reservas-salas", soloSecretaria, reservaSalaRoutes);
  router.use("/profesores", soloSecretaria, profesorRoutes);
  router.use("/vehiculos", soloSecretaria, vehiculoRoutes);
  router.use("/clases-practicas", soloSecretaria, clasePracticaRoutes);
  router.use("/clases-teoricas", soloSecretaria, claseTeoricaRoutes);
  router.use("/planes", soloSecretaria, planRoutes);
  router.use("/solicitudes-matricula", soloSecretaria, solicitudMatriculaRoutes);
  router.use("/matriculas", soloSecretaria, matriculaRoutes);
  router.use("/pagos", soloSecretaria, pagoRoutes);
  router.use("/public", publicRoutes);
  router.use("/auth", authRoutes);
  router.use("/alumno-panel", alumnoPanelRoutes);
  router.use("/profesor", profesorPanelRoutes);
}
