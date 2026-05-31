import Joi from "joi";

const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;

const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

const telefonoRegex = /^(\+56)?\d{8,9}$/;

const licenciasPermitidas = ["B", "C", "A2", "A3", "A4", "A5", "D"];

const especialidadesPermitidas = [
  "Clases prácticas",
  "Clases teóricas",
  "Evaluación psicotécnica",
  "Mixto",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const profesorCreateSchema = Joi.object({
  rut: Joi.string().trim().pattern(rutRegex).required().messages({
    "string.empty": "El RUT es obligatorio",
    "string.pattern.base":
      "El RUT debe tener un formato válido, por ejemplo 12.345.678-9 o 12345678-9",
    "any.required": "El RUT es obligatorio",
  }),

  nombre: Joi.string().trim().min(2).max(100).pattern(nombreRegex).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede superar los 100 caracteres",
    "string.pattern.base": "El nombre solo debe contener letras y espacios",
    "any.required": "El nombre es obligatorio",
  }),

  apellido: Joi.string().trim().min(2).max(100).pattern(nombreRegex).required().messages({
    "string.empty": "El apellido es obligatorio",
    "string.min": "El apellido debe tener al menos 2 caracteres",
    "string.max": "El apellido no puede superar los 100 caracteres",
    "string.pattern.base": "El apellido solo debe contener letras y espacios",
    "any.required": "El apellido es obligatorio",
  }),

  correo_personal: Joi.string().trim().email().allow("", null).optional().messages({
    "string.email": "El correo personal debe tener un formato válido",
  }),

  telefono: Joi.string().trim().pattern(telefonoRegex).allow("", null).optional().messages({
    "string.pattern.base":
      "El teléfono debe tener un formato válido, por ejemplo +56912345678 o 912345678",
  }),

  sede: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria",
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
    "any.required": "La sede es obligatoria",
  }),

  licencia_autorizada: Joi.string()
    .trim()
    .valid(...licenciasPermitidas)
    .required()
    .messages({
      "any.only": "La licencia autorizada debe ser una de: B, C, A2, A3, A4, A5 o D",
      "string.empty": "La licencia autorizada es obligatoria",
      "any.required": "La licencia autorizada es obligatoria",
    }),

  especialidad: Joi.string()
    .trim()
    .valid(...especialidadesPermitidas)
    .required()
    .messages({
      "any.only":
        "La especialidad debe ser una de: Clases prácticas, Clases teóricas, Evaluación psicotécnica o Mixto",
      "string.empty": "La especialidad es obligatoria",
      "any.required": "La especialidad es obligatoria",
    }),

  estado: Joi.boolean().optional(),
});

const profesorUpdateSchema = Joi.object({
  rut: Joi.string().trim().pattern(rutRegex).optional().messages({
    "string.pattern.base":
      "El RUT debe tener un formato válido, por ejemplo 12.345.678-9 o 12345678-9",
  }),

  nombre: Joi.string().trim().min(2).max(100).pattern(nombreRegex).optional().messages({
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede superar los 100 caracteres",
    "string.pattern.base": "El nombre solo debe contener letras y espacios",
  }),

  apellido: Joi.string().trim().min(2).max(100).pattern(nombreRegex).optional().messages({
    "string.min": "El apellido debe tener al menos 2 caracteres",
    "string.max": "El apellido no puede superar los 100 caracteres",
    "string.pattern.base": "El apellido solo debe contener letras y espacios",
  }),

  correo_personal: Joi.string().trim().email().allow("", null).optional().messages({
    "string.email": "El correo personal debe tener un formato válido",
  }),

  telefono: Joi.string().trim().pattern(telefonoRegex).allow("", null).optional().messages({
    "string.pattern.base":
      "El teléfono debe tener un formato válido, por ejemplo +56912345678 o 912345678",
  }),

  sede: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
  }),

  licencia_autorizada: Joi.string()
    .trim()
    .valid(...licenciasPermitidas)
    .optional()
    .messages({
      "any.only": "La licencia autorizada debe ser una de: B, C, A2, A3, A4, A5 o D",
    }),

  especialidad: Joi.string()
    .trim()
    .valid(...especialidadesPermitidas)
    .optional()
    .messages({
      "any.only":
        "La especialidad debe ser una de: Clases prácticas, Clases teóricas, Evaluación psicotécnica o Mixto",
    }),

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