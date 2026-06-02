"use strict";

import Joi from "joi";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

const estadosPermitidos = ["Programada", "Realizada", "Cancelada"];

function horaAMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export function horaFinEsMayor(horaInicio, horaFin) {
  return horaAMinutos(horaFin) > horaAMinutos(horaInicio);
}

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const clasePracticaCreateSchema = Joi.object({
  id_alumno: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del alumno debe ser numérico",
    "number.integer": "El ID del alumno debe ser un número entero",
    "number.positive": "El ID del alumno debe ser mayor a 0",
    "any.required": "El alumno es obligatorio",
  }),

  id_profesor: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del profesor debe ser numérico",
    "number.integer": "El ID del profesor debe ser un número entero",
    "number.positive": "El ID del profesor debe ser mayor a 0",
    "any.required": "El profesor es obligatorio",
  }),

  id_vehiculo: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del vehículo debe ser numérico",
    "number.integer": "El ID del vehículo debe ser un número entero",
    "number.positive": "El ID del vehículo debe ser mayor a 0",
    "any.required": "El vehículo es obligatorio",
  }),

  fecha: Joi.string().pattern(fechaRegex).required().messages({
    "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD",
    "any.required": "La fecha es obligatoria",
  }),

  hora_inicio: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
    "any.required": "La hora de inicio es obligatoria",
  }),

  hora_fin: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de término debe tener formato HH:mm",
    "any.required": "La hora de término es obligatoria",
  }),

  sede: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria",
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
    "any.required": "La sede es obligatoria",
  }),

  estado: Joi.string()
    .valid(...estadosPermitidos)
    .default("Programada")
    .messages({
      "any.only": "El estado debe ser: Programada, Realizada o Cancelada",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observación no puede superar los 500 caracteres",
  }),
});

const clasePracticaUpdateSchema = Joi.object({
  id_alumno: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID del alumno debe ser numérico",
    "number.integer": "El ID del alumno debe ser un número entero",
    "number.positive": "El ID del alumno debe ser mayor a 0",
  }),

  id_profesor: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID del profesor debe ser numérico",
    "number.integer": "El ID del profesor debe ser un número entero",
    "number.positive": "El ID del profesor debe ser mayor a 0",
  }),

  id_vehiculo: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID del vehículo debe ser numérico",
    "number.integer": "El ID del vehículo debe ser un número entero",
    "number.positive": "El ID del vehículo debe ser mayor a 0",
  }),

  fecha: Joi.string().pattern(fechaRegex).optional().messages({
    "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD",
  }),

  hora_inicio: Joi.string().pattern(horaRegex).optional().messages({
    "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
  }),

  hora_fin: Joi.string().pattern(horaRegex).optional().messages({
    "string.pattern.base": "La hora de término debe tener formato HH:mm",
  }),

  sede: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
  }),

  estado: Joi.string()
    .valid(...estadosPermitidos)
    .optional()
    .messages({
      "any.only": "El estado debe ser: Programada, Realizada o Cancelada",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observación no puede superar los 500 caracteres",
  }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const clasePracticaIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la clase práctica debe ser numérico",
    "number.integer": "El ID de la clase práctica debe ser un número entero",
    "number.positive": "El ID de la clase práctica debe ser mayor a 0",
    "any.required": "El ID de la clase práctica es obligatorio",
  }),
});

export function validateClasePracticaCreate(data) {
  const { error } = clasePracticaCreateSchema.validate(data, {
    abortEarly: false,
  });

  const errores = formatValidationErrors(error);

  if (
    data.hora_inicio &&
    data.hora_fin &&
    horaRegex.test(data.hora_inicio) &&
    horaRegex.test(data.hora_fin) &&
    !horaFinEsMayor(data.hora_inicio, data.hora_fin)
  ) {
    errores.push("La hora de término debe ser mayor que la hora de inicio");
  }

  return errores;
}

export function validateClasePracticaUpdate(data) {
  const { error } = clasePracticaUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateClasePracticaIdParam(params) {
  const { error } = clasePracticaIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}