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
        .max(100)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            "string.base": "El nombre del alumno debe ser una cadena de texto",
            "string.min": "El nombre del alumno debe tener al menos 2 caracteres",
            "string.max": "El nombre del alumno no puede exceder los 100 caracteres",
            "string.pattern.base": "El nombre del alumno solo puede contener letras y espacios",
            "any.required": "El nombre del alumno es obligatorio"
        }),
    rut: Joi.string()
        .pattern(/^[0-9]+[-|‐]{1}[0-9kK]{1}$/)
        .required()
        .messages({
            "string.base": "El RUT del alumno debe ser una cadena de texto",
            "string.pattern.base": "El RUT del alumno solo puede contener numeros y guiones",
            "any.required": "El RUT del alumno es obligatorio"
        }),
    correo: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            "string.base": "El correo del alumno debe ser una cadena de texto",
            "string.email": "El correo del alumno debe ser un correo valido",
            "string.max": "El correo del alumno no puede exceder los 100 caracteres",
            "any.required": "El correo del alumno es obligatorio"
        }),
    licencia: Joi.string()
        .max(20)
        .required()
        .messages({
            "string.base": "La licencia del alumno debe ser una cadena de texto",
            "string.max": "La licencia del alumno no puede exceder los 20 caracteres",
            "any.required": "La licencia del alumno es obligatoria"
        }),
    sede: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.base": "La sede del alumno debe ser una cadena de texto",
            "string.max": "La sede del alumno no puede exceder los 50 caracteres",
            "any.required": "La sede del alumno es obligatoria"
        }),
    clases_completadas: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "Las clases completadas del alumno deben ser un número",
            "number.min": "Las clases completadas del alumno no pueden ser negativas",
            "any.required": "Las clases completadas del alumno son obligatorias"
        }),
    total_clases: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "El total de clases del alumno deben ser un número",
            "number.min": "El total de clases del alumno no pueden ser negativas",
            "any.required": "El total de clases del alumno es obligatorio"
        }),
    estado: Joi.string()
        .max(50)
        .required()
        .messages({
            "string.base": "El estado del alumno debe ser una cadena de texto",
            "string.max": "El estado del alumno no puede exceder los 50 caracteres",
            "any.required": "El estado del alumno es obligatorio"
        })
});

export function validateAlumnoData(data) {
    const { error } = alumnoBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((err) => err.message);
    }
    return [];
};
