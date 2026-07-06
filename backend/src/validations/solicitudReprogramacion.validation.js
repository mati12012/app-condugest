import Joi from "joi";

import { validarHorarioAtencion } from "./common.validation.js";

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const estadosSecretaria = ["Aprobada", "Rechazada", "Cancelada"];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

function validarRangoHorario(value, helpers) {
  const horarioAtencion = validarHorarioAtencion(
    value.hora_inicio_solicitada,
    value.hora_fin_solicitada
  );

  if (!horarioAtencion.valido) {
    return helpers.message(horarioAtencion.mensaje);
  }

  return value;
}

const reprogramacionCreateSchema = Joi.object({
  id_clase_practica: Joi.number().integer().positive().required().messages({
    "number.base": "La clase practica es obligatoria",
    "number.integer": "La clase practica debe ser un numero entero",
    "number.positive": "La clase practica debe ser positiva",
    "any.required": "La clase practica es obligatoria",
  }),

  motivo: Joi.string().trim().min(3).max(1000).required().messages({
    "string.empty": "El motivo es obligatorio",
    "string.min": "El motivo debe tener al menos 3 caracteres",
    "string.max": "El motivo no puede superar los 1000 caracteres",
    "any.required": "El motivo es obligatorio",
  }),

  fecha_solicitada: Joi.string().pattern(fechaRegex).required().messages({
    "string.pattern.base": "La fecha solicitada debe tener formato YYYY-MM-DD",
    "string.empty": "La fecha solicitada es obligatoria",
    "any.required": "La fecha solicitada es obligatoria",
  }),

  hora_inicio_solicitada: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de inicio solicitada debe tener formato HH:mm",
    "string.empty": "La hora de inicio solicitada es obligatoria",
    "any.required": "La hora de inicio solicitada es obligatoria",
  }),

  hora_fin_solicitada: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de fin solicitada debe tener formato HH:mm",
    "string.empty": "La hora de fin solicitada es obligatoria",
    "any.required": "La hora de fin solicitada es obligatoria",
  }),
})
  .custom(validarRangoHorario)
  .messages({
    "horario.rango": "La hora de fin solicitada debe ser posterior a la hora de inicio solicitada",
  });

const reprogramacionUpdateSchema = Joi.object({
  estado: Joi.string()
    .trim()
    .valid(...estadosSecretaria)
    .optional()
    .messages({
      "any.only": "El estado debe ser Aprobada, Rechazada o Cancelada",
      "string.empty": "El estado no puede estar vacio",
    }),

  respuesta_secretaria: Joi.string()
    .trim()
    .max(1000)
    .allow("", null)
    .optional()
    .messages({
      "string.max": "La respuesta de secretaria no puede superar los 1000 caracteres",
    }),
})
  .min(1)
  .messages({
    "object.min": "Debe enviar al menos un campo para actualizar",
  });

const reprogramacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la solicitud debe ser un numero",
    "number.integer": "El ID de la solicitud debe ser un numero entero",
    "number.positive": "El ID de la solicitud debe ser positivo",
    "any.required": "El ID de la solicitud es obligatorio",
  }),
});

function limpiarTexto(valor) {
  if (typeof valor !== "string") return valor;

  const limpio = valor.trim();

  return limpio === "" ? null : limpio;
}

export function limpiarDatosReprogramacion(data) {
  const limpio = {};

  if (data.id_clase_practica !== undefined && data.id_clase_practica !== "") {
    limpio.id_clase_practica = Number(data.id_clase_practica);
  }

  [
    "motivo",
    "fecha_solicitada",
    "hora_inicio_solicitada",
    "hora_fin_solicitada",
    "estado",
    "respuesta_secretaria",
  ].forEach((campo) => {
    if (data[campo] !== undefined) {
      limpio[campo] = limpiarTexto(data[campo]);
    }
  });

  return limpio;
}

export function validateReprogramacionCreate(data) {
  const { error, value } = reprogramacionCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateReprogramacionUpdate(data) {
  const { error, value } = reprogramacionUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateReprogramacionIdParam(params) {
  const { error } = reprogramacionIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
