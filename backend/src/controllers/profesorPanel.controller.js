"use strict";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

import {
  getProfesorIdDesdeUsuario,
  getClasesPracticasPorProfesor,
} from "../services/profesorPanel.services.js";

export async function getMisClasesProfesorController(req, res) {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return handleErrorClient(
        res,
        401,
        "No se pudo identificar al usuario autenticado"
      );
    }

    const idProfesor = await getProfesorIdDesdeUsuario(idUsuario);

    if (!idProfesor) {
      return handleErrorClient(
        res,
        404,
        "No se encontró un profesor asociado a este usuario"
      );
    }

    const clases = await getClasesPracticasPorProfesor(idProfesor);

    return handleSuccess(
      res,
      200,
      "Clases del profesor obtenidas exitosamente",
      {
        id_profesor: idProfesor,
        clases_practicas: clases,
      }
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener las clases del profesor",
      error.message
    );
  }
}