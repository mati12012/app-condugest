import {
  createProfesor,
  deleteProfesor,
  generarCorreoInstitucionalUnico,
  getAllProfesores,
  getProfesorByCorreoPersonal,
  getProfesorById,
  getProfesorByRut,
  updateProfesor,
} from "../services/profesor.services.js";

import {
  validateProfesorCreate,
  validateProfesorIdParam,
  validateProfesorUpdate,
} from "../validations/profesor.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

import { crearUsuarioAuth } from "../services/auth.services.js";

function limpiarDatosProfesor(data) {
  return {
    ...data,


  };
}
export async function getProfesoresController(req, res) {
  try {
    const profesores = await getAllProfesores();

    return handleSuccess(
      res,
      200,
      "Profesores obtenidos exitosamente",
      profesores
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener profesores",
      error.message
    );
  }
}

export async function getProfesorController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const profesor = await getProfesorById(id);

    if (!profesor) {
      return handleErrorClient(
        res,
        404,
        "Profesor no encontrado"
      );
    }

    return handleSuccess(
      res,
      200,
      "Profesor obtenido exitosamente",
      profesor
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener profesor",
      error.message
    );
  }
}

export async function createProfesorController(req, res) {
  try {
    const profesorData = limpiarDatosProfesor(req.body);

    const validationErrors = validateProfesorCreate(profesorData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de profesor inválidos",
        validationErrors
      );
    }

    const rutExistente = await getProfesorByRut(profesorData.rut);

    if (rutExistente) {
      return handleErrorClient(
        res,
        409,
        "Ya existe un profesor registrado con ese RUT"
      );
    }

    if (profesorData.correo_personal) {
      const correoPersonalExistente = await getProfesorByCorreoPersonal(
        profesorData.correo_personal
      );

      if (correoPersonalExistente) {
        return handleErrorClient(
          res,
          409,
          "Ya existe un profesor registrado con ese correo personal"
        );
      }
    }

    const correoInstitucional = await generarCorreoInstitucionalUnico(
      profesorData.nombre,
      profesorData.apellido
    );

    const nuevoProfesor = await createProfesor({
      ...profesorData,
      correo_institucional: correoInstitucional,
      estado: profesorData.estado ?? true,
    });
    
    await crearUsuarioAuth({
      correo: nuevoProfesor.correo_institucional,
      password: "Profesor1234",
      rol: "profesor",
      id_profesor: nuevoProfesor.id_profesor,
      id_alumno: null,
      estado: nuevoProfesor.estado,
      debe_cambiar_password: true,
    });

    return handleSuccess(
      res,
      201,
      "Profesor creado exitosamente",
      nuevoProfesor
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear profesor",
      error.message
    );
  }
}

export async function updateProfesorController(req, res) {
  try {
    const { id } = req.params;
    const profesorData = limpiarDatosProfesor(req.body);

    const paramErrors = validateProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const validationErrors = validateProfesorUpdate(profesorData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de profesor inválidos",
        validationErrors
      );
    }

    const profesorExistente = await getProfesorById(id);

    if (!profesorExistente) {
      return handleErrorClient(
        res,
        404,
        "Profesor no encontrado"
      );
    }

    if (
      profesorData.rut &&
      profesorData.rut !== profesorExistente.rut
    ) {
      const rutExistente = await getProfesorByRut(profesorData.rut);

      if (rutExistente) {
        return handleErrorClient(
          res,
          409,
          "Ya existe otro profesor registrado con ese RUT"
        );
      }
    }

    if (
      profesorData.correo_personal &&
      profesorData.correo_personal !== profesorExistente.correo_personal
    ) {
      const correoPersonalExistente = await getProfesorByCorreoPersonal(
        profesorData.correo_personal
      );

      if (correoPersonalExistente) {
        return handleErrorClient(
          res,
          409,
          "Ya existe otro profesor registrado con ese correo personal"
        );
      }
    }

    delete profesorData.correo_institucional;

    const profesorActualizado = await updateProfesor(id, profesorData);

    return handleSuccess(
      res,
      200,
      "Profesor actualizado exitosamente",
      profesorActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar profesor",
      error.message
    );
  }
}

export async function deleteProfesorController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validateProfesorIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const profesorEliminado = await deleteProfesor(id);

    if (!profesorEliminado) {
      return handleErrorClient(
        res,
        404,
        "Profesor no encontrado"
      );
    }

    return handleSuccess(
      res,
      200,
      "Profesor eliminado exitosamente",
      profesorEliminado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar profesor",
      error.message
    );
  }
}