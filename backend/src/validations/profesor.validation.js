import Joi from "joi";

const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const profesorCreateSchema = Joi.object({
  rut: Joi.string().pattern(rutRegex).required().messages({
    "string.empty": "El RUT es obligatorio",
    "string.pattern.base": "El RUT debe tener un formato válido, por ejemplo 12.345.678-9",
    "any.required": "El RUT es obligatorio",
  }),

  nombre: Joi.string().min(2).max(100).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "any.required": "El nombre es obligatorio",
  }),

  apellido: Joi.string().min(2).max(100).required().messages({
    "string.empty": "El apellido es obligatorio",
    "string.min": "El apellido debe tener al menos 2 caracteres",
    "any.required": "El apellido es obligatorio",
  }),

  correo_personal: Joi.string().email().allow("", null).optional().messages({
    "string.email": "El correo personal debe tener un formato válido",
  }),

  telefono: Joi.string().allow("", null).optional(),

  sede: Joi.string().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria",
    "any.required": "La sede es obligatoria",
  }),

  licencia_autorizada: Joi.string().min(1).max(20).required().messages({
    "string.empty": "La licencia autorizada es obligatoria",
    "any.required": "La licencia autorizada es obligatoria",
  }),

  especialidad: Joi.string().min(2).max(50).required().messages({
    "string.empty": "La especialidad es obligatoria",
    "any.required": "La especialidad es obligatoria",
  }),

  estado: Joi.boolean().optional(),
});

const profesorUpdateSchema = Joi.object({
  rut: Joi.string().pattern(rutRegex).optional().messages({
    "string.pattern.base": "El RUT debe tener un formato válido, por ejemplo 12.345.678-9",
  }),

  nombre: Joi.string().min(2).max(100).optional(),
  apellido: Joi.string().min(2).max(100).optional(),

  correo_personal: Joi.string().email().allow("", null).optional().messages({
    "string.email": "El correo personal debe tener un formato válido",
  }),

  telefono: Joi.string().allow("", null).optional(),
  sede: Joi.string().min(2).max(50).optional(),
  licencia_autorizada: Joi.string().min(1).max(20).optional(),
  especialidad: Joi.string().min(2).max(50).optional(),
  estado: Joi.boolean().optional(),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const profesorIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un número",
    "number.integer": "El ID debe ser un número entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

export function validateProfesorCreate(data) {
  const { error } = profesorCreateSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateProfesorUpdate(data) {
  const { error } = profesorUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateProfesorIdParam(params) {
  const { error } = profesorIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}   