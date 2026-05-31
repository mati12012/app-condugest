"use strict";
import Joi from "joi";

export const alumnoQueryValidation = Joi.object({
    id_alumno: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del alumno debe ser un número",
            "number.positive": "El ID del alumno debe ser un número positivo"
        })
});

export const alumnoBodyValidation = Joi.object({
    nombre: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
            "string.empty": "El nombre es obligatorio.",
            "string.pattern.base": "El nombre solo puede contener letras y espacios."
        }),
    apellido: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
            "string.empty": "El apellido es obligatorio.",
            "string.pattern.base": "El apellido solo puede contener letras y espacios."
        }),
    rut: Joi.string()
        .pattern(/^[0-9]+-[0-9kK]{1}$/)
        .required()
        .messages({
            "string.empty": "El RUT es obligatorio.",
            "string.pattern.base": "El RUT debe tener un formato válido con guion (ej: 12345678-9)."
        }),
    licencia: Joi.string().required(),
    sede: Joi.string().required(),
    clases_completadas: Joi.number().integer().min(0).required(),
    total_clases: Joi.number().integer().min(1).required(),
    correo: Joi.string().email().required(),
    estado: Joi.string().required()
});

export function validateAlumnoData(data) {
    const { error } = alumnoBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((detail) => detail.message);
    }
    return [];
};
