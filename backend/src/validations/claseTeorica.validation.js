"use strict";
import Joi from "joi";

export const claseTeoricaBodyValidation = Joi.object({
    tema: Joi.string().min(3).max(150).required().messages({
        "string.empty": "El tema de la clase es obligatorio.",
        "string.min": "El tema debe tener al menos 3 caracteres."
    }),
    fecha: Joi.date().iso().required().messages({
        "date.base": "Debe ingresar una fecha válida.",
        "any.required": "La fecha es obligatoria."
    }),
    hora_inicio: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        "string.pattern.base": "La hora de inicio debe tener el formato HH:MM (ej: 09:30)."
    }),
    hora_fin: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        "string.pattern.base": "La hora de fin debe tener el formato HH:MM (ej: 11:00)."
    }),
    id_profesor: Joi.number().integer().positive().required().messages({
        "number.base": "Debe asignar un profesor válido a la clase."
    }),
    estado: Joi.string().valid("Programada", "Realizada", "Cancelada").required()
});

export function validateClaseTeoricaData(data) {
    const { error } = claseTeoricaBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((detail) => detail.message);
    }
    return [];
}