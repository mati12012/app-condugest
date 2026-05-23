"use strict";

import Joi from "joi";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

const estadosPermitidos = ["reservada", "pendiente", "cancelada", "finalizada"];

function horaAMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export function horaFinEsMayor(horaInicio, horaFin) {
  return horaAMinutos(horaFin) > horaAMinutos(horaInicio);
}

export const reservaCreateValidation = Joi.object({
  id_sala: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de la sala debe ser numérico",
      "number.integer": "El ID de la sala debe ser un número entero",
      "number.positive": "El ID de la sala debe ser mayor a 0",
      "any.required": "El ID de la sala es obligatorio",
    }),

  fecha: Joi.string()
    .pattern(fechaRegex)
    .required()
    .messages({
      "string.base": "La fecha debe ser texto",
      "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD",
      "any.required": "La fecha es obligatoria",
    }),

  hora_inicio: Joi.string()
    .pattern(horaRegex)
    .required()
    .messages({
      "string.base": "La hora de inicio debe ser texto",
      "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
      "any.required": "La hora de inicio es obligatoria",
    }),

  hora_fin: Joi.string()
    .pattern(horaRegex)
    .required()
    .messages({
      "string.base": "La hora de término debe ser texto",
      "string.pattern.base": "La hora de término debe tener formato HH:mm",
      "any.required": "La hora de término es obligatoria",
    }),

  cantidad_alumnos: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "La cantidad de alumnos debe ser un número",
      "number.integer": "La cantidad de alumnos debe ser un número entero",
      "number.min": "La cantidad de alumnos debe ser al menos 1",
      "any.required": "La cantidad de alumnos es obligatoria",
    }),

  estado: Joi.string()
    .valid(...estadosPermitidos)
    .required()
    .messages({
      "any.only": "El estado debe ser: reservada, pendiente, cancelada o finalizada",
      "any.required": "El estado de la reserva es obligatorio",
    }),

  observacion: Joi.string()
    .max(255)
    .allow("", null)
    .messages({
      "string.max": "La observación no puede superar los 255 caracteres",
    }),
});

export const reservaUpdateValidation = Joi.object({
  id_sala: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID de la sala debe ser numérico",
      "number.integer": "El ID de la sala debe ser un número entero",
      "number.positive": "El ID de la sala debe ser mayor a 0",
    }),

  fecha: Joi.string()
    .pattern(fechaRegex)
    .messages({
      "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD",
    }),

  hora_inicio: Joi.string()
    .pattern(horaRegex)
    .messages({
      "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
    }),

  hora_fin: Joi.string()
    .pattern(horaRegex)
    .messages({
      "string.pattern.base": "La hora de término debe tener formato HH:mm",
    }),

  cantidad_alumnos: Joi.number()
    .integer()
    .min(1)
    .messages({
      "number.base": "La cantidad de alumnos debe ser un número",
      "number.integer": "La cantidad de alumnos debe ser un número entero",
      "number.min": "La cantidad de alumnos debe ser al menos 1",
    }),

  estado: Joi.string()
    .valid(...estadosPermitidos)
    .messages({
      "any.only": "El estado debe ser: reservada, pendiente, cancelada o finalizada",
    }),

  observacion: Joi.string()
    .max(255)
    .allow("", null)
    .messages({
      "string.max": "La observación no puede superar los 255 caracteres",
    }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

export const reservaIdParamValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de la reserva debe ser numérico",
      "number.integer": "El ID de la reserva debe ser un número entero",
      "number.positive": "El ID de la reserva debe ser mayor a 0",
      "any.required": "El ID de la reserva es obligatorio",
    }),
});

export const disponibilidadQueryValidation = Joi.object({
  id_sala: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de la sala debe ser numérico",
      "number.integer": "El ID de la sala debe ser un número entero",
      "number.positive": "El ID de la sala debe ser mayor a 0",
      "any.required": "El ID de la sala es obligatorio",
    }),

  fecha: Joi.string()
    .pattern(fechaRegex)
    .required()
    .messages({
      "string.pattern.base": "La fecha debe tener formato YYYY-MM-DD",
      "any.required": "La fecha es obligatoria",
    }),

  hora_inicio: Joi.string()
    .pattern(horaRegex)
    .required()
    .messages({
      "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
      "any.required": "La hora de inicio es obligatoria",
    }),

  hora_fin: Joi.string()
    .pattern(horaRegex)
    .required()
    .messages({
      "string.pattern.base": "La hora de término debe tener formato HH:mm",
      "any.required": "La hora de término es obligatoria",
    }),
});

export function validateReservaCreate(data) {
  const { error } = reservaCreateValidation.validate(data, {
    abortEarly: false,
  });

  const errores = error ? error.details.map((err) => err.message) : [];

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

export function validateReservaUpdate(data) {
  const { error } = reservaUpdateValidation.validate(data, {
    abortEarly: false,
  });

  const errores = error ? error.details.map((err) => err.message) : [];

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

export function validateReservaIdParam(params) {
  const { error } = reservaIdParamValidation.validate(params, {
    abortEarly: false,
  });

  if (error) {
    return error.details.map((err) => err.message);
  }

  return [];
}

export function validateDisponibilidadQuery(query) {
  const { error } = disponibilidadQueryValidation.validate(query, {
    abortEarly: false,
  });

  const errores = error ? error.details.map((err) => err.message) : [];

  if (
    query.hora_inicio &&
    query.hora_fin &&
    horaRegex.test(query.hora_inicio) &&
    horaRegex.test(query.hora_fin) &&
    !horaFinEsMayor(query.hora_inicio, query.hora_fin)
  ) {
    errores.push("La hora de término debe ser mayor que la hora de inicio");
  }

  return errores;
}