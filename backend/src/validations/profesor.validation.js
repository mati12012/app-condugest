import Joi from "joi";

import {
  validarEmail,
  validarNombrePersona,
  validarRutBasico,
  validarTelefonoChile,
} from "./common.validation.js";

const licenciasPermitidas = ["B", "C", "A2", "A3", "A4", "A5", "D"];

const especialidadesPermitidas = [
  "Clases practicas",
  "Clases prácticas",
  "Clases teoricas",
  "Clases teóricas",
  "Evaluacion psicotecnica",
  "Evaluación psicotécnica",
  "Mixto",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

function validarNombreJoi(campo) {
  return (value, helpers) => {
    const resultado = validarNombrePersona(value, campo, true);

    if (!resultado.valido) {
      return helpers.message(resultado.mensaje);
    }

    return resultado.valor;
  };
}

function validarRutJoi(value, helpers) {
  const resultado = validarRutBasico(value, true);

  if (!resultado.valido) {
    return helpers.message(resultado.mensaje);
  }

  return resultado.valor;
}

function validarCorreoOpcionalJoi(value, helpers) {
  const resultado = validarEmail(value, false, "correo personal");

  if (!resultado.valido) {
    return helpers.message(resultado.mensaje);
  }

  return resultado.valor || null;
}

function validarTelefonoOpcionalJoi(value, helpers) {
  const resultado = validarTelefonoChile(value, false);

  if (!resultado.valido) {
    return helpers.message(resultado.mensaje);
  }

  return resultado.valor || null;
}

const profesorCreateSchema = Joi.object({
  rut: Joi.string().custom(validarRutJoi).required().messages({
    "string.empty": "El RUT es obligatorio.",
    "any.required": "El RUT es obligatorio.",
  }),

  nombre: Joi.string().custom(validarNombreJoi("nombre")).required().messages({
    "string.empty": "El nombre es obligatorio.",
    "any.required": "El nombre es obligatorio.",
  }),

  apellido: Joi.string()
    .custom(validarNombreJoi("apellido"))
    .required()
    .messages({
      "string.empty": "El apellido es obligatorio.",
      "any.required": "El apellido es obligatorio.",
    }),

  correo_personal: Joi.any()
    .custom(validarCorreoOpcionalJoi)
    .allow("", null)
    .optional(),

  telefono: Joi.any()
    .custom(validarTelefonoOpcionalJoi)
    .allow("", null)
    .optional(),

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
        "La especialidad debe ser: Clases practicas, Clases teoricas, Evaluacion psicotecnica o Mixto",
      "string.empty": "La especialidad es obligatoria",
      "any.required": "La especialidad es obligatoria",
    }),

  estado: Joi.boolean().optional(),
});

const profesorUpdateSchema = Joi.object({
  rut: Joi.string().custom(validarRutJoi).optional().messages({
    "string.empty": "El RUT no puede estar vacio.",
  }),

  nombre: Joi.string().custom(validarNombreJoi("nombre")).optional().messages({
    "string.empty": "El nombre no puede estar vacio.",
  }),

  apellido: Joi.string()
    .custom(validarNombreJoi("apellido"))
    .optional()
    .messages({
      "string.empty": "El apellido no puede estar vacio.",
    }),

  correo_personal: Joi.any()
    .custom(validarCorreoOpcionalJoi)
    .allow("", null)
    .optional(),

  telefono: Joi.any()
    .custom(validarTelefonoOpcionalJoi)
    .allow("", null)
    .optional(),

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
        "La especialidad debe ser: Clases practicas, Clases teoricas, Evaluacion psicotecnica o Mixto",
    }),

  estado: Joi.boolean().optional(),
}).min(1).messages({
  "object.min": "Debe enviar al menos un campo para actualizar",
});

const profesorIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
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
