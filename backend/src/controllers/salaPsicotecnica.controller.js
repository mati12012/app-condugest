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
} from "../validations/salaPsicotecnica.validation.js";

export async function getSalasController(req, res) {
  try {
    const salas = await getAllSalas();

    return res.status(200).json({
      message: "Salas psicotécnicas obtenidas exitosamente",
      data: salas,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener salas psicotécnicas",
      errorDetails: error.message,
      status: "Server error",
    });
  }
}

export async function getSalaController(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        message: "El ID de la sala debe ser numérico",
        status: "Client error",
      });
    }

    const sala = await getSalaById(id);

    if (!sala) {
      return res.status(404).json({
        message: "Sala psicotécnica no encontrada",
        status: "Client error",
      });
    }

    return res.status(200).json({
      message: "Sala psicotécnica obtenida exitosamente",
      data: sala,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener sala psicotécnica",
      errorDetails: error.message,
      status: "Server error",
    });
  }
}

export async function createSalaController(req, res) {
  try {
    const salaData = req.body;

    const validationErrors = validateSalaCreate(salaData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Datos de sala psicotécnica inválidos",
        errorDetails: validationErrors,
        status: "Client error",
      });
    }

    const nuevaSala = await createSala(salaData);

    return res.status(201).json({
      message: "Sala psicotécnica creada exitosamente",
      data: nuevaSala,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear sala psicotécnica",
      errorDetails: error.message,
      status: "Server error",
    });
  }
}

export async function updateSalaController(req, res) {
  try {
    const { id } = req.params;
    const salaData = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        message: "El ID de la sala debe ser numérico",
        status: "Client error",
      });
    }

    const validationErrors = validateSalaUpdate(salaData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Datos de sala psicotécnica inválidos",
        errorDetails: validationErrors,
        status: "Client error",
      });
    }

    const salaActualizada = await updateSala(id, salaData);

    if (!salaActualizada) {
      return res.status(404).json({
        message: "Sala psicotécnica no encontrada",
        status: "Client error",
      });
    }

    return res.status(200).json({
      message: "Sala psicotécnica actualizada exitosamente",
      data: salaActualizada,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar sala psicotécnica",
      errorDetails: error.message,
      status: "Server error",
    });
  }
}

export async function deleteSalaController(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        message: "El ID de la sala debe ser numérico",
        status: "Client error",
      });
    }

    const salaEliminada = await deleteSala(id);

    if (!salaEliminada) {
      return res.status(404).json({
        message: "Sala psicotécnica no encontrada",
        status: "Client error",
      });
    }

    return res.status(200).json({
      message: "Sala psicotécnica eliminada exitosamente",
      data: salaEliminada,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar sala psicotécnica",
      errorDetails: error.message,
      status: "Server error",
    });
  }
}