import Joi from "joi";

export const nivelesEvaluacionPractica = [
  "Logrado",
  "En proceso",
  "No logrado",
  "No evaluado",
];

const camposEvaluacion = [
  "nivel_general",
  "manejo_vehiculo",
  "normas_transito",
  "seguridad",
  "estacionamiento",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

function campoNivel(nombreCampo) {
  return Joi.string()
    .trim()
    .valid(...nivelesEvaluacionPractica)
    .required()
    .messages({
      "any.only": `${nombreCampo} debe ser: Logrado, En proceso, No logrado o No evaluado`,
      "string.empty": `${nombreCampo} es obligatorio`,
      "any.required": `${nombreCampo} es obligatorio`,
    });
}

function campoNivelOpcional(nombreCampo) {
  return Joi.string()
    .trim()
    .valid(...nivelesEvaluacionPractica)
    .optional()
    .messages({
      "any.only": `${nombreCampo} debe ser: Logrado, En proceso, No logrado o No evaluado`,
      "string.empty": `${nombreCampo} no puede estar vacio`,
    });
}

const evaluacionCreateSchema = Joi.object({
  id_clase_practica: Joi.number().integer().positive().required().messages({
    "number.base": "La clase practica es obligatoria",
    "number.integer": "La clase practica debe ser un numero entero",
    "number.positive": "La clase practica debe ser positiva",
    "any.required": "La clase practica es obligatoria",
  }),

  nivel_general: campoNivel("nivel_general"),
  manejo_vehiculo: campoNivel("manejo_vehiculo"),
  normas_transito: campoNivel("normas_transito"),
  seguridad: campoNivel("seguridad"),
  estacionamiento: campoNivel("estacionamiento"),

  observacion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 1000 caracteres",
  }),

  recomendacion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La recomendacion no puede superar los 1000 caracteres",
  }),
});

const evaluacionUpdateSchema = Joi.object({
  nivel_general: campoNivelOpcional("nivel_general"),
  manejo_vehiculo: campoNivelOpcional("manejo_vehiculo"),
  normas_transito: campoNivelOpcional("normas_transito"),
  seguridad: campoNivelOpcional("seguridad"),
  estacionamiento: campoNivelOpcional("estacionamiento"),

  observacion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 1000 caracteres",
  }),

  recomendacion: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "La recomendacion no puede superar los 1000 caracteres",
  }),
})
  .min(1)
  .messages({
    "object.min": "Debe enviar al menos un campo para actualizar",
  });

const evaluacionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la evaluacion debe ser un numero",
    "number.integer": "El ID de la evaluacion debe ser un numero entero",
    "number.positive": "El ID de la evaluacion debe ser positivo",
    "any.required": "El ID de la evaluacion es obligatorio",
  }),
});

const evaluacionClaseParamSchema = Joi.object({
  id_clase_practica: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la clase practica debe ser un numero",
    "number.integer": "El ID de la clase practica debe ser un numero entero",
    "number.positive": "El ID de la clase practica debe ser positivo",
    "any.required": "El ID de la clase practica es obligatorio",
  }),
});

function limpiarValorTexto(valor) {
  if (typeof valor !== "string") {
    return valor;
  }

  const limpio = valor.trim();

  return limpio === "" ? null : limpio;
}

export function limpiarDatosEvaluacionPractica(data) {
  const limpio = {};

  if (data.id_clase_practica !== undefined && data.id_clase_practica !== "") {
    limpio.id_clase_practica = Number(data.id_clase_practica);
  }

  camposEvaluacion.forEach((campo) => {
    if (data[campo] !== undefined) {
      limpio[campo] = limpiarValorTexto(data[campo]);
    }
  });

  ["observacion", "recomendacion"].forEach((campo) => {
    if (data[campo] !== undefined) {
      limpio[campo] = limpiarValorTexto(data[campo]);
    }
  });

  return limpio;
}

export function validateEvaluacionPracticaCreate(data) {
  const { error, value } = evaluacionCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateEvaluacionPracticaUpdate(data) {
  const { error, value } = evaluacionUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateEvaluacionPracticaIdParam(params) {
  const { error } = evaluacionIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateEvaluacionPracticaClaseParam(params) {
  const { error } = evaluacionClaseParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
