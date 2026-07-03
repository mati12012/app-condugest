import { Router } from "express";
import { verificarToken, permitirRoles } from "../middlewares/auth.middleware.js";
import alumnoRoutes from "./alumno.routes.js"; // Importamos tu ruta de alumnos
import salaPsicotecnicaRoutes from "./salaPsicotecnica.routes.js"; // Importamos tu ruta de salas psicotécnicas
import reservaSalaRoutes from "./reservaSala.routes.js"; // Importamos tu ruta de reservas de salas
import profesorRoutes from "./profesor.routes.js"; // Importamos tu ruta de profesores
import vehiculoRoutes from "./vehiculo.routes.js"; // Importamos tu ruta de vehículos
import clasePracticaRoutes from "./clasePractica.routes.js"; // Importamos tu ruta de clases prácticas
import claseTeoricaRoutes from "./claseTeorica.routes.js"; // Importamos tu ruta de clases teóricas
import authRoutes from "./auth.routes.js"; // Importamos tu ruta de autenticación

export function routerApi(app) {
  const router = Router();
  const soloSecretaria = [verificarToken, permitirRoles("secretaria")];
  
  // Le decimos que todas nuestras rutas empezarán con /api
  app.use("/api", router);

  // Aquí registramos la ruta de alumnos
  router.use("/alumnos", soloSecretaria, alumnoRoutes);
  // Aquí registramos la ruta de salas psicotécnicas
  router.use("/salas-psicotecnicas", soloSecretaria, salaPsicotecnicaRoutes);
  // Aquí registramos la ruta de reservas de salas
  router.use("/reservas-salas", soloSecretaria, reservaSalaRoutes);
  // Aquí registramos la ruta de profesores
  router.use("/profesores", soloSecretaria, profesorRoutes);
  // Aquí registramos la ruta de vehículos
  router.use("/vehiculos", soloSecretaria, vehiculoRoutes);
  // Aquí registramos la ruta de clases prácticas
  router.use("/clases-practicas", soloSecretaria, clasePracticaRoutes);
  // Aquí registramos la ruta de clases teóricas
  router.use("/clases-teoricas", soloSecretaria, claseTeoricaRoutes);
  // Aquí registramos la ruta de autenticación
  router.use("/auth", authRoutes);

}
