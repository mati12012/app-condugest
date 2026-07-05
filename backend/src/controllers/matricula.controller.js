import {
  createMatriculaDesdePlan,
  deleteMatricula,
  getAllMatriculas,
  getAlumnoMatriculaById,
  getMatriculaActivaPorAlumno,
  getMatriculaDetalleById,
  getMatriculasPorAlumno,
  getPlanActivoMatriculaById,
  updateMatricula,
} from "../services/matricula.services.js";

import {
  validateMatriculaAlumnoParam,
  validateMatriculaCreate,
  validateMatriculaIdParam,
  validateMatriculaUpdate,
} from "../validations/matricula.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosMatricula(data) {
  const limpio = { ...data };

  ["id_alumno", "id_plan"].forEach((campo) => {
    if (limpio[campo] === "") {
      delete limpio[campo];
    } else if (limpio[campo] !== undefined && limpio[campo] !== null) {
      limpio[campo] = Number(limpio[campo]);
    }
  });

  if (typeof limpio.estado === "string") {
    limpio.estado = limpio.estado.trim();
  }

  return limpio;
}

export async function getMatriculasController(req, res) {
  try {
    const matriculas = await getAllMatriculas();

    return handleSuccess(
      res,
      200,
      "Matriculas obtenidas exitosamente",
      matriculas
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener matriculas",
      error.message
    );
  }
}

export async function getMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const matricula = await getMatriculaDetalleById(id);

    if (!matricula) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Matricula obtenida exitosamente",
      matricula
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener matricula",
      error.message
    );
  }
}

export async function getMatriculasPorAlumnoController(req, res) {
  try {
    const { id_alumno } = req.params;
    const paramErrors = validateMatriculaAlumnoParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const alumno = await getAlumnoMatriculaById(id_alumno);

    if (!alumno) {
      return handleErrorClient(res, 404, "Alumno no encontrado");
    }

    const matriculas = await getMatriculasPorAlumno(id_alumno);

    return handleSuccess(
      res,
      200,
      "Matriculas del alumno obtenidas exitosamente",
      matriculas
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener matriculas del alumno",
      error.message
    );
  }
}

export async function createMatriculaController(req, res) {
  try {
    const matriculaData = limpiarDatosMatricula(req.body);
    const { errors, value } = validateMatriculaCreate(matriculaData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de matricula invalidos",
        errors
      );
    }

    const alumno = await getAlumnoMatriculaById(value.id_alumno);

    if (!alumno) {
      return handleErrorClient(res, 404, "Alumno no encontrado");
    }

    const planActivo = await getPlanActivoMatriculaById(value.id_plan);

    if (!planActivo) {
      return handleErrorClient(
        res,
        404,
        "El plan seleccionado no existe o no se encuentra activo"
      );
    }

    const matriculaActiva = await getMatriculaActivaPorAlumno(value.id_alumno);

    if (matriculaActiva) {
      return handleErrorClient(
        res,
        409,
        "El alumno ya tiene una matricula activa"
      );
    }

    const nuevaMatricula = await createMatriculaDesdePlan({
      id_alumno: value.id_alumno,
      plan: planActivo,
    });

    return handleSuccess(
      res,
      201,
      "Matricula creada exitosamente",
      nuevaMatricula
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear matricula",
      error.message
    );
  }
}

export async function updateMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const matriculaActual = await getMatriculaDetalleById(id);

    if (!matriculaActual) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    const matriculaData = limpiarDatosMatricula(req.body);
    const { errors, value } = validateMatriculaUpdate(matriculaData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de matricula invalidos",
        errors
      );
    }

    if (value.estado === "Activa") {
      const matriculaActiva = await getMatriculaActivaPorAlumno(
        matriculaActual.id_alumno,
        matriculaActual.id_matricula
      );

      if (matriculaActiva) {
        return handleErrorClient(
          res,
          409,
          "El alumno ya tiene otra matricula activa"
        );
      }
    }

    const matriculaActualizada = await updateMatricula(id, value);

    return handleSuccess(
      res,
      200,
      "Matricula actualizada exitosamente",
      matriculaActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar matricula",
      error.message
    );
  }
}

export async function deleteMatriculaController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validateMatriculaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const matriculaEliminada = await deleteMatricula(id);

    if (!matriculaEliminada) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Matricula eliminada exitosamente",
      matriculaEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar matricula",
      error.message
    );
  }
}
