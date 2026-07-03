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

// Funcion para las reglas de horario
export function validarReglasHorario(horaInicio, horaFin) {
    const inicioLimpio = String(horaInicio).slice(0, 5);
    const finLimpio = String(horaFin).slice(0, 5);

    // Convierte las horas y minutos a minutos totales para facilitar la comparacion
    const [inicioHora, inicioMin] = inicioLimpio.split(':').map(Number);
    const [finHora, finMin] = finLimpio.split(':').map(Number);

    const minutosInicio = (inicioHora * 60) + inicioMin;
    const minutosFin = (finHora * 60) + finMin;

    // Regla 1: Horario comercial de la escuela
    if (minutosInicio < 8 * 60 || minutosFin > 22 * 60) {
        return { valido: false, mensaje: "Las clases solo pueden programarse entre las 08:00 y las 22:00 horas." };
    }

    // Regla 2: Hora de término mayor a hora de inicio
    if (minutosFin <= minutosInicio) {
        return { valido: false, mensaje: "La hora de término debe ser mayor a la hora de inicio." };
    }

    // Regla 3: Duración mínima y máxima
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