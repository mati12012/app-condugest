"use strict";

import Joi from "joi";

import {
    convertirHoraAMinutos,
    validarHorarioAtencion,
} from "./common.validation.js";

export const MODALIDADES_CLASE_TEORICA = ["Presencial", "Online", "Híbrida"];

const urlValidation = Joi.string()
    .trim()
    .uri({ scheme: [/https?/] })
    .max(500)
    .allow("", null)
    .messages({
        "string.uri": "Debe ingresar un link valido que comience con http:// o https://.",
        "string.max": "El link no puede superar los 500 caracteres.",
    });

function normalizarModalidad(valor) {
    if (valor === "Hibrida") return "Híbrida";
    return valor;
}

function validarModalidadRecursos(value, helpers) {
    const modalidad = normalizarModalidad(value.modalidad);
    const idSala = value.id_sala_teorica;
    const linkReunion = typeof value.link_reunion === "string"
        ? value.link_reunion.trim()
        : value.link_reunion;

    if (modalidad === "Presencial" && !idSala) {
        return helpers.message("Las clases presenciales requieren una sala teorica.");
    }

    if (modalidad === "Online" && !linkReunion) {
        return helpers.message("Las clases online requieren el link de Meet o Zoom.");
    }

    if (modalidad === "Híbrida") {
        if (!idSala) {
            return helpers.message("Las clases hibridas requieren una sala teorica.");
        }

        if (!linkReunion) {
            return helpers.message("Las clases hibridas requieren el link de Meet o Zoom.");
        }
    }

    return {
        ...value,
        modalidad,
    };
}

export const claseTeoricaBodyValidation = Joi.object({
    tema: Joi.string().trim().min(3).max(150).required().messages({
        "string.empty": "El tema de la clase es obligatorio.",
        "string.min": "El tema debe tener al menos 3 caracteres.",
        "string.max": "El tema no puede superar los 150 caracteres.",
    }),
    fecha: Joi.date().iso().required().messages({
        "date.base": "Debe ingresar una fecha valida.",
        "any.required": "La fecha es obligatoria.",
    }),
    hora_inicio: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        "string.pattern.base": "La hora de inicio debe tener el formato HH:MM (ej: 09:30).",
        "any.required": "La hora de inicio es obligatoria.",
    }),
    hora_fin: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        "string.pattern.base": "La hora de fin debe tener el formato HH:MM (ej: 11:00).",
        "any.required": "La hora de fin es obligatoria.",
    }),
    sede: Joi.string().trim().min(2).max(50).required().messages({
        "string.empty": "La sede es obligatoria.",
        "string.min": "La sede debe tener al menos 2 caracteres.",
        "string.max": "La sede no puede superar los 50 caracteres.",
        "any.required": "La sede es obligatoria.",
    }),
    modalidad: Joi.string().valid("Presencial", "Online", "Híbrida", "Hibrida").required().messages({
        "any.only": "La modalidad debe ser Presencial, Online o Hibrida.",
        "string.empty": "La modalidad es obligatoria.",
        "any.required": "La modalidad es obligatoria.",
    }),
    id_sala_teorica: Joi.number().integer().positive().allow(null, "").optional().messages({
        "number.base": "Debe seleccionar una sala teorica valida.",
        "number.integer": "Debe seleccionar una sala teorica valida.",
        "number.positive": "Debe seleccionar una sala teorica valida.",
    }),
    link_reunion: urlValidation.optional(),
    codigo_reunion: Joi.string().trim().max(100).allow("", null).optional().messages({
        "string.max": "El codigo de reunion no puede superar los 100 caracteres.",
    }),
    url_grabacion: urlValidation.optional(),
    id_profesor: Joi.number().integer().positive().required().messages({
        "number.base": "Debe asignar un profesor valido a la clase.",
        "number.integer": "Debe asignar un profesor valido a la clase.",
        "number.positive": "Debe asignar un profesor valido a la clase.",
        "any.required": "Debe asignar un profesor a la clase.",
    }),
    estado: Joi.string().valid("Programada", "Realizada", "Cancelada").required().messages({
        "any.only": "El estado de la clase debe ser Programada, Realizada o Cancelada.",
        "any.required": "El estado de la clase es obligatorio.",
    }),
}).custom(validarModalidadRecursos, "reglas de modalidad de clase teorica");

export const recursosClaseTeoricaValidation = Joi.object({
    link_reunion: urlValidation.optional(),
    codigo_reunion: Joi.string().trim().max(100).allow("", null).optional().messages({
        "string.max": "El codigo de reunion no puede superar los 100 caracteres.",
    }),
    url_grabacion: urlValidation.optional(),
}).min(1).messages({
    "object.min": "Debe enviar al menos un recurso para actualizar.",
});

export function validarReglasHorario(horaInicio, horaFin) {
    const horarioAtencion = validarHorarioAtencion(horaInicio, horaFin);

    if (!horarioAtencion.valido) {
        return horarioAtencion;
    }

    const minutosInicio = convertirHoraAMinutos(horaInicio);
    const minutosFin = convertirHoraAMinutos(horaFin);
    const duracion = minutosFin - minutosInicio;

    if (duracion < 45) {
        return {
            valido: false,
            mensaje: "Para cumplir la normativa, la clase debe durar al menos 45 minutos.",
        };
    }

    if (duracion > 180) {
        return {
            valido: false,
            mensaje: "Una clase no puede durar mas de 3 horas.",
        };
    }

    return { valido: true };
}

export function validateClaseTeoricaData(data) {
    const { error } = claseTeoricaBodyValidation.validate(data, {
        abortEarly: false,
    });

    if (error) {
        return error.details.map((detail) => detail.message);
    }

    return [];
}

export function validateRecursosClaseTeorica(data) {
    const { error } = recursosClaseTeoricaValidation.validate(data, {
        abortEarly: false,
        allowUnknown: false,
    });

    if (error) {
        return error.details.map((detail) => detail.message);
    }

    return [];
}

export function validarRecursosPorModalidad(data) {
    const { error } = Joi.object({
        modalidad: Joi.string().valid("Presencial", "Online", "Híbrida", "Hibrida").required(),
        id_sala_teorica: Joi.number().integer().positive().allow(null, "").optional(),
        link_reunion: Joi.string().trim().allow("", null).optional(),
    })
        .custom(validarModalidadRecursos, "reglas de modalidad de clase teorica")
        .validate(data, { abortEarly: false, allowUnknown: true });

    if (error) {
        return error.details.map((detail) => detail.message);
    }

    return [];
}
