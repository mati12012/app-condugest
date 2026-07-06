import Joi from "joi";

export const TIPOS_VEHICULO_EXAMEN = ["Automatico", "Mecanico"];
export const ESTADOS_SOLICITUD_EXAMEN = [
  "Pendiente",
  "Aprobada",
  "Rechazada",
  "Gestionada",
  "Cancelada",
];
export const RESULTADOS_EXAMEN = [
  "Pendiente",
  "Aprobado",
  "Reprobado",
  "No presentado",
];

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

function formatValidationErrors(error) {
  if (!error) return [];

  return error.details.map((detail) => detail.message);
}

function normalizarTipoVehiculo(valor) {
  if (valor === "Automático") return "Automatico";
  if (valor === "Mecánico") return "Mecanico";

  return valor;
}

function mostrarTipoVehiculo(valor) {
  if (valor === "Automatico") return "Automático";
  if (valor === "Mecanico") return "Mecánico";

  return valor;
}

const solicitudExamenCreateSchema = Joi.object({
  tipo_vehiculo: Joi.string()
    .trim()
    .custom((value, helpers) => {
      const normalizado = normalizarTipoVehiculo(value);

      if (TIPOS_VEHICULO_EXAMEN.includes(normalizado)) {
        return normalizado;
      }

      return helpers.error("any.only");
    })
    .required()
    .messages({
      "any.only": "El tipo de vehiculo debe ser Automatico o Mecanico",
      "string.empty": "El tipo de vehiculo es obligatorio",
      "any.required": "El tipo de vehiculo es obligatorio",
    }),

  fecha_solicitada: Joi.string().pattern(fechaRegex).required().messages({
    "string.pattern.base": "La fecha solicitada debe tener formato YYYY-MM-DD",
    "string.empty": "La fecha solicitada es obligatoria",
    "any.required": "La fecha solicitada es obligatoria",
  }),

  mensaje: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "El mensaje no puede superar los 1000 caracteres",
  }),
});

const solicitudExamenUpdateSchema = Joi.object({
  estado: Joi.string()
    .trim()
    .valid(...ESTADOS_SOLICITUD_EXAMEN)
    .optional()
    .messages({
      "any.only":
        "El estado debe ser Pendiente, Aprobada, Rechazada, Gestionada o Cancelada",
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

  resultado_examen: Joi.string()
    .trim()
    .valid(...RESULTADOS_EXAMEN)
    .optional()
    .messages({
      "any.only":
        "El resultado debe ser Pendiente, Aprobado, Reprobado o No presentado",
      "string.empty": "El resultado no puede estar vacio",
    }),
})
  .min(1)
  .messages({
    "object.min": "Debe enviar al menos un campo para actualizar",
  });

const solicitudExamenIdParamSchema = Joi.object({
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

export function limpiarDatosSolicitudExamen(data) {
  const limpio = {};

  ["tipo_vehiculo", "fecha_solicitada", "mensaje"].forEach((campo) => {
    if (data[campo] !== undefined) {
      limpio[campo] = limpiarTexto(data[campo]);
    }
  });

  ["estado", "respuesta_secretaria", "resultado_examen"].forEach((campo) => {
    if (data[campo] !== undefined) {
      limpio[campo] = limpiarTexto(data[campo]);
    }
  });

  return limpio;
}

export function normalizarSolicitudExamenParaRespuesta(solicitud) {
  if (!solicitud) return solicitud;

  return {
    ...solicitud,
    tipo_vehiculo: mostrarTipoVehiculo(solicitud.tipo_vehiculo),
  };
}

export function normalizarSolicitudesExamenParaRespuesta(solicitudes) {
  return solicitudes.map((solicitud) =>
    normalizarSolicitudExamenParaRespuesta(solicitud)
  );
}

export function validateSolicitudExamenCreate(data) {
  const { error, value } = solicitudExamenCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateSolicitudExamenUpdate(data) {
  const { error, value } = solicitudExamenUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return {
    errors: formatValidationErrors(error),
    value,
  };
}

export function validateSolicitudExamenIdParam(params) {
  const { error } = solicitudExamenIdParamSchema.validate(params, {
    abortEarly: false,
  });

  return formatValidationErrors(error);
}
