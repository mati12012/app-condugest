import {
  createReserva,
  getAllReservas,
  getReservaById,
  updateReserva,
  deleteReserva,
  buscarChoqueHorario,
} from "../services/reservaSala.services.js";

import {
  getSalaById,
} from "../services/salaPsicotecnica.services.js";

import {
  validateReservaCreate,
  validateReservaUpdate,
  validateReservaIdParam,
  validateDisponibilidadQuery,
  horaFinEsMayor,
} from "../validations/reservaSala.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getReservasController(req, res) {
  try {
    const reservas = await getAllReservas();

    return handleSuccess(
      res,
      200,
      "Reservas de salas obtenidas exitosamente",
      reservas
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener reservas de salas",
      error.message
    );
  }
}

export async function getReservaController(req, res) {
  try {
    const paramErrors = validateReservaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const { id } = req.params;

    const reserva = await getReservaById(id);

    if (!reserva) {
      return handleErrorClient(
        res,
        404,
        "Reserva de sala no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Reserva de sala obtenida exitosamente",
      reserva
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener reserva de sala",
      error.message
    );
  }
}

export async function createReservaController(req, res) {
  try {
    const reservaData = req.body;

    const validationErrors = validateReservaCreate(reservaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de reserva inválidos",
        validationErrors
      );
    }

    const sala = await getSalaById(reservaData.id_sala);

    if (!sala) {
      return handleErrorClient(
        res,
        404,
        "La sala psicotécnica no existe"
      );
    }

    if (!sala.estado) {
      return handleErrorClient(
        res,
        400,
        "La sala psicotécnica se encuentra inactiva"
      );
    }

    if (Number(reservaData.cantidad_alumnos) > Number(sala.capacidad)) {
      return handleErrorClient(
        res,
        400,
        "La cantidad de alumnos supera la capacidad de la sala",
        {
          capacidad_sala: sala.capacidad,
          cantidad_solicitada: reservaData.cantidad_alumnos,
        }
      );
    }

    const choqueHorario = await buscarChoqueHorario({
      id_sala: reservaData.id_sala,
      fecha: reservaData.fecha,
      hora_inicio: reservaData.hora_inicio,
      hora_fin: reservaData.hora_fin,
    });

    if (choqueHorario) {
      return handleErrorClient(
        res,
        409,
        "La sala ya se encuentra reservada en ese horario",
        choqueHorario
      );
    }

    const nuevaReserva = await createReserva(reservaData);

    return handleSuccess(
      res,
      201,
      "Reserva de sala creada exitosamente",
      nuevaReserva
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear reserva de sala",
      error.message
    );
  }
}

export async function updateReservaController(req, res) {
  try {
    const paramErrors = validateReservaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const reservaData = req.body;

    const validationErrors = validateReservaUpdate(reservaData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de reserva inválidos",
        validationErrors
      );
    }

    const { id } = req.params;

    const reservaExistente = await getReservaById(id);

    if (!reservaExistente) {
      return handleErrorClient(
        res,
        404,
        "Reserva de sala no encontrada"
      );
    }

    const reservaFinal = {
      ...reservaExistente,
      ...reservaData,
    };

    if (!horaFinEsMayor(reservaFinal.hora_inicio, reservaFinal.hora_fin)) {
      return handleErrorClient(
        res,
        400,
        "La hora de término debe ser mayor que la hora de inicio"
      );
    }

    const sala = await getSalaById(reservaFinal.id_sala);

    if (!sala) {
      return handleErrorClient(
        res,
        404,
        "La sala psicotécnica no existe"
      );
    }

    if (!sala.estado) {
      return handleErrorClient(
        res,
        400,
        "La sala psicotécnica se encuentra inactiva"
      );
    }

    if (Number(reservaFinal.cantidad_alumnos) > Number(sala.capacidad)) {
      return handleErrorClient(
        res,
        400,
        "La cantidad de alumnos supera la capacidad de la sala",
        {
          capacidad_sala: sala.capacidad,
          cantidad_solicitada: reservaFinal.cantidad_alumnos,
        }
      );
    }

    if (reservaFinal.estado !== "cancelada") {
      const choqueHorario = await buscarChoqueHorario({
        id_sala: reservaFinal.id_sala,
        fecha: reservaFinal.fecha,
        hora_inicio: reservaFinal.hora_inicio,
        hora_fin: reservaFinal.hora_fin,
        id_reserva_excluida: id,
      });

      if (choqueHorario) {
        return handleErrorClient(
          res,
          409,
          "La sala ya se encuentra reservada en ese horario",
          choqueHorario
        );
      }
    }

    const reservaActualizada = await updateReserva(id, reservaData);

    return handleSuccess(
      res,
      200,
      "Reserva de sala actualizada exitosamente",
      reservaActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar reserva de sala",
      error.message
    );
  }
}

export async function deleteReservaController(req, res) {
  try {
    const paramErrors = validateReservaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const { id } = req.params;

    const reservaEliminada = await deleteReserva(id);

    if (!reservaEliminada) {
      return handleErrorClient(
        res,
        404,
        "Reserva de sala no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Reserva de sala eliminada exitosamente",
      reservaEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar reserva de sala",
      error.message
    );
  }
}

export async function consultarDisponibilidadController(req, res) {
  try {
    const queryErrors = validateDisponibilidadQuery(req.query);

    if (queryErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros de consulta inválidos",
        queryErrors
      );
    }

    const { id_sala, fecha, hora_inicio, hora_fin } = req.query;

    const sala = await getSalaById(id_sala);

    if (!sala) {
      return handleErrorClient(
        res,
        404,
        "La sala psicotécnica no existe"
      );
    }

    if (!sala.estado) {
      return handleErrorClient(
        res,
        400,
        "La sala psicotécnica se encuentra inactiva"
      );
    }

    const choqueHorario = await buscarChoqueHorario({
      id_sala,
      fecha,
      hora_inicio,
      hora_fin,
    });

    const disponible = !choqueHorario;

    return handleSuccess(
      res,
      200,
      disponible
        ? "La sala está disponible en ese horario"
        : "La sala no está disponible en ese horario",
      {
        disponible,
        conflicto: choqueHorario,
      }
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al consultar disponibilidad de sala",
      error.message
    );
  }
}