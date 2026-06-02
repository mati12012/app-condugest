import { Router } from "express";
import alumnoRoutes from "./alumno.routes.js"; // Importamos tu ruta de alumnos
import salaPsicotecnicaRoutes from "./salaPsicotecnica.routes.js"; // Importamos tu ruta de salas psicotécnicas
import reservaSalaRoutes from "./reservaSala.routes.js"; // Importamos tu ruta de reservas de salas
import profesorRoutes from "./profesor.routes.js"; // Importamos tu ruta de profesores
import vehiculoRoutes from "./vehiculo.routes.js"; // Importamos tu ruta de vehículos
import clasePracticaRoutes from "./clasePractica.routes.js"; // Importamos tu ruta de clases prácticas
import claseTeoricaRoutes from "./claseTeorica.routes.js"; // Importamos tu ruta de clases teóricas

export function routerApi(app) {
  const router = Router();
  
  // Le decimos que todas nuestras rutas empezarán con /api
  app.use("/api", router);

  // Aquí registramos la ruta de alumnos
  router.use("/alumnos", alumnoRoutes);
  // Aquí registramos la ruta de salas psicotécnicas
  router.use("/salas-psicotecnicas", salaPsicotecnicaRoutes);
  // Aquí registramos la ruta de reservas de salas
  router.use("/reservas-salas", reservaSalaRoutes);
  // Aquí registramos la ruta de profesores
  router.use("/profesores", profesorRoutes);
  // Aquí registramos la ruta de vehículos
  router.use("/vehiculos", vehiculoRoutes);
  // Aquí registramos la ruta de clases prácticas
  router.use("/clases-practicas", clasePracticaRoutes);
  // Aquí registramos la ruta de clases teóricas
  router.use("/clases-teoricas", claseTeoricaRoutes);

}