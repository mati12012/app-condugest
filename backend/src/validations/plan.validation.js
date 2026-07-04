import Joi from "joi";

const tiposPermitidos = ["Plan", "Clase adicional", "Extensión"];

const estadosPermitidos = ["Activo", "Inactivo"];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const planCreateSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "El nombre del plan es obligatorio",
    "string.min": "El nombre del plan debe tener al menos 2 caracteres",
    "string.max": "El nombre del plan no puede superar los 100 caracteres",
    "any.required": "El nombre del plan es obligatorio",
  }),

  descripcion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La descripcion no puede superar los 500 caracteres",
  }),

  cantidad_clases_practicas: Joi.number().integer().min(0).default(0).messages({
    "number.base": "La cantidad de clases practicas debe ser un numero",
    "number.integer": "La cantidad de clases practicas debe ser un numero entero",
    "number.min": "La cantidad de clases practicas no puede ser negativa",
  }),

  cantidad_clases_teoricas: Joi.number().integer().min(0).default(0).messages({
    "number.base": "La cantidad de clases teoricas debe ser un numero",
    "number.integer": "La cantidad de clases teoricas debe ser un numero entero",
    "number.min": "La cantidad de clases teoricas no puede ser negativa",
  }),

  valor: Joi.number().integer().min(0).default(0).messages({
    "number.base": "El valor debe ser un numero",
    "number.integer": "El valor debe ser un numero entero",
    "number.min": "El valor no puede ser negativo",
  }),

  tipo: Joi.string()
    .trim()
    .valid(...tiposPermitidos)
    .default("Plan")
    .messages({
      "any.only": "El tipo debe ser: Plan, Clase adicional o Extensión",
    }),

  estado: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .default("Activo")
    .messages({
      "any.only": "El estado debe ser: Activo o Inactivo",
    }),
});

const planUpdateSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "El nombre del plan debe tener al menos 2 caracteres",
    "string.max": "El nombre del plan no puede superar los 100 caracteres",
  }),

  descripcion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La descripcion no puede superar los 500 caracteres",
  }),

  cantidad_clases_practicas: Joi.number().integer().min(0).optional().messages({
    "number.base": "La cantidad de clases practicas debe ser un numero",
    "number.integer": "La cantidad de clases practicas debe ser un numero entero",
    "number.min": "La cantidad de clases practicas no puede ser negativa",
  }),

  cantidad_clases_teoricas: Joi.number().integer().min(0).optional().messages({
    "number.base": "La cantidad de clases teoricas debe ser un numero",
    "number.integer": "La cantidad de clases teoricas debe ser un numero entero",
    "number.min": "La cantidad de clases teoricas no puede ser negativa",
  }),

  valor: Joi.number().integer().min(0).optional().messages({
    "number.base": "El valor debe ser un numero",
    "number.integer": "El valor debe ser un numero entero",
    "number.min": "El valor no puede ser negativo",
  }),

  tipo: Joi.string()
    .trim()
    .valid(...tiposPermitidos)
    .optional()
    .messages({
      "any.only": "El tipo debe ser: Plan, Clase adicional o Extensión",
    }),

  estado: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .optional()
    .messages({
      "any.only": "El estado debe ser: Activo o Inactivo",
    }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const planIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

export function validatePlanCreate(data) {
  const { error, value } = planCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validatePlanUpdate(data) {
  const { error, value } = planUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validatePlanIdParam(params) {
  const { error } = planIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
