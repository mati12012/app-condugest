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
  getClaseTeoricaProfesorById,
  getAsistenciaTeoricaProfesorById,
  registrarAsistenciaTeorica,
} from "../services/profesorPanel.services.js";

import { obtenerInscritos } from "../services/claseTeorica.services.js";

const ESTADOS_ASISTENCIA_PERMITIDOS = [
  "Presente",
  "Ausente",
  "Justificado",
  "Pendiente",
];

async function obtenerProfesorAutenticado(req, res) {
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    handleErrorClient(
      res,
      401,
      "No se pudo identificar al usuario autenticado"
    );
    return null;
  }

  const idProfesor = await getProfesorIdDesdeUsuario(idUsuario);

  if (!idProfesor) {
    handleErrorClient(
      res,
      404,
      "No se encontro un profesor asociado a este usuario"
    );
    return null;
  }

  return idProfesor;
}

export async function getMisClasesProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

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
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clases = await getClasesTeoricasPorProfesor(idProfesor);

    return handleSuccess(res, 200, "Clases teoricas", clases);
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function getDetalleClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const claseProfesor = await getClaseTeoricaProfesorById(
      req.params.idClase,
      idProfesor
    );

    if (!claseProfesor) {
      return handleErrorClient(res, 404, "Clase teorica no encontrada");
    }

    if (!claseProfesor.perteneceProfesor) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para ver alumnos de esta clase teorica"
      );
    }

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

    if (!ESTADOS_ASISTENCIA_PERMITIDOS.includes(estado)) {
      return handleErrorClient(res, 400, "Estado de asistencia invalido");
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const asistenciaProfesor = await getAsistenciaTeoricaProfesorById(
      idAsistencia,
      idProfesor
    );

    if (!asistenciaProfesor) {
      return handleErrorClient(res, 404, "Asistencia teorica no encontrada");
    }

    if (!asistenciaProfesor.perteneceProfesor) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para marcar esta asistencia teorica"
      );
    }

    const asistenciaActualizada = await registrarAsistenciaTeorica(
      idAsistencia,
      estado
    );

    return handleSuccess(
      res,
      200,
      "Asistencia registrada exitosamente",
      asistenciaActualizada
    );
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}
