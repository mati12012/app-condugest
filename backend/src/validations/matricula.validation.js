import Joi from "joi";

const estadosPermitidos = [
  "Activa",
  "Finalizada",
  "Suspendida",
  "Anulada",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const matriculaCreateSchema = Joi.object({
  id_alumno: Joi.number().integer().positive().required().messages({
    "number.base": "El alumno es obligatorio",
    "number.integer": "El alumno debe ser un numero entero",
    "number.positive": "El alumno debe ser positivo",
    "any.required": "El alumno es obligatorio",
  }),

  id_plan: Joi.number().integer().positive().required().messages({
    "number.base": "El plan es obligatorio",
    "number.integer": "El plan debe ser un numero entero",
    "number.positive": "El plan debe ser positivo",
    "any.required": "El plan es obligatorio",
  }),
});

const matriculaUpdateSchema = Joi.object({
  estado: Joi.string()
    .trim()
    .valid(...estadosPermitidos)
    .required()
    .messages({
      "any.only": "El estado debe ser: Activa, Finalizada, Suspendida o Anulada",
      "string.empty": "El estado es obligatorio",
      "any.required": "El estado es obligatorio",
    }),
});

const matriculaIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

const matriculaAlumnoParamSchema = Joi.object({
  id_alumno: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del alumno debe ser un numero",
    "number.integer": "El ID del alumno debe ser un numero entero",
    "number.positive": "El ID del alumno debe ser positivo",
    "any.required": "El ID del alumno es obligatorio",
  }),
});

const matriculaResumenParamSchema = Joi.object({
  id_matricula: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la matricula debe ser un numero",
    "number.integer": "El ID de la matricula debe ser un numero entero",
    "number.positive": "El ID de la matricula debe ser positivo",
    "any.required": "El ID de la matricula es obligatorio",
  }),
});

export function validateMatriculaCreate(data) {
  const { error, value } = matriculaCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateMatriculaUpdate(data) {
  const { error, value } = matriculaUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateMatriculaIdParam(params) {
  const { error } = matriculaIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateMatriculaAlumnoParam(params) {
  const { error } = matriculaAlumnoParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validateMatriculaResumenParam(params) {
  const { error } = matriculaResumenParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
