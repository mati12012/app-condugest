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
    sede: Joi.string().required().messages({
        "string.empty": "La sede o modalidad es obligatoria."
    }),
    id_profesor: Joi.number().integer().positive().required().messages({
        "number.base": "Debe asignar un profesor válido a la clase."
    }),
    estado: Joi.string().valid("Programada", "Realizada", "Cancelada").required()
});

// Función para validar que la hora de fin sea mayor que la hora de inicio
export function horaFinEsMayor(horaInicio, horaFin) {
    const inicioLimpio = String(horaInicio).slice(0, 5);
    const finLimpio = String(horaFin).slice(0, 5);
    
    const inicio = new Date(`1970-01-01T${inicioLimpio}:00`);
    const fin = new Date(`1970-01-01T${finLimpio}:00`);
    return fin > inicio;
}

export function validateClaseTeoricaData(data) {
    const { error } = claseTeoricaBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((detail) => detail.message);
    }
    return [];
}