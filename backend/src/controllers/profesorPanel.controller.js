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
  getAlumnosDisponiblesClaseTeorica,
  getAlumnosInscritosClaseTeorica,
  getAlumnoParaInscripcionTeorica,
  getInscripcionTeorica,
  getResumenCapacidadClaseTeorica,
  inscribirAlumnoClaseTeorica,
  quitarAlumnoClaseTeorica,
  getAsistenciaTeoricaProfesorById,
  actualizarRecursosClaseTeoricaProfesor,
  registrarAsistenciaTeorica,
} from "../services/profesorPanel.services.js";

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

function esModalidadHibrida(modalidad) {
  return modalidad === "Híbrida" || modalidad === "Hibrida";
}

function normalizarModoParticipacion(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) return null;
  if (texto.toLowerCase() === "presencial") return "Presencial";
  if (texto.toLowerCase() === "online") return "Online";

  return texto;
}

async function obtenerClaseTeoricaProfesorAutorizada(req, res, idProfesor) {
  const claseProfesor = await getClaseTeoricaProfesorById(
    req.params.idClase,
    idProfesor
  );

  if (!claseProfesor) {
    handleErrorClient(res, 404, "Clase teorica no encontrada");
    return null;
  }

  if (!claseProfesor.perteneceProfesor) {
    handleErrorClient(
      res,
      403,
      "No tienes permisos para gestionar alumnos de esta clase teorica"
    );
    return null;
  }

  return claseProfesor.clase;
}

function clasePermiteGestionarInscritos(clase) {
  return !["Cancelada", "Realizada"].includes(clase.estado);
}

function resolverModoParticipacion(clase, alumno, modoSolicitado) {
  const modo = normalizarModoParticipacion(modoSolicitado);
  const modalidad = clase.modalidad;
  const mismaSede = alumno.sede === clase.sede;

  if (modalidad === "Presencial") {
    if (modo && modo !== "Presencial") {
      return {
        error: "Las clases presenciales solo permiten participacion presencial.",
      };
    }

    if (!mismaSede) {
      return {
        error: "Solo se pueden inscribir alumnos de la misma sede en clases presenciales.",
      };
    }

    return { modo: "Presencial" };
  }

  if (modalidad === "Online") {
    if (modo && modo !== "Online") {
      return {
        error: "Las clases online solo permiten participacion online.",
      };
    }

    return { modo: "Online" };
  }

  if (esModalidadHibrida(modalidad)) {
    if (!["Presencial", "Online"].includes(modo)) {
      return {
        error: "Debe seleccionar modo de participacion Presencial u Online.",
      };
    }

    if (!mismaSede && modo === "Presencial") {
      return {
        error: "Los alumnos de otra sede solo pueden participar online en clases hibridas.",
      };
    }

    return { modo };
  }

  return {
    error: "La modalidad de la clase teorica no es valida.",
  };
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

    const [inscritos, capacidad] = await Promise.all([
      getAlumnosInscritosClaseTeorica(req.params.idClase),
      getResumenCapacidadClaseTeorica(req.params.idClase),
    ]);

    return handleSuccess(res, 200, "Alumnos de la clase", {
      clase: claseProfesor.clase,
      alumnos: inscritos,
      capacidad,
    });
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function getAlumnosDisponiblesClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clase = await obtenerClaseTeoricaProfesorAutorizada(req, res, idProfesor);

    if (!clase) return;

    const [alumnos, capacidad] = await Promise.all([
      getAlumnosDisponiblesClaseTeorica(clase),
      getResumenCapacidadClaseTeorica(req.params.idClase),
    ]);

    return handleSuccess(res, 200, "Alumnos disponibles para la clase", {
      clase,
      alumnos,
      capacidad,
    });
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener alumnos disponibles",
      error.message
    );
  }
}

export async function getAlumnosInscritosClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clase = await obtenerClaseTeoricaProfesorAutorizada(req, res, idProfesor);

    if (!clase) return;

    const [alumnos, capacidad] = await Promise.all([
      getAlumnosInscritosClaseTeorica(req.params.idClase),
      getResumenCapacidadClaseTeorica(req.params.idClase),
    ]);

    return handleSuccess(res, 200, "Alumnos inscritos en la clase", {
      clase,
      alumnos,
      capacidad,
    });
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener alumnos inscritos",
      error.message
    );
  }
}

export async function inscribirAlumnoClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clase = await obtenerClaseTeoricaProfesorAutorizada(req, res, idProfesor);

    if (!clase) return;

    if (!clasePermiteGestionarInscritos(clase)) {
      return handleErrorClient(
        res,
        400,
        "No se pueden inscribir alumnos en una clase cancelada o realizada."
      );
    }

    const idAlumno = Number(req.body?.id_alumno);

    if (!idAlumno) {
      return handleErrorClient(res, 400, "Debe seleccionar un alumno.");
    }

    const alumno = await getAlumnoParaInscripcionTeorica(idAlumno);

    if (!alumno) {
      return handleErrorClient(res, 404, "Alumno no encontrado");
    }

    const inscripcionExistente = await getInscripcionTeorica(
      req.params.idClase,
      idAlumno
    );

    if (inscripcionExistente) {
      return handleErrorClient(
        res,
        409,
        "El alumno ya esta inscrito en esta clase teorica."
      );
    }

    const resultadoModo = resolverModoParticipacion(
      clase,
      alumno,
      req.body?.modo_participacion
    );

    if (resultadoModo.error) {
      return handleErrorClient(res, 400, resultadoModo.error);
    }

    if (resultadoModo.modo === "Presencial") {
      const capacidad = await getResumenCapacidadClaseTeorica(req.params.idClase);

      if (!capacidad?.capacidad_sala) {
        return handleErrorClient(
          res,
          400,
          "La clase no tiene una sala teorica con capacidad configurada."
        );
      }

      if (capacidad.capacidad_presencial_usada >= capacidad.capacidad_sala) {
        return handleErrorClient(
          res,
          409,
          "La sala teorica ya alcanzo su capacidad presencial."
        );
      }
    }

    const inscripcion = await inscribirAlumnoClaseTeorica(
      req.params.idClase,
      idAlumno,
      resultadoModo.modo
    );

    return handleSuccess(
      res,
      201,
      "Alumno inscrito correctamente en la clase teorica.",
      inscripcion
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al inscribir alumno en la clase teorica",
      error.message
    );
  }
}

export async function quitarAlumnoClaseTeoricaProfesorController(req, res) {
  try {
    const idProfesor = await obtenerProfesorAutenticado(req, res);

    if (!idProfesor) return;

    const clase = await obtenerClaseTeoricaProfesorAutorizada(req, res, idProfesor);

    if (!clase) return;

    if (!clasePermiteGestionarInscritos(clase)) {
      return handleErrorClient(
        res,
        400,
        "No se pueden modificar inscritos en una clase cancelada o realizada."
      );
    }

    const inscripcionEliminada = await quitarAlumnoClaseTeorica(
      req.params.idClase,
      req.params.idAlumno
    );

    if (!inscripcionEliminada) {
      return handleErrorClient(
        res,
        404,
        "El alumno no esta inscrito en esta clase teorica."
      );
    }

    return handleSuccess(
      res,
      200,
      "Alumno removido de la clase teorica.",
      inscripcionEliminada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al remover alumno de la clase teorica",
      error.message
    );
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
