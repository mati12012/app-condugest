"use strict";
import Joi from "joi";

import {
    convertirHoraAMinutos,
    validarHorarioAtencion,
} from "./common.validation.js";

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

// Funcion para las reglas de horario
export function validarReglasHorario(horaInicio, horaFin) {
    const horarioAtencion = validarHorarioAtencion(horaInicio, horaFin);

    if (!horarioAtencion.valido) {
        return horarioAtencion;
    }

    const minutosInicio = convertirHoraAMinutos(horaInicio);
    const minutosFin = convertirHoraAMinutos(horaFin);

    // Regla 2: Duración mínima y máxima
    const duracion = minutosFin - minutosInicio;

    // Mínimo 45 minutos
    if (duracion < 45) { 
        return { valido: false, mensaje: "Para cumplir la normativa, la clase debe durar al menos 45 minutos." };
    }

    // Máximo 3 horas 
    if (duracion > 180) { 
        return { valido: false, mensaje: "Una clase no puede durar más de 3 horas." };
    }

    return { valido: true };
}

export function validateClaseTeoricaData(data) {
    const { error } = claseTeoricaBodyValidation.validate(data, { abortEarly: false });
    if (error) {
        return error.details.map((detail) => detail.message);
    }
    return [];
}
