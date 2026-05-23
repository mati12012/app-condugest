"use strict";

import Joi from "joi";

const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/u;

export const salaIdParamValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID debe ser un número",
      "number.integer": "El ID debe ser un número entero",
      "number.positive": "El ID debe ser un número positivo",
      "any.required": "El ID es obligatorio",
    }),
});

export const salaCreateValidation = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .pattern(nombreRegex)
    .required()
    .messages({
      "string.base": "El nombre de la sala debe ser texto",
      "string.min": "El nombre de la sala debe tener al menos 3 caracteres",
      "string.max": "El nombre de la sala no puede superar los 100 caracteres",
      "string.pattern.base": "El nombre de la sala solo puede contener letras, números y espacios",
      "any.required": "El nombre de la sala es obligatorio",
    }),

  sede: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": "La sede debe ser texto",
      "string.min": "La sede debe tener al menos 3 caracteres",
      "string.max": "La sede no puede superar los 50 caracteres",
      "any.required": "La sede es obligatoria",
    }),

  capacidad: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "La capacidad debe ser un número",
      "number.integer": "La capacidad debe ser un número entero",
      "number.min": "La capacidad debe ser al menos 1",
      "any.required": "La capacidad es obligatoria",
    }),

  estado: Joi.boolean()
    .required()
    .messages({
      "boolean.base": "El estado debe ser verdadero o falso",
      "any.required": "El estado de la sala es obligatorio",
    }),
});

export const salaUpdateValidation = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .pattern(nombreRegex)
    .messages({
      "string.min": "El nombre de la sala debe tener al menos 3 caracteres",
      "string.max": "El nombre de la sala no puede superar los 100 caracteres",
      "string.pattern.base": "El nombre de la sala solo puede contener letras, números y espacios",
    }),

  sede: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "La sede debe tener al menos 3 caracteres",
      "string.max": "La sede no puede superar los 50 caracteres",
    }),

  capacidad: Joi.number()
    .integer()
    .min(1)
    .messages({
      "number.base": "La capacidad debe ser un número",
      "number.integer": "La capacidad debe ser un número entero",
      "number.min": "La capacidad debe ser al menos 1",
    }),

  estado: Joi.boolean()
    .messages({
      "boolean.base": "El estado debe ser verdadero o falso",
    }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

export function validateSalaIdParam(param) {
  const { error } = salaIdParamValidation.validate(param,{
    abortEarly: false,
  });

  if (error) {
    return error.details.map((err) => err.message);
  }
    return [];
}

export function validateSalaCreate(data) {
  const { error } = salaCreateValidation.validate(data, { abortEarly: false });

  if (error) {
    return error.details.map((err) => err.message);
  }

  return [];
}

export function validateSalaUpdate(data) {
  const { error } = salaUpdateValidation.validate(data, { abortEarly: false });

  if (error) {
    return error.details.map((err) => err.message);
  }

  return [];
}