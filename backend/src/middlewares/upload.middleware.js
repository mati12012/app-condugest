import multer from "multer";
import fs from "fs";
import path from "path";

// Configuramos dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/vehiculos";
    // Si la carpeta no existe, la crea automáticamente
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "revision-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo PDF e imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato no válido. Solo se permiten PDF, JPG o PNG."));
  }
};

export const uploadRevision = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});