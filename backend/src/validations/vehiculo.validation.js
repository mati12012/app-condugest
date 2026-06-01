import Joi from "joi";

const patenteRegex = /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2})$/;

const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.-]+$/;

const transmisionesPermitidas = ["Manual", "Automática"];

const licenciasPermitidas = ["B", "C", "A2", "A3", "A4", "A5", "D"];

const estadosPermitidos = ["Disponible", "En mantención", "Fuera de servicio"];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const vehiculoCreateSchema = Joi.object({
  patente: Joi.string().trim().uppercase().pattern(patenteRegex).required().messages({
    "string.empty": "La patente es obligatoria",
    "string.pattern.base":
      "La patente debe tener formato chileno válido, por ejemplo AB1234 o ABCD12",
    "any.required": "La patente es obligatoria",
  }),

  marca: Joi.string().trim().min(2).max(50).pattern(textoRegex).required().messages({
    "string.empty": "La marca es obligatoria",
    "string.min": "La marca debe tener al menos 2 caracteres",
    "string.max": "La marca no puede superar los 50 caracteres",
    "string.pattern.base": "La marca contiene caracteres no permitidos",
    "any.required": "La marca es obligatoria",
  }),

  modelo: Joi.string().trim().min(1).max(50).pattern(textoRegex).required().messages({
    "string.empty": "El modelo es obligatorio",
    "string.max": "El modelo no puede superar los 50 caracteres",
    "string.pattern.base": "El modelo contiene caracteres no permitidos",
    "any.required": "El modelo es obligatorio",
  }),

  anio: Joi.number().integer().min(1990).max(2030).required().messages({
    "number.base": "El año debe ser un número",
    "number.integer": "El año debe ser un número entero",
    "number.min": "El año no puede ser menor a 1990",
    "number.max": "El año no puede ser mayor a 2030",
    "any.required": "El año es obligatorio",
  }),

  tipo_transmision: Joi.string()
    .trim()
    .valid(...transmisionesPermitidas)
    .required()
    .messages({
      "any.only": "El tipo de transmisión debe ser Manual o Automática",
      "string.empty": "El tipo de transmisión es obligatorio",
      "any.required": "El tipo de transmisión es obligatorio",
    }),

  licencia_requerida: Joi.string()
    .trim()
    .valid(...licenciasPermitidas)
    .required()
    .messages({
      "any.only": "La licencia requerida debe ser una de: B, C, A2, A3, A4, A5 o D",
      "string.empty": "La licencia requerida es obligatoria",
      "any.required": "La licencia requerida es obligatoria",
    }),

  sede: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria",
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
    "any.required": "La sede es obligatoria",
  }),

  kilometraje: Joi.number().integer().min(0).default(0).messages({
    "number.base": "El kilometraje debe ser un número",
    "number.integer": "El kilometraje debe ser un número entero",
    "number.min": "El kilometraje no puede ser negativo",
  }),

  estado_operativo: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .default("Disponible")
    .messages({
      "any.only":
        "El estado operativo debe ser: Disponible, En mantención o Fuera de servicio",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observación no puede superar los 500 caracteres",
  }),
});

const vehiculoUpdateSchema = Joi.object({
  patente: Joi.string().trim().uppercase().pattern(patenteRegex).optional().messages({
    "string.pattern.base":
      "La patente debe tener formato chileno válido, por ejemplo AB1234 o ABCD12",
  }),

  marca: Joi.string().trim().min(2).max(50).pattern(textoRegex).optional().messages({
    "string.min": "La marca debe tener al menos 2 caracteres",
    "string.max": "La marca no puede superar los 50 caracteres",
    "string.pattern.base": "La marca contiene caracteres no permitidos",
  }),

  modelo: Joi.string().trim().min(1).max(50).pattern(textoRegex).optional().messages({
    "string.max": "El modelo no puede superar los 50 caracteres",
    "string.pattern.base": "El modelo contiene caracteres no permitidos",
  }),

  anio: Joi.number().integer().min(1990).max(2030).optional().messages({
    "number.base": "El año debe ser un número",
    "number.integer": "El año debe ser un número entero",
    "number.min": "El año no puede ser menor a 1990",
    "number.max": "El año no puede ser mayor a 2030",
  }),

  tipo_transmision: Joi.string()
    .trim()
    .valid(...transmisionesPermitidas)
    .optional()
    .messages({
      "any.only": "El tipo de transmisión debe ser Manual o Automática",
    }),

  licencia_requerida: Joi.string()
    .trim()
    .valid(...licenciasPermitidas)
    .optional()
    .messages({
      "any.only": "La licencia requerida debe ser una de: B, C, A2, A3, A4, A5 o D",
    }),

  sede: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
  }),

  kilometraje: Joi.number().integer().min(0).optional().messages({
    "number.base": "El kilometraje debe ser un número",
    "number.integer": "El kilometraje debe ser un número entero",
    "number.min": "El kilometraje no puede ser negativo",
  }),

  estado_operativo: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .optional()
    .messages({
      "any.only":
        "El estado operativo debe ser: Disponible, En mantención o Fuera de servicio",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observación no puede superar los 500 caracteres",
  }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const vehiculoIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un número",
    "number.integer": "El ID debe ser un número entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

export function validateVehiculoCreate(data) {
  const { error } = vehiculoCreateSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateVehiculoUpdate(data) {
  const { error } = vehiculoUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateVehiculoIdParam(params) {
  const { error } = vehiculoIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}