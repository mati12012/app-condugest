import {
  buscarDisponibilidadSolapada,
  createDisponibilidadProfesor,
  deleteDisponibilidadProfesor,
  getAllDisponibilidadesProfesores,
  getDisponibilidadProfesorById,
  getDisponibilidadesByProfesor,
  updateDisponibilidadProfesor,
} from "../services/disponibilidadProfesor.services.js";

import { getProfesorById } from "../services/profesor.services.js";

import {
  validarRangoHorario,
  validateDisponibilidadProfesorCreate,
  validateDisponibilidadProfesorIdParam,
  validateDisponibilidadProfesorParam,
  validateDisponibilidadProfesorUpdate,
} from "../validations/disponibilidadProfesor.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosDisponibilidad(data) {
  const limpio = { ...data };

  if (
    limpio.id_profesor !== undefined &&
    limpio.id_profesor !== null &&
    limpio.id_profesor !== ""
  ) {
    limpio.id_profesor = Number(limpio.id_profesor);
  }

  const camposTexto = [
    "dia_semana",
    "hora_inicio",
    "hora_fin",
    "sede",
    "estado",
  ];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  return limpio;
}

async function validarProfesor(disponibilidadData) {
  const profesor = await getProfesorById(disponibilidadData.id_profesor);

  return profesor ? null : "El profesor no existe.";
}

async function validarSolapeDisponibilidad(
  disponibilidadData,
  idDisponibilidadExcluida = null
) {
  if (disponibilidadData.estado !== "Activa") {
    return null;
  }

  const solape = await buscarDisponibilidadSolapada({
    id_profesor: disponibilidadData.id_profesor,
    dia_semana: disponibilidadData.dia_semana,
    hora_inicio: disponibilidadData.hora_inicio,
    hora_fin: disponibilidadData.hora_fin,
    sede: disponibilidadData.sede,
    id_disponibilidad_excluida: idDisponibilidadExcluida,
  });

  return solape
    ? "Ya existe una disponibilidad activa que se solapa para ese profesor, día y sede."
    : null;
}

function construirDisponibilidadFinal(disponibilidadExistente, cambios) {
  return {
    id_profesor: cambios.id_profesor ?? disponibilidadExistente.id_profesor,
    dia_semana: cambios.dia_semana ?? disponibilidadExistente.dia_semana,
    hora_inicio: cambios.hora_inicio ?? disponibilidadExistente.hora_inicio,
    hora_fin: cambios.hora_fin ?? disponibilidadExistente.hora_fin,
    sede: cambios.sede ?? disponibilidadExistente.sede,
    estado: cambios.estado ?? disponibilidadExistente.estado,
  };
}

export async function getDisponibilidadesProfesoresController(req, res) {
  try {
    const disponibilidades = await getAllDisponibilidadesProfesores();

    return handleSuccess(
      res,
      200,
      "Disponibilidades obtenidas exitosamente",
      disponibilidades
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener disponibilidades",
      error.message
    );
  }
}

export async function getDisponibilidadProfesorController(req, res) {
  try {
    const paramErrors = validateDisponibilidadProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parámetros inválidos", paramErrors);
    }

    const disponibilidad = await getDisponibilidadProfesorById(req.params.id);

    if (!disponibilidad) {
      return handleErrorClient(res, 404, "Disponibilidad no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Disponibilidad obtenida exitosamente",
      disponibilidad
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener disponibilidad",
      error.message
    );
  }
}

export async function getDisponibilidadesProfesorController(req, res) {
  try {
    const paramErrors = validateDisponibilidadProfesorParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parámetros inválidos", paramErrors);
    }

    const profesor = await getProfesorById(req.params.id_profesor);

    if (!profesor) {
      return handleErrorClient(res, 404, "El profesor no existe");
    }

    const disponibilidades = await getDisponibilidadesByProfesor(
      req.params.id_profesor
    );

    return handleSuccess(
      res,
      200,
      "Disponibilidades del profesor obtenidas exitosamente",
      disponibilidades
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener disponibilidades del profesor",
      error.message
    );
  }
}

export async function createDisponibilidadProfesorController(req, res) {
  try {
    const disponibilidadDataBase = limpiarDatosDisponibilidad(req.body);
    const { errors, value } = validateDisponibilidadProfesorCreate(
      disponibilidadDataBase
    );

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de disponibilidad inválidos",
        errors
      );
    }

    const errorHorario = validarRangoHorario(value.hora_inicio, value.hora_fin);

    if (errorHorario) {
      return handleErrorClient(res, 400, "Horario inválido", [errorHorario]);
    }

    const errorProfesor = await validarProfesor(value);

    if (errorProfesor) {
      return handleErrorClient(res, 404, "Profesor no encontrado", [
        errorProfesor,
      ]);
    }

    const errorSolape = await validarSolapeDisponibilidad(value);

    if (errorSolape) {
      return handleErrorClient(res, 409, "Disponibilidad solapada", [
        errorSolape,
      ]);
    }

    const nuevaDisponibilidad = await createDisponibilidadProfesor(value);

    return handleSuccess(
      res,
      201,
      "Disponibilidad creada exitosamente",
      nuevaDisponibilidad
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear disponibilidad",
      error.message
    );
  }
}

export async function updateDisponibilidadProfesorController(req, res) {
  try {
    const paramErrors = validateDisponibilidadProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parámetros inválidos", paramErrors);
    }

    const disponibilidadExistente = await getDisponibilidadProfesorById(
      req.params.id
    );

    if (!disponibilidadExistente) {
      return handleErrorClient(res, 404, "Disponibilidad no encontrada");
    }

    const disponibilidadDataBase = limpiarDatosDisponibilidad(req.body);
    const { errors, value } = validateDisponibilidadProfesorUpdate(
      disponibilidadDataBase
    );

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de disponibilidad inválidos",
        errors
      );
    }

    const disponibilidadFinal = construirDisponibilidadFinal(
      disponibilidadExistente,
      value
    );
    const errorHorario = validarRangoHorario(
      disponibilidadFinal.hora_inicio,
      disponibilidadFinal.hora_fin
    );

    if (errorHorario) {
      return handleErrorClient(res, 400, "Horario inválido", [errorHorario]);
    }

    const errorProfesor = await validarProfesor(disponibilidadFinal);

    if (errorProfesor) {
      return handleErrorClient(res, 404, "Profesor no encontrado", [
        errorProfesor,
      ]);
    }

    const errorSolape = await validarSolapeDisponibilidad(
      disponibilidadFinal,
      req.params.id
    );

    if (errorSolape) {
      return handleErrorClient(res, 409, "Disponibilidad solapada", [
        errorSolape,
      ]);
    }

    const disponibilidadActualizada = await updateDisponibilidadProfesor(
      req.params.id,
      value
    );

    return handleSuccess(
      res,
      200,
      "Disponibilidad actualizada exitosamente",
      disponibilidadActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar disponibilidad",
      error.message
    );
  }
}

export async function deleteDisponibilidadProfesorController(req, res) {
  try {
    const paramErrors = validateDisponibilidadProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parámetros inválidos", paramErrors);
    }

    const disponibilidadEliminada = await deleteDisponibilidadProfesor(
      req.params.id
    );

    if (!disponibilidadEliminada) {
      return handleErrorClient(res, 404, "Disponibilidad no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Disponibilidad eliminada exitosamente",
      disponibilidadEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar disponibilidad",
      error.message
    );
  }
}
