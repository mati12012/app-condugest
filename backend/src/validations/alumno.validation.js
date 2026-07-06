"use strict";
import Joi from "joi";

import {
    validarEmail,
    validarNombrePersona,
    validarRutBasico,
} from "./common.validation.js";

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

function validarCorreoJoi(value, helpers) {
    const resultado = validarEmail(value, true, "correo");

    if (!resultado.valido) {
        return helpers.message(resultado.mensaje);
    }

    return resultado.valor;
}

export const alumnoQueryValidation = Joi.object({
    id_alumno: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del alumno debe ser un numero",
            "number.positive": "El ID del alumno debe ser un numero positivo"
        })
});

export const alumnoBodyValidation = Joi.object({
    nombre: Joi.string()
        .custom(validarNombreJoi("nombre"))
        .required()
        .messages({
            "string.empty": "El nombre es obligatorio.",
            "any.required": "El nombre es obligatorio."
        }),
    apellido: Joi.string()
        .custom(validarNombreJoi("apellido"))
        .required()
        .messages({
            "string.empty": "El apellido es obligatorio.",
            "any.required": "El apellido es obligatorio."
        }),
    rut: Joi.string()
        .custom(validarRutJoi)
        .required()
        .messages({
            "string.empty": "El RUT es obligatorio.",
            "any.required": "El RUT es obligatorio."
        }),
    licencia: Joi.string().required(),
    sede: Joi.string().required(),
    clases_completadas: Joi.number().integer().min(0).required(),
    total_clases: Joi.number().integer().min(1).required(),
    correo: Joi.string().custom(validarCorreoJoi).required(),
    estado: Joi.string().required()
});

export function validateAlumnoData(data) {
    const { error } = alumnoBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((detail) => detail.message);
    }
    return [];
};
