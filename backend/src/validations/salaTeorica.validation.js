"use strict";

import Joi from "joi";

export const salaTeoricaIdParamValidation = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "La sala teorica indicada no es valida.",
    "number.integer": "La sala teorica indicada no es valida.",
    "number.positive": "La sala teorica indicada no es valida.",
    "any.required": "Debe indicar la sala teorica.",
  }),
});

export const salaTeoricaCreateValidation = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "El nombre de la sala es obligatorio.",
    "string.min": "El nombre de la sala debe tener al menos 2 caracteres.",
    "string.max": "El nombre de la sala no puede superar los 100 caracteres.",
    "any.required": "El nombre de la sala es obligatorio.",
  }),
  sede: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "La sede es obligatoria.",
    "string.min": "La sede debe tener al menos 2 caracteres.",
    "string.max": "La sede no puede superar los 50 caracteres.",
    "any.required": "La sede es obligatoria.",
  }),
  capacidad: Joi.number().integer().positive().required().messages({
    "number.base": "La capacidad debe ser un numero.",
    "number.integer": "La capacidad debe ser un numero entero.",
    "number.positive": "La capacidad debe ser mayor a 0.",
    "any.required": "La capacidad es obligatoria.",
  }),
  estado: Joi.string().valid("Activa", "Inactiva").default("Activa").messages({
    "any.only": "El estado de la sala debe ser Activa o Inactiva.",
  }),
  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 500 caracteres.",
  }),
});

export const salaTeoricaUpdateValidation = Joi.object({
  nombre: Joi.string().trim().min(2).max(100).messages({
    "string.empty": "El nombre de la sala no puede estar vacio.",
    "string.min": "El nombre de la sala debe tener al menos 2 caracteres.",
    "string.max": "El nombre de la sala no puede superar los 100 caracteres.",
  }),
  sede: Joi.string().trim().min(2).max(50).messages({
    "string.empty": "La sede no puede estar vacia.",
    "string.min": "La sede debe tener al menos 2 caracteres.",
    "string.max": "La sede no puede superar los 50 caracteres.",
  }),
  capacidad: Joi.number().integer().positive().messages({
    "number.base": "La capacidad debe ser un numero.",
    "number.integer": "La capacidad debe ser un numero entero.",
    "number.positive": "La capacidad debe ser mayor a 0.",
  }),
  estado: Joi.string().valid("Activa", "Inactiva").messages({
    "any.only": "El estado de la sala debe ser Activa o Inactiva.",
  }),
  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 500 caracteres.",
  }),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar.",
});

function mapearErrores(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

export function validateSalaTeoricaIdParam(param) {
  const { error } = salaTeoricaIdParamValidation.validate(param, {
    abortEarly: false,
  });

  return mapearErrores(error);
}

export function validateSalaTeoricaCreate(data) {
  const { error } = salaTeoricaCreateValidation.validate(data, {
    abortEarly: false,
  });

  return mapearErrores(error);
}

export function validateSalaTeoricaUpdate(data) {
  const { error } = salaTeoricaUpdateValidation.validate(data, {
    abortEarly: false,
  });

  return mapearErrores(error);
}
