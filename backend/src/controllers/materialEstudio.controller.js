import {
  createMaterialEstudio,
  deleteMaterialEstudio,
  existeClaseTeorica,
  getAllMaterialesEstudio,
  getMaterialEstudioById,
  updateMaterialEstudio,
} from "../services/materialEstudio.services.js";

import {
  validateMaterialEstudioCreate,
  validateMaterialEstudioIdParam,
  validateMaterialEstudioUpdate,
} from "../validations/materialEstudio.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosMaterial(data) {
  const limpio = { ...data };

  const camposTexto = ["titulo", "descripcion", "tipo", "url_material", "estado"];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (limpio.descripcion === "") {
    limpio.descripcion = null;
  }

  if (limpio.id_clase_teorica === "") {
    limpio.id_clase_teorica = null;
  }

  if (
    limpio.id_clase_teorica !== undefined &&
    limpio.id_clase_teorica !== null
  ) {
    limpio.id_clase_teorica = Number(limpio.id_clase_teorica);
  }

  return limpio;
}

function asignarArchivoMaterial(materialData, file) {
  if (!file) return materialData;

  return {
    ...materialData,
    url_material: `/uploads/materiales/${file.filename}`,
  };
}

function esArchivoSubidoMaterial(urlMaterial) {
  return typeof urlMaterial === "string" && urlMaterial.startsWith("/uploads/materiales/");
}

function validarMaterialVideo(tipo, urlMaterial) {
  if (tipo === "Video" && esArchivoSubidoMaterial(urlMaterial)) {
    return "Para materiales de tipo Video, se recomienda usar un enlace externo.";
  }

  return null;
}

function validarOrigenMaterial(materialData, file) {
  const tieneArchivo = Boolean(file);
  const tieneUrlManual = Boolean(
    typeof materialData.url_material === "string" && materialData.url_material.trim()
  );

  if (!tieneArchivo && !tieneUrlManual) {
    return "Debe ingresar un enlace o subir un archivo para el material.";
  }

  return null;
}

async function validarClaseTeoricaAsociada(materialData) {
  if (
    materialData.id_clase_teorica === undefined ||
    materialData.id_clase_teorica === null
  ) {
    return null;
  }

  const existe = await existeClaseTeorica(materialData.id_clase_teorica);

  return existe ? null : "La clase teorica asociada no existe";
}

function obtenerErroresRespuesta(data, mensajeFallback) {
  if (Array.isArray(data)) {
    return data;
  }

  return [mensajeFallback];
}

export async function getMaterialesEstudioController(req, res) {
  try {
    const materiales = await getAllMaterialesEstudio();

    return handleSuccess(
      res,
      200,
      "Materiales de estudio obtenidos exitosamente",
      materiales
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener materiales de estudio",
      error.message
    );
  }
}

export async function getMaterialEstudioController(req, res) {
  try {
    const paramErrors = validateMaterialEstudioIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const material = await getMaterialEstudioById(req.params.id);

    if (!material) {
      return handleErrorClient(res, 404, "Material de estudio no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Material de estudio obtenido exitosamente",
      material
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener material de estudio",
      error.message
    );
  }
}

export async function createMaterialEstudioController(req, res) {
  try {
    const materialDataBase = limpiarDatosMaterial(req.body);
    const errorOrigen = validarOrigenMaterial(materialDataBase, req.file);

    if (errorOrigen) {
      return handleErrorClient(res, 400, "Origen de material invalido", [
        errorOrigen,
      ]);
    }

    const materialData = asignarArchivoMaterial(materialDataBase, req.file);
    const { errors, value } = validateMaterialEstudioCreate(materialData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de material invalidos",
        obtenerErroresRespuesta(errors, "Datos de material invalidos")
      );
    }

    const errorVideo = validarMaterialVideo(value.tipo, value.url_material);

    if (errorVideo) {
      return handleErrorClient(res, 400, "Origen de material invalido", [
        errorVideo,
      ]);
    }

    const errorClase = await validarClaseTeoricaAsociada(value);

    if (errorClase) {
      return handleErrorClient(res, 404, "Clase teorica no encontrada", [
        errorClase,
      ]);
    }

    const nuevoMaterial = await createMaterialEstudio(value);

    return handleSuccess(
      res,
      201,
      "Material de estudio creado exitosamente",
      nuevoMaterial
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear material de estudio",
      error.message
    );
  }
}

export async function updateMaterialEstudioController(req, res) {
  try {
    const paramErrors = validateMaterialEstudioIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const materialExistente = await getMaterialEstudioById(req.params.id);

    if (!materialExistente) {
      return handleErrorClient(res, 404, "Material de estudio no encontrado");
    }

    const materialDataBase = limpiarDatosMaterial(req.body);
    const materialData = asignarArchivoMaterial(materialDataBase, req.file);
    const { errors, value } = validateMaterialEstudioUpdate(materialData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de material invalidos",
        obtenerErroresRespuesta(errors, "Datos de material invalidos")
      );
    }

    const tipoFinal = value.tipo || materialExistente.tipo;
    const urlFinal =
      value.url_material !== undefined
        ? value.url_material
        : materialExistente.url_material;
    const errorVideo = validarMaterialVideo(tipoFinal, urlFinal);

    if (errorVideo) {
      return handleErrorClient(res, 400, "Origen de material invalido", [
        errorVideo,
      ]);
    }

    const errorClase = await validarClaseTeoricaAsociada(value);

    if (errorClase) {
      return handleErrorClient(res, 404, "Clase teorica no encontrada", [
        errorClase,
      ]);
    }

    const materialActualizado = await updateMaterialEstudio(
      req.params.id,
      value
    );

    return handleSuccess(
      res,
      200,
      "Material de estudio actualizado exitosamente",
      materialActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar material de estudio",
      error.message
    );
  }
}

export async function deleteMaterialEstudioController(req, res) {
  try {
    const paramErrors = validateMaterialEstudioIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const materialEliminado = await deleteMaterialEstudio(req.params.id);

    if (!materialEliminado) {
      return handleErrorClient(res, 404, "Material de estudio no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Material de estudio eliminado exitosamente",
      materialEliminado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar material de estudio",
      error.message
    );
  }
}
