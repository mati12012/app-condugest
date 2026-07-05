import {
  createVehiculo,
  deleteVehiculo,
  getAllVehiculos,
  getVehiculoById,
  getVehiculoByPatente,
  updateVehiculo,
  actualizarDocumentoVehiculo,
} from "../services/vehiculo.services.js";

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
  ];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (typeof limpio.patente === "string") {
    limpio.patente = limpio.patente
      .toUpperCase()
      .replace(/\s/g, "")
      .replace(/-/g, "")
      .replace(/\./g, "");
  }

  if (limpio.observacion === "") {
    limpio.observacion = null;
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

export async function getVehiculosController(req, res) {
  try {
    const vehiculos = await getAllVehiculos();

    return handleSuccess(
      res,
      200,
      "Vehículos obtenidos exitosamente",
      vehiculos
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener vehículos",
      error.message
    );
  }
}

export async function getVehiculoController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const vehiculo = await getVehiculoById(id);

    if (!vehiculo) {
      return handleErrorClient(res, 404, "Vehículo no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Vehículo obtenido exitosamente",
      vehiculo
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener vehículo",
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
        "Datos de vehículo inválidos",
        validationErrors
      );
    }

    const patenteExistente = await getVehiculoByPatente(vehiculoData.patente);

    if (patenteExistente) {
      return handleErrorClient(
        res,
        409,
        "Ya existe un vehículo registrado con esa patente"
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
      "Vehículo creado exitosamente",
      nuevoVehiculo
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear vehículo",
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
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const validationErrors = validateVehiculoUpdate(vehiculoData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de vehículo inválidos",
        validationErrors
      );
    }

    const vehiculoExistente = await getVehiculoById(id);

    if (!vehiculoExistente) {
      return handleErrorClient(res, 404, "Vehículo no encontrado");
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
          "Ya existe otro vehículo registrado con esa patente"
        );
      }
    }

    const vehiculoActualizado = await updateVehiculo(id, vehiculoData);

    return handleSuccess(
      res,
      200,
      "Vehículo actualizado exitosamente",
      vehiculoActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar vehículo",
      error.message
    );
  }
}

export async function deleteVehiculoController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateVehiculoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const vehiculoEliminado = await deleteVehiculo(id);

    if (!vehiculoEliminado) {
      return handleErrorClient(res, 404, "Vehículo no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Vehículo eliminado exitosamente",
      vehiculoEliminado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar vehículo",
      error.message
    );
  }
}

export async function subirRevisionController(req, res) {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const urlDocumento = await actualizarDocumentoVehiculo(id, req.file.filename);
    
    return handleSuccess(res, 200, "Documento subido con éxito", { url_revision_tecnica: urlDocumento });
  } catch (error) {
    return handleErrorServer(res, 500, "Error al subir el documento", error.message);
  }
}