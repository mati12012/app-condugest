"use strict";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { getAlumnoIdDesdeUsuario } from "../services/alumnoPanel.services.js";
import {
  getAsistenciaPracticaPorClase,
  getHistorialAsistenciasPracticas,
  getResumenAsistenciaPracticaAlumno,
  upsertAsistenciaPractica,
} from "../services/asistenciaPractica.services.js";
import { getProfesorIdDesdeUsuario } from "../services/profesorPanel.services.js";
import {
  validateAsistenciaPracticaAlumnoParam,
  validateAsistenciaPracticaIdParam,
  validateAsistenciaPracticaProfesorParam,
  validateRegistroAsistenciaPractica,
} from "../validations/asistenciaPractica.validation.js";

function normalizarBodyAsistencia(body) {
  return {
    estado_asistencia:
      body?.estado_asistencia || body?.asistencia || body?.estado || "",
    observacion: body?.observacion,
  };
}

async function obtenerProfesorAutenticado(req, res) {
  const idProfesor = await getProfesorIdDesdeUsuario(req.usuario?.id_usuario);

  if (!idProfesor) {
    handleErrorClient(
      res,
      404,
      "No se encontro un profesor asociado al usuario autenticado"
    );
    return null;
  }

  return idProfesor;
}

async function obtenerAlumnoAutenticado(req, res) {
  const idAlumno = await getAlumnoIdDesdeUsuario(req.usuario?.id_usuario);

  if (!idAlumno) {
    handleErrorClient(
      res,
      404,
      "No se encontro un alumno asociado al usuario autenticado"
    );
    return null;
  }

  return idAlumno;
}

export async function getAsistenciasPracticasProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);
    if (!idProfesor) return;

    const asistencias = await getHistorialAsistenciasPracticas({ idProfesor });

    return handleSuccess(
      res,
      200,
      "Asistencias practicas obtenidas",
      asistencias
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener asistencias practicas",
      error.message
    );
  }
}

export async function getAsistenciaPracticaClaseProfesorController(req, res) {
  try {
    const paramErrors = validateAsistenciaPracticaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);
    if (!idProfesor) return;

    const asistencia = await getAsistenciaPracticaPorClase(req.params.id);

    if (!asistencia) {
      return handleErrorClient(res, 404, "Clase practica no encontrada");
    }

    if (Number(asistencia.id_profesor) !== Number(idProfesor)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para revisar esta asistencia practica"
      );
    }

    return handleSuccess(
      res,
      200,
      "Asistencia practica obtenida",
      asistencia
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener asistencia practica",
      error.message
    );
  }
}

export async function upsertAsistenciaPracticaProfesorController(req, res) {
  try {
    const paramErrors = validateAsistenciaPracticaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const bodyNormalizado = normalizarBodyAsistencia(req.body);
    const bodyErrors = validateRegistroAsistenciaPractica(bodyNormalizado);

    if (bodyErrors.length > 0) {
      return handleErrorClient(res, 400, "Datos invalidos", bodyErrors);
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);
    if (!idProfesor) return;

    const asistenciaActual = await getAsistenciaPracticaPorClase(req.params.id);

    if (!asistenciaActual) {
      return handleErrorClient(res, 404, "Clase practica no encontrada");
    }

    if (Number(asistenciaActual.id_profesor) !== Number(idProfesor)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para marcar asistencia de esta clase practica"
      );
    }

    const asistencia = await upsertAsistenciaPractica({
      idClasePractica: req.params.id,
      estadoAsistencia: bodyNormalizado.estado_asistencia,
      observacion: bodyNormalizado.observacion,
      registradoPor: req.usuario.id_usuario,
    });

    return handleSuccess(
      res,
      200,
      `Asistencia marcada como ${bodyNormalizado.estado_asistencia}`,
      asistencia
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al guardar asistencia practica",
      error.message
    );
  }
}

export async function getMiAsistenciaPracticaAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);
    if (!idAlumno) return;

    const asistencia = await getResumenAsistenciaPracticaAlumno(idAlumno);

    return handleSuccess(
      res,
      200,
      "Asistencia practica obtenida",
      asistencia
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener asistencia practica",
      error.message
    );
  }
}

export async function getAsistenciasPracticasController(_req, res) {
  try {
    const asistencias = await getHistorialAsistenciasPracticas();

    return handleSuccess(
      res,
      200,
      "Historial de asistencia practica obtenido",
      asistencias
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener historial de asistencia practica",
      error.message
    );
  }
}

export async function getAsistenciasPracticasAlumnoController(req, res) {
  try {
    const paramErrors = validateAsistenciaPracticaAlumnoParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const asistencias = await getHistorialAsistenciasPracticas({
      idAlumno: req.params.id_alumno,
    });

    return handleSuccess(
      res,
      200,
      "Historial de asistencia del alumno obtenido",
      asistencias
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener historial de asistencia del alumno",
      error.message
    );
  }
}

export async function getAsistenciasPracticasProfesorSecretariaController(
  req,
  res
) {
  try {
    const paramErrors = validateAsistenciaPracticaProfesorParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const asistencias = await getHistorialAsistenciasPracticas({
      idProfesor: req.params.id_profesor,
    });

    return handleSuccess(
      res,
      200,
      "Historial de asistencia del profesor obtenido",
      asistencias
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener historial de asistencia del profesor",
      error.message
    );
  }
}
