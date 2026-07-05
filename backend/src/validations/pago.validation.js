import Joi from "joi";

const metodosPagoPermitidos = [
  "Efectivo",
  "Transferencia",
  "Débito",
  "Crédito",
  "Otro",
];

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

const pagoCreateSchema = Joi.object({
  id_matricula: Joi.number().integer().positive().required().messages({
    "number.base": "La matricula es obligatoria",
    "number.integer": "La matricula debe ser un numero entero",
    "number.positive": "La matricula debe ser positiva",
    "any.required": "La matricula es obligatoria",
  }),

  monto: Joi.number().integer().positive().required().messages({
    "number.base": "El monto es obligatorio",
    "number.integer": "El monto debe ser un numero entero",
    "number.positive": "El monto debe ser mayor a 0",
    "any.required": "El monto es obligatorio",
  }),

  metodo_pago: Joi.string()
    .trim()
    .valid(...metodosPagoPermitidos)
    .required()
    .messages({
      "any.only": "El metodo de pago debe ser: Efectivo, Transferencia, Debito, Credito u Otro",
      "string.empty": "El metodo de pago es obligatorio",
      "any.required": "El metodo de pago es obligatorio",
    }),

  fecha_pago: Joi.date().optional().messages({
    "date.base": "La fecha de pago debe ser una fecha valida",
  }),

  estado: Joi.string()
    .trim()
    .valid("Registrado")
    .default("Registrado")
    .messages({
      "any.only": "El estado inicial del pago debe ser Registrado",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 500 caracteres",
  }),
});

const pagoUpdateSchema = Joi.object({
  estado: Joi.string()
    .trim()
    .valid("Anulado")
    .required()
    .messages({
      "any.only": "El estado solo puede cambiarse a Anulado",
      "string.empty": "El estado es obligatorio",
      "any.required": "El estado es obligatorio",
    }),

  observacion: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "La observacion no puede superar los 500 caracteres",
  }),
});

const pagoIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un numero",
    "number.integer": "El ID debe ser un numero entero",
    "number.positive": "El ID debe ser positivo",
    "any.required": "El ID es obligatorio",
  }),
});

const pagoMatriculaParamSchema = Joi.object({
  id_matricula: Joi.number().integer().positive().required().messages({
    "number.base": "El ID de la matricula debe ser un numero",
    "number.integer": "El ID de la matricula debe ser un numero entero",
    "number.positive": "El ID de la matricula debe ser positivo",
    "any.required": "El ID de la matricula es obligatorio",
  }),
});

export function validatePagoCreate(data) {
  const { error, value } = pagoCreateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validatePagoUpdate(data) {
  const { error, value } = pagoUpdateSchema.validate(data, {
    abortEarly: false,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validatePagoIdParam(params) {
  const { error } = pagoIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}

export function validatePagoMatriculaParam(params) {
  const { error } = pagoMatriculaParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
