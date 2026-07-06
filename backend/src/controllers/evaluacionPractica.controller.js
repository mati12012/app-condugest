import { getAlumnoIdDesdeUsuario } from "../services/alumnoPanel.services.js";
import { getProfesorIdDesdeUsuario } from "../services/profesorPanel.services.js";

import {
  createEvaluacionPractica,
  getAllEvaluacionesPracticas,
  getClasePracticaEvaluacionById,
  getEvaluacionPracticaById,
  getEvaluacionPracticaPorClase,
  getEvaluacionesPracticasPorAlumno,
  getEvaluacionesPracticasPorProfesor,
  updateEvaluacionPractica,
} from "../services/evaluacionPractica.services.js";

import {
  limpiarDatosEvaluacionPractica,
  validateEvaluacionPracticaClaseParam,
  validateEvaluacionPracticaCreate,
  validateEvaluacionPracticaIdParam,
  validateEvaluacionPracticaUpdate,
} from "../validations/evaluacionPractica.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

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
      "No se encontro un profesor asociado al usuario autenticado"
    );
    return null;
  }

  return Number(idProfesor);
}

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

function validarClaseEvaluable(clase) {
  const estado = clase.estado || clase.clase_estado;

  if (estado === "Cancelada") {
    return {
      valido: false,
      statusCode: 409,
      mensaje: "No se pueden evaluar clases canceladas.",
    };
  }

  if (estado !== "Realizada") {
    return {
      valido: false,
      statusCode: 409,
      mensaje: "La clase practica debe estar realizada para poder evaluarla.",
    };
  }

  return { valido: true };
}

export async function getEvaluacionesPracticasSecretariaController(req, res) {
  try {
    const evaluaciones = await getAllEvaluacionesPracticas();

    return handleSuccess(
      res,
      200,
      "Evaluaciones practicas obtenidas exitosamente",
      evaluaciones
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener evaluaciones practicas",
      error.message
    );
  }
}

export async function getEvaluacionesProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const evaluaciones = await getEvaluacionesPracticasPorProfesor(idProfesor);

    return handleSuccess(
      res,
      200,
      "Evaluaciones practicas del profesor obtenidas exitosamente",
      evaluaciones
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener evaluaciones practicas del profesor",
      error.message
    );
  }
}

export async function getEvaluacionProfesorPorClaseController(req, res) {
  try {
    const paramErrors = validateEvaluacionPracticaClaseParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const { id_clase_practica } = req.params;
    const clase = await getClasePracticaEvaluacionById(id_clase_practica);

    if (!clase) {
      return handleErrorClient(res, 404, "Clase practica no encontrada");
    }

    if (Number(clase.id_profesor) !== Number(idProfesor)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para ver la evaluacion de esta clase practica"
      );
    }

    const evaluacion = await getEvaluacionPracticaPorClase(id_clase_practica);

    if (!evaluacion) {
      return handleErrorClient(res, 404, "Evaluacion practica no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Evaluacion practica obtenida exitosamente",
      evaluacion
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener evaluacion practica",
      error.message
    );
  }
}

export async function createEvaluacionPracticaProfesorController(req, res) {
  try {
    const evaluacionData = limpiarDatosEvaluacionPractica(req.body);
    const { errors, value } = validateEvaluacionPracticaCreate(evaluacionData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de evaluacion practica invalidos",
        errors
      );
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clase = await getClasePracticaEvaluacionById(
      value.id_clase_practica
    );

    if (!clase) {
      return handleErrorClient(res, 404, "Clase practica no encontrada");
    }

    if (Number(clase.id_profesor) !== Number(idProfesor)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para evaluar esta clase practica"
      );
    }

    const reglaClase = validarClaseEvaluable(clase);

    if (!reglaClase.valido) {
      return handleErrorClient(
        res,
        reglaClase.statusCode,
        reglaClase.mensaje
      );
    }

    const evaluacionExistente = await getEvaluacionPracticaPorClase(
      value.id_clase_practica
    );

    if (evaluacionExistente) {
      return handleErrorClient(
        res,
        409,
        "La clase practica ya tiene una evaluacion registrada"
      );
    }

    const nuevaEvaluacion = await createEvaluacionPractica(clase, value);

    return handleSuccess(
      res,
      201,
      "Evaluacion practica registrada exitosamente",
      nuevaEvaluacion
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al registrar evaluacion practica",
      error.message
    );
  }
}

export async function updateEvaluacionPracticaProfesorController(req, res) {
  try {
    const paramErrors = validateEvaluacionPracticaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(res, 400, "Parametros invalidos", paramErrors);
    }

    const evaluacionData = limpiarDatosEvaluacionPractica(req.body);
    const { errors, value } = validateEvaluacionPracticaUpdate(evaluacionData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de evaluacion practica invalidos",
        errors
      );
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const { id } = req.params;
    const evaluacionActual = await getEvaluacionPracticaById(id);

    if (!evaluacionActual) {
      return handleErrorClient(res, 404, "Evaluacion practica no encontrada");
    }

    if (Number(evaluacionActual.clase_id_profesor) !== Number(idProfesor)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para modificar esta evaluacion practica"
      );
    }

    const reglaClase = validarClaseEvaluable(evaluacionActual);

    if (!reglaClase.valido) {
      return handleErrorClient(
        res,
        reglaClase.statusCode,
        reglaClase.mensaje
      );
    }

    const evaluacionActualizada = await updateEvaluacionPractica(id, value);

    return handleSuccess(
      res,
      200,
      "Evaluacion practica actualizada exitosamente",
      evaluacionActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar evaluacion practica",
      error.message
    );
  }
}

export async function getEvaluacionesAlumnoController(req, res) {
  try {
    const idAlumno = await obtenerAlumnoAutenticado(req, res);

    if (!idAlumno) return;

    const evaluaciones = await getEvaluacionesPracticasPorAlumno(idAlumno);

    return handleSuccess(
      res,
      200,
      "Evaluaciones practicas del alumno obtenidas exitosamente",
      evaluaciones
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener evaluaciones practicas del alumno",
      error.message
    );
  }
}
