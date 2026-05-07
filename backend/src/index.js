import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { AppDataSource, connectDb } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Ruta principal de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a la API de Condugest!");
});

// Inicializa la conexion a la base de datos
connectDb()
  .then(() => {
    routerApi(app);

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || "localhost";

    app.listen(HOST, PORT, () => {
      console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });