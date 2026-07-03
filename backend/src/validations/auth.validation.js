"use strict";

import Joi from "joi";

const loginSchema = Joi.object({
  correo: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "El correo debe tener un formato válido",
      "string.empty": "El correo es obligatorio",
      "any.required": "El correo es obligatorio",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "La contraseña es obligatoria",
      "string.min": "La contraseña debe tener al menos 6 caracteres",
      "any.required": "La contraseña es obligatoria",
    }),
});

export function validateLogin(data) {
  const { error } = loginSchema.validate(data, {
    abortEarly: false,
  });

  if (!error) return [];

  return error.details.map((detail) => detail.message);
}