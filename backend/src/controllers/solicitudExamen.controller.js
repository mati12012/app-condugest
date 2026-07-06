import { getAlumnoIdDesdeUsuario } from "../services/alumnoPanel.services.js";

import {
  createSolicitudExamenAlumno,
  getAllSolicitudesExamen,
  getMatriculaValidaMasRecienteAlumno,
  getSolicitudExamenById,
  getSolicitudExamenPendientePorAlumno,
  getSolicitudesExamenPorAlumno,
  updateSolicitudExamen,
} from "../services/solicitudExamen.services.js";

import {
  limpiarDatosSolicitudExamen,
  normalizarSolicitudExamenParaRespuesta,
  normalizarSolicitudesExamenParaRespuesta,
  validateSolicitudExamenCreate,
  validateSolicitudExamenIdParam,
  validateSolicitudExamenUpdate,
} from "../validations/solicitudExamen.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

async function obtenerAlumnoAutenticado(req, res) {
  const idUsuario = req.usuario?.id_usuario;

  if (!idUsuario) {
    handleErrorClient(
      res,
      401,
      "No se pudo identificar al usuario autenticado"
    );
    return null;
  }

  const idAlumno = await getAlumnoIdDesdeUsuario(idUsuario);

  if (!idAlumno) {
    handleErrorClient(res, 404, "Alumno no vinculado");
    return null;
  }

  return Number(idAlumno);
}

export async function createSolicitudExamenAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);

    if (!idAlumno) return;

    const datosSolicitud = limpiarDatosSolicitudExamen(req.body);
    const { errors, value } = validateSolicitudExamenCreate(datosSolicitud);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de examen invalidos",
        errors
      );
    }

    const matricula = await getMatriculaValidaMasRecienteAlumno(idAlumno);

    if (!matricula) {
      return handleErrorClient(
        res,
        409,
        "Debes tener una matricula activa o finalizada para solicitar examen municipal"
      );
    }

    const solicitudPendiente = await getSolicitudExamenPendientePorAlumno(
      idAlumno
    );

    if (solicitudPendiente) {
      return handleErrorClient(
        res,
        409,
        "Ya tienes una solicitud de examen pendiente"
      );
    }

    const nuevaSolicitud = await createSolicitudExamenAlumno(
      idAlumno,
      matricula.id_matricula,
      value
    );

    return handleSuccess(
      res,
      201,
      "Solicitud de examen enviada correctamente",
      normalizarSolicitudExamenParaRespuesta(nuevaSolicitud)
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear solicitud de examen",
      error.message
    );
  }
}

export async function getMisSolicitudesExamenAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);

    if (!idAlumno) return;

    const solicitudes = await getSolicitudesExamenPorAlumno(idAlumno);

    return handleSuccess(
      res,
      200,
      "Solicitudes de examen obtenidas exitosamente",
      normalizarSolicitudesExamenParaRespuesta(solicitudes)
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitudes de examen",
      error.message
    );
  }
}

export async function getSolicitudesExamenSecretariaController(req, res) {
  try {
    const solicitudes = await getAllSolicitudesExamen();

    return handleSuccess(
      res,
      200,
      "Solicitudes de examen obtenidas exitosamente",
      normalizarSolicitudesExamenParaRespuesta(solicitudes)
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitudes de examen",
      error.message
    );
  }
}

export async function getSolicitudExamenSecretariaController(req, res) {
  try {
    const paramErrors = validateSolicitudExamenIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const solicitud = await getSolicitudExamenById(req.params.id);

    if (!solicitud) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de examen no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Solicitud de examen obtenida exitosamente",
      normalizarSolicitudExamenParaRespuesta(solicitud)
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitud de examen",
      error.message
    );
  }
}

export async function updateSolicitudExamenSecretariaController(req, res) {
  try {
    const paramErrors = validateSolicitudExamenIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const datosSolicitud = limpiarDatosSolicitudExamen(req.body);
    const { errors, value } = validateSolicitudExamenUpdate(datosSolicitud);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de examen invalidos",
        errors
      );
    }

    const solicitudActual = await getSolicitudExamenById(req.params.id);

    if (!solicitudActual) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de examen no encontrada"
      );
    }

    const solicitudActualizada = await updateSolicitudExamen(
      req.params.id,
      value
    );

    return handleSuccess(
      res,
      200,
      "Solicitud de examen actualizada exitosamente",
      normalizarSolicitudExamenParaRespuesta(solicitudActualizada)
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar solicitud de examen",
      error.message
    );
  }
}
