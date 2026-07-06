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

const storageMaterialEstudio = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/materiales";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "material-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const materialAllowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const materialAllowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
];

const materialFileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const tipoPermitido = materialAllowedTypes.includes(file.mimetype);
  const extensionPermitida = materialAllowedExtensions.includes(extension);

  if (tipoPermitido && extensionPermitida) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Formato no valido. Solo se permiten PDF, JPG, PNG, DOC, DOCX, PPT o PPTX."
      )
    );
  }
};

export const uploadMaterialEstudio = multer({
  storage: storageMaterialEstudio,
  fileFilter: materialFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
