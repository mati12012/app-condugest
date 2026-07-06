"use strict";

import {
  createSalaTeorica,
  deleteSalaTeorica,
  getAllSalasTeoricas,
  getSalaTeoricaById,
  updateSalaTeorica,
} from "../services/salaTeorica.services.js";

import {
  validateSalaTeoricaCreate,
  validateSalaTeoricaIdParam,
  validateSalaTeoricaUpdate,
} from "../validations/salaTeorica.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

import { normalizarTexto } from "../validations/common.validation.js";

function limpiarSalaTeoricaData(data, esCreacion = false) {
  const datosLimpios = { ...data };

  if ("nombre" in datosLimpios) {
    datosLimpios.nombre = normalizarTexto(datosLimpios.nombre);
  }

  if ("sede" in datosLimpios) {
    datosLimpios.sede = normalizarTexto(datosLimpios.sede);
  }

  if ("observacion" in datosLimpios) {
    const observacion = normalizarTexto(datosLimpios.observacion);
    datosLimpios.observacion = observacion || null;
  }

  if ("capacidad" in datosLimpios && datosLimpios.capacidad !== "") {
    datosLimpios.capacidad = Number(datosLimpios.capacidad);
  }

  if ("estado" in datosLimpios) {
    datosLimpios.estado = normalizarTexto(datosLimpios.estado);
  }

  if (esCreacion && !datosLimpios.estado) {
    datosLimpios.estado = "Activa";
  }

  return datosLimpios;
}

export async function getSalasTeoricasController(req, res) {
  try {
    const salas = await getAllSalasTeoricas();

    return handleSuccess(
      res,
      200,
      "Salas teoricas obtenidas exitosamente",
      salas
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener salas teoricas",
      error.message
    );
  }
}

export async function getSalaTeoricaController(req, res) {
  try {
    const paramErrors = validateSalaTeoricaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const sala = await getSalaTeoricaById(req.params.id);

    if (!sala) {
      return handleErrorClient(res, 404, "Sala teorica no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Sala teorica obtenida exitosamente",
      sala
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener sala teorica",
      error.message
    );
  }
}

export async function createSalaTeoricaController(req, res) {
  try {
    const salaData = limpiarSalaTeoricaData(req.body, true);
    const validationErrors = validateSalaTeoricaCreate(salaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de sala teorica invalidos",
        validationErrors
      );
    }

    const nuevaSala = await createSalaTeorica(salaData);

    return handleSuccess(
      res,
      201,
      "Sala teorica creada exitosamente",
      nuevaSala
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear sala teorica",
      error.message
    );
  }
}

export async function updateSalaTeoricaController(req, res) {
  try {
    const paramErrors = validateSalaTeoricaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const salaData = limpiarSalaTeoricaData(req.body);
    const validationErrors = validateSalaTeoricaUpdate(salaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de sala teorica invalidos",
        validationErrors
      );
    }

    const salaActualizada = await updateSalaTeorica(req.params.id, salaData);

    if (!salaActualizada) {
      return handleErrorClient(res, 404, "Sala teorica no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Sala teorica actualizada exitosamente",
      salaActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar sala teorica",
      error.message
    );
  }
}

export async function deleteSalaTeoricaController(req, res) {
  try {
    const paramErrors = validateSalaTeoricaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const salaEliminada = await deleteSalaTeorica(req.params.id);

    if (!salaEliminada) {
      return handleErrorClient(res, 404, "Sala teorica no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Sala teorica eliminada exitosamente",
      salaEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar sala teorica",
      error.message
    );
  }
}
