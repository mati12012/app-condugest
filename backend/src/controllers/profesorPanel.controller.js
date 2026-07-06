"use strict";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

import {
  getProfesorIdDesdeUsuario,
  getMiPerfilProfesor,
  getClasesPracticasPorProfesor,
  getClasesTeoricasPorProfesor,
  getClaseTeoricaProfesorById,
  getAsistenciaTeoricaProfesorById,
  actualizarRecursosClaseTeoricaProfesor,
  registrarAsistenciaTeorica,
} from "../services/profesorPanel.services.js";

import { obtenerInscritos } from "../services/claseTeorica.services.js";
import {
  validateRecursosClaseTeorica,
} from "../validations/claseTeorica.validation.js";
import { normalizarTexto } from "../validations/common.validation.js";

const ESTADOS_ASISTENCIA_PERMITIDOS = [
  "Presente",
  "Ausente",
  "Justificado",
  "Pendiente",
];

function limpiarRecursoOpcional(valor) {
  const texto = normalizarTexto(valor);
  return texto || null;
}

function limpiarRecursosClaseTeorica(data) {
  const camposPermitidos = ["link_reunion", "codigo_reunion", "url_grabacion"];

  return camposPermitidos.reduce((recursos, campo) => {
    if (campo in data) {
      recursos[campo] = limpiarRecursoOpcional(data[campo]);
    }

    return recursos;
  }, {});
}

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
      "No se encontro un profesor asociado a este usuario"
    );
    return null;
  }

  return idProfesor;
}

export async function getMiPerfilProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const perfil = await getMiPerfilProfesor(idProfesor);

    if (!perfil) {
      return handleErrorClient(res, 404, "Perfil de profesor no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Perfil del profesor obtenido exitosamente",
      perfil
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener el perfil del profesor",
      error.message
    );
  }
}

export async function getMisClasesProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clases = await getClasesPracticasPorProfesor(idProfesor);

    return handleSuccess(
      res,
      200,
      "Clases del profesor obtenidas exitosamente",
      {
        id_profesor: idProfesor,
        clases_practicas: clases,
      }
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener las clases del profesor",
      error.message
    );
  }
}

export async function getMisClasesTeoricasController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clases = await getClasesTeoricasPorProfesor(idProfesor);

    return handleSuccess(res, 200, "Clases teoricas", clases);
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function getDetalleClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const claseProfesor = await getClaseTeoricaProfesorById(
      req.params.idClase,
      idProfesor
    );

    if (!claseProfesor) {
      return handleErrorClient(res, 404, "Clase teorica no encontrada");
    }

    if (!claseProfesor.perteneceProfesor) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para ver alumnos de esta clase teorica"
      );
    }

    const inscritos = await obtenerInscritos(req.params.idClase);

    return handleSuccess(res, 200, "Alumnos de la clase", {
      clase: claseProfesor.clase,
      alumnos: inscritos,
    });
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function updateRecursosClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const claseProfesor = await getClaseTeoricaProfesorById(
      req.params.idClase,
      idProfesor
    );

    if (!claseProfesor) {
      return handleErrorClient(res, 404, "Clase teorica no encontrada");
    }

    if (!claseProfesor.perteneceProfesor) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para editar recursos de esta clase teorica"
      );
    }

    const recursos = limpiarRecursosClaseTeorica(req.body);
    const validationErrors = validateRecursosClaseTeorica(recursos);

    if (validationErrors.length > 0) {
      return handleErrorClient(res, 400, "Recursos invalidos", validationErrors);
    }

    const recursosFinales = {
      link_reunion: "link_reunion" in recursos
        ? recursos.link_reunion
        : claseProfesor.clase.link_reunion,
      codigo_reunion: "codigo_reunion" in recursos
        ? recursos.codigo_reunion
        : claseProfesor.clase.codigo_reunion,
      url_grabacion: "url_grabacion" in recursos
        ? recursos.url_grabacion
        : claseProfesor.clase.url_grabacion,
    };

    const requiereLink = ["Online", "Híbrida", "Hibrida"].includes(
      claseProfesor.clase.modalidad
    );

    if (requiereLink && !recursosFinales.link_reunion) {
      return handleErrorClient(
        res,
        400,
        "Recursos invalidos",
        ["Para clases online o hibridas, ingresa el link de Meet/Zoom."]
      );
    }

    const claseActualizada = await actualizarRecursosClaseTeoricaProfesor(
      req.params.idClase,
      idProfesor,
      recursosFinales
    );

    return handleSuccess(
      res,
      200,
      "Recursos de clase teorica actualizados exitosamente",
      claseActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar recursos de la clase teorica",
      error.message
    );
  }
}

export async function marcarAsistenciaTeoricaController(req, res) {
  try {
    const { idAsistencia } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_ASISTENCIA_PERMITIDOS.includes(estado)) {
      return handleErrorClient(res, 400, "Estado de asistencia invalido");
    }

    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const asistenciaProfesor = await getAsistenciaTeoricaProfesorById(
      idAsistencia,
      idProfesor
    );

    if (!asistenciaProfesor) {
      return handleErrorClient(res, 404, "Asistencia teorica no encontrada");
    }

    if (!asistenciaProfesor.perteneceProfesor) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para marcar esta asistencia teorica"
      );
    }

    const asistenciaActualizada = await registrarAsistenciaTeorica(
      idAsistencia,
      estado
    );

    return handleSuccess(
      res,
      200,
      "Asistencia registrada exitosamente",
      asistenciaActualizada
    );
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}
