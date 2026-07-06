import Joi from "joi";

import {
  convertirHoraAMinutos as convertirHoraAMinutosComun,
  validarHorarioAtencion,
} from "./common.validation.js";

export const DIAS_SEMANA_DISPONIBILIDAD = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export const ESTADOS_DISPONIBILIDAD_PROFESOR = ["Activa", "Inactiva"];

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

export function convertirHoraAMinutos(hora) {
  return convertirHoraAMinutosComun(hora);
}

export function validarRangoHorario(horaInicio, horaFin) {
  const horarioAtencion = validarHorarioAtencion(horaInicio, horaFin);

  if (!horarioAtencion.valido) {
    return horarioAtencion.mensaje;
  }

  if (convertirHoraAMinutos(horaFin) <= convertirHoraAMinutos(horaInicio)) {
    return "La hora de término debe ser mayor que la hora de inicio.";
  }

  return null;
}

const disponibilidadCreateSchema = Joi.object({
  id_profesor: Joi.number().integer().positive().required().messages({
    "number.base": "Debe seleccionar un profesor válido",
    "number.integer": "Debe seleccionar un profesor válido",
    "number.positive": "Debe seleccionar un profesor válido",
    "any.required": "El profesor es obligatorio",
  }),

  dia_semana: Joi.string()
    .valid(...DIAS_SEMANA_DISPONIBILIDAD)
    .required()
    .messages({
      "any.only": "El día debe ser: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado",
      "any.required": "El día de la semana es obligatorio",
      "string.empty": "El día de la semana es obligatorio",
    }),

  hora_inicio: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de inicio debe tener formato HH:mm",
    "any.required": "La hora de inicio es obligatoria",
    "string.empty": "La hora de inicio es obligatoria",
  }),

  hora_fin: Joi.string().pattern(horaRegex).required().messages({
    "string.pattern.base": "La hora de término debe tener formato HH:mm",
    "any.required": "La hora de término es obligatoria",
    "string.empty": "La hora de término es obligatoria",
  }),

  sede: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria",
    "string.min": "La sede debe tener al menos 2 caracteres",
    "string.max": "La sede no puede superar los 50 caracteres",
    "any.required": "La sede es obligatoria",
  }),

  estado: Joi.string()
    .valid(...ESTADOS_DISPONIBILIDAD_PROFESOR)
    .default("Activa")
    .messages({
      "any.only": "El estado debe ser: Activa o Inactiva",
    }),
});

const disponibilidadUpdateSchema = Joi.object({
  id_profesor: Joi.number().integer().positive().optional().messages({
    "number.base": "Debe seleccionar un profesor válido",
    "number.integer": "Debe seleccionar un profesor válido",
    "number.positive": "Debe seleccionar un profesor válido",
  }),

  dia_semana: Joi.string()
    .valid(...DIAS_SEMANA_DISPONIBILIDAD)
    .optional()
    .messages({
      "any.only": "El día debe ser: Lunes, Martes, Miércoles, Jueves, Viernes o Sábado",
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
    .valid(...ESTADOS_DISPONIBILIDAD_PROFESOR)
    .optional()
    .messages({
      "any.only": "El estado debe ser: Activa o Inactiva",
    }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const disponibilidadIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El identificador de disponibilidad debe ser numérico",
    "number.integer": "El identificador de disponibilidad debe ser un número entero",
    "number.positive": "El identificador de disponibilidad debe ser positivo",
    "any.required": "El identificador de disponibilidad es obligatorio",
  }),
});

const disponibilidadProfesorParamSchema = Joi.object({
  id_profesor: Joi.number().integer().positive().required().messages({
    "number.base": "El profesor debe ser numérico",
    "number.integer": "El profesor debe ser un número entero",
    "number.positive": "El profesor debe ser positivo",
    "any.required": "El profesor es obligatorio",
  }),
});

export function validateDisponibilidadProfesorCreate(data) {
  const { error, value } = disponibilidadCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateDisponibilidadProfesorUpdate(data) {
  const { error, value } = disponibilidadUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateDisponibilidadProfesorIdParam(params) {
  const { error } = disponibilidadIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateDisponibilidadProfesorParam(params) {
  const { error } = disponibilidadProfesorParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
