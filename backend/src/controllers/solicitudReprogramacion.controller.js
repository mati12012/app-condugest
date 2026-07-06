import { getAlumnoIdDesdeUsuario } from "../services/alumnoPanel.services.js";

import {
  createSolicitudReprogramacion,
  getAllSolicitudesReprogramacion,
  getClasePracticaReprogramacionById,
  getSolicitudPendientePorClase,
  getSolicitudReprogramacionById,
  getSolicitudesReprogramacionPorAlumno,
  updateSolicitudReprogramacion,
} from "../services/solicitudReprogramacion.services.js";

import {
  limpiarDatosReprogramacion,
  validateReprogramacionCreate,
  validateReprogramacionIdParam,
  validateReprogramacionUpdate,
} from "../validations/solicitudReprogramacion.validation.js";

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

export async function createReprogramacionAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);

    if (!idAlumno) return;

    const datosSolicitud = limpiarDatosReprogramacion(req.body);
    const { errors, value } = validateReprogramacionCreate(datosSolicitud);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de reprogramacion invalidos",
        errors
      );
    }

    const clase = await getClasePracticaReprogramacionById(
      value.id_clase_practica
    );

    if (!clase) {
      return handleErrorClient(res, 404, "Clase practica no encontrada");
    }

    if (Number(clase.id_alumno) !== Number(idAlumno)) {
      return handleErrorClient(
        res,
        403,
        "No puedes solicitar reprogramacion de una clase que no te pertenece"
      );
    }

    if (["Realizada", "Cancelada"].includes(clase.estado)) {
      return handleErrorClient(
        res,
        409,
        "No se puede solicitar reprogramacion de clases realizadas o canceladas"
      );
    }

    const solicitudPendiente = await getSolicitudPendientePorClase(
      value.id_clase_practica
    );

    if (solicitudPendiente) {
      return handleErrorClient(
        res,
        409,
        "Ya existe una solicitud pendiente para esta clase"
      );
    }

    const nuevaSolicitud = await createSolicitudReprogramacion(
      idAlumno,
      value
    );

    return handleSuccess(
      res,
      201,
      "Solicitud enviada correctamente. Secretaria revisara tu solicitud.",
      nuevaSolicitud
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear solicitud de reprogramacion",
      error.message
    );
  }
}

export async function getMisReprogramacionesAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);

    if (!idAlumno) return;

    const solicitudes = await getSolicitudesReprogramacionPorAlumno(idAlumno);

    return handleSuccess(
      res,
      200,
      "Solicitudes de reprogramacion obtenidas exitosamente",
      solicitudes
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitudes de reprogramacion",
      error.message
    );
  }
}

export async function getReprogramacionesSecretariaController(req, res) {
  try {
    const solicitudes = await getAllSolicitudesReprogramacion();

    return handleSuccess(
      res,
      200,
      "Solicitudes de reprogramacion obtenidas exitosamente",
      solicitudes
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitudes de reprogramacion",
      error.message
    );
  }
}

export async function getReprogramacionSecretariaController(req, res) {
  try {
    const paramErrors = validateReprogramacionIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const solicitud = await getSolicitudReprogramacionById(req.params.id);

    if (!solicitud) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de reprogramacion no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Solicitud de reprogramacion obtenida exitosamente",
      solicitud
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitud de reprogramacion",
      error.message
    );
  }
}

export async function updateReprogramacionSecretariaController(req, res) {
  try {
    const paramErrors = validateReprogramacionIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const datosSolicitud = limpiarDatosReprogramacion(req.body);
    const { errors, value } = validateReprogramacionUpdate(datosSolicitud);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de reprogramacion invalidos",
        errors
      );
    }

    const solicitudActual = await getSolicitudReprogramacionById(req.params.id);

    if (!solicitudActual) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de reprogramacion no encontrada"
      );
    }

    const solicitudActualizada = await updateSolicitudReprogramacion(
      req.params.id,
      value
    );

    return handleSuccess(
      res,
      200,
      "Solicitud de reprogramacion actualizada exitosamente",
      solicitudActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar solicitud de reprogramacion",
      error.message
    );
  }
}
