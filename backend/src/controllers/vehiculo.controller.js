import {
  createVehiculo,
  deleteVehiculo,
  getAllVehiculos,
  getVehiculoById,
  getVehiculoByPatente,
  updateVehiculo,
  actualizarRevisionTecnicaVehiculo,
} from "../services/vehiculo.services.js";
import {
  analizarRevisionTecnicaDocumento,
  calcularEstadoRevisionTecnica,
} from "../services/revisionTecnicaIA.services.js";

import {
  validateVehiculoCreate,
  validateVehiculoIdParam,
  validateVehiculoUpdate,
} from "../validations/vehiculo.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function normalizarPatente(valor) {
  return String(valor || "")
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "");
}

function limpiarDatosVehiculo(data) {
  const limpio = { ...data };

  const camposTexto = [
    "patente",
    "marca",
    "modelo",
    "tipo_transmision",
    "licencia_requerida",
    "sede",
    "estado_operativo",
    "observacion",
    "estado_revision_tecnica",
    "patente_detectada_revision",
    "confianza_revision_tecnica",
    "observacion_revision_tecnica",
  ];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (typeof limpio.patente === "string") {
    limpio.patente = normalizarPatente(limpio.patente);
  }

  if (typeof limpio.patente_detectada_revision === "string") {
    limpio.patente_detectada_revision = normalizarPatente(
      limpio.patente_detectada_revision
    );
  }

  if (limpio.observacion === "") {
    limpio.observacion = null;
  }

  if (limpio.observacion_revision_tecnica === "") {
    limpio.observacion_revision_tecnica = null;
  }

  if (limpio.fecha_vencimiento_revision_tecnica === "") {
    limpio.fecha_vencimiento_revision_tecnica = null;
  }

  if (
    limpio.anio !== undefined &&
    limpio.anio !== null &&
    limpio.anio !== ""
  ) {
    limpio.anio = Number(limpio.anio);
  }

  if (
    limpio.kilometraje !== undefined &&
    limpio.kilometraje !== null &&
    limpio.kilometraje !== ""
  ) {
    limpio.kilometraje = Number(limpio.kilometraje);
  }

  return limpio;
}

export async function getVehiculosController(_req, res) {
  try {
    const vehiculos = await getAllVehiculos();

    return handleSuccess(
      res,
      200,
      "Vehiculos obtenidos exitosamente",
      vehiculos
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener vehiculos",
      error.message
    );
  }
}

export async function getVehiculoController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const vehiculo = await getVehiculoById(id);

    if (!vehiculo) {
      return handleErrorClient(res, 404, "Vehiculo no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Vehiculo obtenido exitosamente",
      vehiculo
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener vehiculo",
      error.message
    );
  }
}

export async function createVehiculoController(req, res) {
  try {
    const vehiculoData = limpiarDatosVehiculo(req.body);
    const validationErrors = validateVehiculoCreate(vehiculoData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de vehiculo invalidos",
        validationErrors
      );
    }

    const patenteExistente = await getVehiculoByPatente(vehiculoData.patente);

    if (patenteExistente) {
      return handleErrorClient(
        res,
        409,
        "Ya existe un vehiculo registrado con esa patente"
      );
    }

    const nuevoVehiculo = await createVehiculo({
      ...vehiculoData,
      kilometraje: vehiculoData.kilometraje ?? 0,
      estado_operativo: vehiculoData.estado_operativo ?? "Disponible",
    });

    return handleSuccess(
      res,
      201,
      "Vehiculo creado exitosamente",
      nuevoVehiculo
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear vehiculo",
      error.message
    );
  }
}

export async function updateVehiculoController(req, res) {
  try {
    const { id } = req.params;
    const vehiculoData = limpiarDatosVehiculo(req.body);
    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const validationErrors = validateVehiculoUpdate(vehiculoData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de vehiculo invalidos",
        validationErrors
      );
    }

    const vehiculoExistente = await getVehiculoById(id);

    if (!vehiculoExistente) {
      return handleErrorClient(res, 404, "Vehiculo no encontrado");
    }

    if (
      vehiculoData.patente &&
      vehiculoData.patente !== vehiculoExistente.patente
    ) {
      const patenteExistente = await getVehiculoByPatente(vehiculoData.patente);

      if (patenteExistente) {
        return handleErrorClient(
          res,
          409,
          "Ya existe otro vehiculo registrado con esa patente"
        );
      }
    }

    if (
      vehiculoData.fecha_vencimiento_revision_tecnica !== undefined &&
      vehiculoData.fecha_vencimiento_revision_tecnica &&
      vehiculoData.estado_revision_tecnica === undefined
    ) {
      vehiculoData.estado_revision_tecnica = calcularEstadoRevisionTecnica(
        vehiculoData.fecha_vencimiento_revision_tecnica
      );
      vehiculoData.confianza_revision_tecnica =
        vehiculoData.confianza_revision_tecnica || "Alta";
      vehiculoData.observacion_revision_tecnica =
        vehiculoData.observacion_revision_tecnica ||
        "Fecha de vencimiento confirmada manualmente por secretaria.";
    }

    const vehiculoActualizado = await updateVehiculo(id, vehiculoData);

    return handleSuccess(
      res,
      200,
      "Vehiculo actualizado exitosamente",
      vehiculoActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar vehiculo",
      error.message
    );
  }
}

export async function deleteVehiculoController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const vehiculoEliminado = await deleteVehiculo(id);

    if (!vehiculoEliminado) {
      return handleErrorClient(res, 404, "Vehiculo no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Vehiculo eliminado exitosamente",
      vehiculoEliminado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar vehiculo",
      error.message
    );
  }
}

export async function subirRevisionController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    if (!req.file) {
      return handleErrorClient(res, 400, "No se subio ningun archivo");
    }

    const vehiculo = await getVehiculoById(id);

    if (!vehiculo) {
      return handleErrorClient(res, 404, "Vehiculo no encontrado");
    }

    const analisisRevision = await analizarRevisionTecnicaDocumento({
      rutaArchivo: req.file.path,
      mimetype: req.file.mimetype,
      patenteRegistrada: vehiculo.patente,
    });
    const vehiculoActualizado = await actualizarRevisionTecnicaVehiculo(
      id,
      req.file.filename,
      analisisRevision
    );

    return handleSuccess(res, 200, "Documento subido con exito", {
      url_revision_tecnica: vehiculoActualizado.url_revision_tecnica,
      analisis_revision_tecnica: {
        fecha_vencimiento_revision_tecnica:
          vehiculoActualizado.fecha_vencimiento_revision_tecnica,
        estado_revision_tecnica: vehiculoActualizado.estado_revision_tecnica,
        patente_detectada_revision:
          vehiculoActualizado.patente_detectada_revision,
        confianza_revision_tecnica:
          vehiculoActualizado.confianza_revision_tecnica,
        observacion_revision_tecnica:
          vehiculoActualizado.observacion_revision_tecnica,
      },
      vehiculo: vehiculoActualizado,
    });
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al subir el documento",
      error.message
    );
  }
}
