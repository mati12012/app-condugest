"use strict";

import Joi from "joi";

export const estadosAsistenciaPractica = [
  "Presente",
  "Ausente",
  "Justificado",
  "Pendiente",
];

function formatValidationErrors(error) {
  if (!error) return [];
  return error.details.map((detail) => detail.message);
}

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "La clase practica debe ser valida",
    "number.integer": "La clase practica debe ser valida",
    "number.positive": "La clase practica debe ser valida",
    "any.required": "La clase practica es obligatoria",
  }),
});

const idAlumnoSchema = Joi.object({
  id_alumno: Joi.number().integer().positive().required().messages({
    "number.base": "El alumno debe ser valido",
    "number.integer": "El alumno debe ser valido",
    "number.positive": "El alumno debe ser valido",
    "any.required": "El alumno es obligatorio",
  }),
});

const idProfesorSchema = Joi.object({
  id_profesor: Joi.number().integer().positive().required().messages({
    "number.base": "El profesor debe ser valido",
    "number.integer": "El profesor debe ser valido",
    "number.positive": "El profesor debe ser valido",
    "any.required": "El profesor es obligatorio",
  }),
});

const registroAsistenciaPracticaSchema = Joi.object({
  estado_asistencia: Joi.string()
    .valid(...estadosAsistenciaPractica)
    .required()
    .messages({
      "any.only": "El estado debe ser Presente, Ausente, Justificado o Pendiente",
      "string.empty": "El estado de asistencia es obligatorio",
      "any.required": "El estado de asistencia es obligatorio",
    }),
  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 500 caracteres",
  }),
});

export function validateAsistenciaPracticaIdParam(params) {
  const { error } = idSchema.validate(params, { abortEarly: false });
  return formatValidationErrors(error);
}

export function validateAsistenciaPracticaAlumnoParam(params) {
  const { error } = idAlumnoSchema.validate(params, { abortEarly: false });
  return formatValidationErrors(error);
}

export function validateAsistenciaPracticaProfesorParam(params) {
  const { error } = idProfesorSchema.validate(params, { abortEarly: false });
  return formatValidationErrors(error);
}

export function validateRegistroAsistenciaPractica(data) {
  const { error } = registroAsistenciaPracticaSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
