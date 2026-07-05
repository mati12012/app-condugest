"use strict";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

import {
  getProfesorIdDesdeUsuario,
  getClasesPracticasPorProfesor,
  getClasesTeoricasPorProfesor,
  registrarAsistenciaTeorica,
} from "../services/profesorPanel.services.js";

import { obtenerInscritos } from "../services/claseTeorica.services.js";

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

export async function getMisClasesTeoricasController(req, res) {
    try {
        const idProfesor = await getProfesorIdDesdeUsuario(req.usuario?.id_usuario);
        const clases = await getClasesTeoricasPorProfesor(idProfesor);
        return handleSuccess(res, 200, "Clases teóricas", clases);
    } catch (error) {
        return handleErrorServer(res, 500, "Error", error.message);
    }
}

export async function getDetalleClaseTeoricaProfesorController(req, res) {
    try {
        const inscritos = await obtenerInscritos(req.params.idClase);
        return handleSuccess(res, 200, "Alumnos de la clase", inscritos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error", error.message);
    }
}

export async function marcarAsistenciaTeoricaController(req, res) {
    try {
        const { idAsistencia } = req.params;
        const { estado } = req.body;
        await registrarAsistenciaTeorica(idAsistencia, estado);
        return handleSuccess(res, 200, "Asistencia registrada exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, "Error", error.message);
    }
}