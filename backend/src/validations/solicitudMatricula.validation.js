import Joi from "joi";

const estadosPermitidos = [
  "Pendiente",
  "Contactado",
  "Matriculado",
  "Descartado",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const solicitudCreateSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede superar los 100 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  apellido: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "El apellido es obligatorio",
    "string.min": "El apellido debe tener al menos 2 caracteres",
    "string.max": "El apellido no puede superar los 100 caracteres",
    "any.required": "El apellido es obligatorio",
  }),

  rut: Joi.string().trim().min(7).max(12).required().messages({
    "string.empty": "El RUT es obligatorio",
    "string.min": "El RUT debe tener al menos 7 caracteres",
    "string.max": "El RUT no puede superar los 12 caracteres",
    "any.required": "El RUT es obligatorio",
  }),

  correo: Joi.string().trim().email().max(150).required().messages({
    "string.empty": "El correo es obligatorio",
    "string.email": "El correo debe tener formato valido",
    "string.max": "El correo no puede superar los 150 caracteres",
    "any.required": "El correo es obligatorio",
  }),

  telefono: Joi.string().trim().min(8).max(20).required().messages({
    "string.empty": "El telefono es obligatorio",
    "string.min": "El telefono debe tener al menos 8 caracteres",
    "string.max": "El telefono no puede superar los 20 caracteres",
    "any.required": "El telefono es obligatorio",
  }),

  id_plan: Joi.number().integer().positive().required().messages({
    "number.base": "El plan es obligatorio",
    "number.integer": "El plan debe ser un numero entero",
    "number.positive": "El plan debe ser positivo",
    "any.required": "El plan es obligatorio",
  }),

  mensaje: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "El mensaje no puede superar los 1000 caracteres",
  }),
});

const solicitudUpdateSchema = Joi.object({
  estado: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .required()
    .messages({
      "any.only":
        "El estado debe ser: Pendiente, Contactado, Matriculado o Descartado",
      "string.empty": "El estado es obligatorio",
      "any.required": "El estado es obligatorio",
    }),
});

const solicitudIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

export function validateSolicitudMatriculaCreate(data) {
  const { error, value } = solicitudCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateSolicitudMatriculaUpdate(data) {
  const { error, value } = solicitudUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateSolicitudMatriculaIdParam(params) {
  const { error } = solicitudIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
