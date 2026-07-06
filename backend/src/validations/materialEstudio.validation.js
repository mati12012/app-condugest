import Joi from "joi";

export const TIPOS_MATERIAL_ESTUDIO = [
  "PDF",
  "Video",
  "Link",
  "Documento",
  "Otro",
];

export const ESTADOS_MATERIAL_ESTUDIO = ["Activo", "Inactivo"];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const urlMaterialSchema = Joi.string()
  .trim()
  .max(2048)
  .allow("", null)
  .optional()
  .custom((value, helpers) => {
    if (!value) return value;

    const esUrlExterna = /^https?:\/\/\S+$/i.test(value);
    const esArchivoSubido = /^\/uploads\/materiales\/\S+$/i.test(value);

    if (esUrlExterna || esArchivoSubido) {
      return value;
    }

    return helpers.error("string.materialUrl");
  })
  .messages({
    "string.max": "La URL del material no puede superar los 2048 caracteres",
    "string.materialUrl":
      "La URL del material debe ser un enlace valido o un archivo subido",
  });

const materialCreateSchema = Joi.object({
  titulo: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "El titulo del material es obligatorio",
    "string.min": "El titulo debe tener al menos 2 caracteres",
    "string.max": "El titulo no puede superar los 150 caracteres",
    "any.required": "El titulo del material es obligatorio",
  }),

  descripcion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La descripcion no puede superar los 1000 caracteres",
  }),

  tipo: Joi.string()
    .trim()
    .valid(...TIPOS_MATERIAL_ESTUDIO)
    .required()
    .messages({
      "any.only": "El tipo debe ser: PDF, Video, Link, Documento u Otro",
      "any.required": "El tipo de material es obligatorio",
      "string.empty": "El tipo de material es obligatorio",
    }),

  url_material: urlMaterialSchema,

  id_clase_teorica: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "La clase teorica asociada debe ser un numero",
    "number.integer": "La clase teorica asociada debe ser un numero entero",
    "number.positive": "La clase teorica asociada debe ser positiva",
  }),

  estado: Joi.string()
    .trim()
    .valid(...ESTADOS_MATERIAL_ESTUDIO)
    .default("Activo")
    .messages({
      "any.only": "El estado debe ser: Activo o Inactivo",
    }),
});

const materialUpdateSchema = Joi.object({
  titulo: Joi.string().trim().min(2).max(150).optional().messages({
    "string.min": "El titulo debe tener al menos 2 caracteres",
    "string.max": "El titulo no puede superar los 150 caracteres",
  }),

  descripcion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La descripcion no puede superar los 1000 caracteres",
  }),

  tipo: Joi.string()
    .trim()
    .valid(...TIPOS_MATERIAL_ESTUDIO)
    .optional()
    .messages({
      "any.only": "El tipo debe ser: PDF, Video, Link, Documento u Otro",
    }),

  url_material: urlMaterialSchema,

  id_clase_teorica: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "La clase teorica asociada debe ser un numero",
    "number.integer": "La clase teorica asociada debe ser un numero entero",
    "number.positive": "La clase teorica asociada debe ser positiva",
  }),

  estado: Joi.string()
    .trim()
    .valid(...ESTADOS_MATERIAL_ESTUDIO)
    .optional()
    .messages({
      "any.only": "El estado debe ser: Activo o Inactivo",
    }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const materialIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

export function validateMaterialEstudioCreate(data) {
  const { error, value } = materialCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateMaterialEstudioUpdate(data) {
  const { error, value } = materialUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateMaterialEstudioIdParam(params) {
  const { error } = materialIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
