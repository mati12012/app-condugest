"use strict";

import Joi from "joi";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

const estadosPermitidos = ["Programada", "Realizada", "Cancelada"];

// Función para validar las reglas de horario de las clases teóricas
export function validarReglasHorarioPractica(horaInicio, horaFin) {
    const inicioLimpio = String(horaInicio).slice(0, 5);
    const finLimpio = String(horaFin).slice(0, 5);

    const [inicioHora, inicioMin] = inicioLimpio.split(':').map(Number);
    const [finHora, finMin] = finLimpio.split(':').map(Number);

    const minutosInicio = (inicioHora * 60) + inicioMin;
    const minutosFin = (finHora * 60) + finMin;

    // Regla 1: Horario permitido para clases prácticas en la calle
    if (minutosInicio < 8 * 60 || minutosFin > 20 * 60) {
        return { valido: false, mensaje: "Por seguridad, las clases prácticas en la calle solo se realizan entre las 08:00 y las 20:00 horas." };
    }

    // Regla 2: Hora de término mayor a hora de inicio
    if (minutosFin <= minutosInicio) {
        return { valido: false, mensaje: "La hora de término debe ser posterior a la hora de inicio." };
    }

    // Regla 3: Duración mínima y máxima de la clase práctica
    const duracion = minutosFin - minutosInicio;
    
    // Mínimo 45 minutos 
    if (duracion < 45) { 
        return { valido: false, mensaje: "Una clase práctica debe durar al menos 45 minutos." };
    }
    
    // Máximo 2 horas
    if (duracion > 120) { 
        return { valido: false, mensaje: "La clase práctica no puede exceder las 2 horas continuas." };
    }

    return { valido: true };
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

  return formatValidationErrors(error);
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