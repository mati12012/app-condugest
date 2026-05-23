import {
  createSala,
  getAllSalas,
  getSalaById,
  updateSala,
  deleteSala,
} from "../services/salaPsicotecnica.services.js";

import {
  validateSalaCreate,
  validateSalaUpdate,
  validateSalaIdParam,
} from "../validations/salaPsicotecnica.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getSalasController(req, res) {
  try {
    const salas = await getAllSalas();

    return handleSuccess(
      res,
      200,
      "Salas psicotécnicas obtenidas exitosamente",
      salas
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener salas psicotécnicas",
      error.message
    );
  }
}

export async function getSalaController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateSalaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const sala = await getSalaById(id);

    if (!sala) {
      return handleErrorClient(
        res,
        404,
        "Sala psicotécnica no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Sala psicotécnica obtenida exitosamente",
      sala
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener sala psicotécnica",
      error.message
    );
  }
}

export async function createSalaController(req, res) {
  try {
    const salaData = req.body;

    const validationErrors = validateSalaCreate(salaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de sala psicotécnica inválidos",
        validationErrors
      );
    }

    const nuevaSala = await createSala(salaData);

    return handleSuccess(
      res,
      201,
      "Sala psicotécnica creada exitosamente",
      nuevaSala
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear sala psicotécnica",
      error.message
    );
  }
}

export async function updateSalaController(req, res) {
  try {
    const { id } = req.params;
    const salaData = req.body;

    const paramErrors = validateSalaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const validationErrors = validateSalaUpdate(salaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de sala psicotécnica inválidos",
        validationErrors
      );
    }

    const salaActualizada = await updateSala(id, salaData);

    if (!salaActualizada) {
      return handleErrorClient(
        res,
        404,
        "Sala psicotécnica no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Sala psicotécnica actualizada exitosamente",
      salaActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar sala psicotécnica",
      error.message
    );
  }
}

export async function deleteSalaController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateSalaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const salaEliminada = await deleteSala(id);

    if (!salaEliminada) {
      return handleErrorClient(
        res,
        404,
        "Sala psicotécnica no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Sala psicotécnica eliminada exitosamente",
      salaEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar sala psicotécnica",
      error.message
    );
  }
}