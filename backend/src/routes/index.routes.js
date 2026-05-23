import { Router } from "express";
import alumnoRoutes from "./alumno.routes.js"; // Importamos tu ruta de alumnos

export function routerApi(app) {
  const router = Router();
  
  // Le decimos que todas nuestras rutas empezarán con /api
  app.use("/api", router);

  // Aquí registramos la ruta de alumnos
  router.use("/alumnos", alumnoRoutes);
}