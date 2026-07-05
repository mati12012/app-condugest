import {
  createSolicitudMatricula,
  deleteSolicitudMatricula,
  getAllSolicitudesMatricula,
  getPlanActivoById,
  getSolicitudMatriculaDetalleById,
  updateSolicitudMatricula,
} from "../services/solicitudMatricula.services.js";

import {
  validateSolicitudMatriculaCreate,
  validateSolicitudMatriculaIdParam,
  validateSolicitudMatriculaUpdate,
} from "../validations/solicitudMatricula.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosSolicitud(data) {
  const limpio = { ...data };

  const camposTexto = [
    "nombre",
    "apellido",
    "rut",
    "correo",
    "telefono",
    "mensaje",
    "estado",
  ];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (limpio.mensaje === "") {
    limpio.mensaje = null;
  }

  if (limpio.id_plan === "") {
    delete limpio.id_plan;
  } else if (
    limpio.id_plan !== undefined &&
    limpio.id_plan !== null &&
    limpio.id_plan !== ""
  ) {
    limpio.id_plan = Number(limpio.id_plan);
  }

  return limpio;
}

export async function createSolicitudMatriculaPublicaController(req, res) {
  try {
    const solicitudData = limpiarDatosSolicitud(req.body);
    const { errors, value } = validateSolicitudMatriculaCreate(solicitudData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de matricula invalidos",
        errors
      );
    }

    const planActivo = await getPlanActivoById(value.id_plan);

    if (!planActivo) {
      return handleErrorClient(
        res,
        404,
        "El plan seleccionado no existe o no se encuentra activo"
      );
    }

    const nuevaSolicitud = await createSolicitudMatricula(value);

    return handleSuccess(
      res,
      201,
      "Solicitud de matricula creada exitosamente",
      nuevaSolicitud
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear solicitud de matricula",
      error.message
    );
  }
}

export async function getSolicitudesMatriculaController(req, res) {
  try {
    const solicitudes = await getAllSolicitudesMatricula();

    return handleSuccess(
      res,
      200,
      "Solicitudes de matricula obtenidas exitosamente",
      solicitudes
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitudes de matricula",
      error.message
    );
  }
}

export async function getSolicitudMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateSolicitudMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const solicitud = await getSolicitudMatriculaDetalleById(id);

    if (!solicitud) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de matricula no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Solicitud de matricula obtenida exitosamente",
      solicitud
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener solicitud de matricula",
      error.message
    );
  }
}

export async function updateSolicitudMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateSolicitudMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const solicitudData = limpiarDatosSolicitud(req.body);
    const { errors, value } = validateSolicitudMatriculaUpdate(solicitudData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de solicitud de matricula invalidos",
        errors
      );
    }

    const solicitudActualizada = await updateSolicitudMatricula(id, value);

    if (!solicitudActualizada) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de matricula no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Solicitud de matricula actualizada exitosamente",
      solicitudActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar solicitud de matricula",
      error.message
    );
  }
}

export async function deleteSolicitudMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateSolicitudMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const solicitudEliminada = await deleteSolicitudMatricula(id);

    if (!solicitudEliminada) {
      return handleErrorClient(
        res,
        404,
        "Solicitud de matricula no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Solicitud de matricula eliminada exitosamente",
      solicitudEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar solicitud de matricula",
      error.message
    );
  }
}
