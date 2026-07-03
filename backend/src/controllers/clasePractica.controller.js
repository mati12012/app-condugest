import {
  buscarChoqueClasePractica,
  createClasePractica,
  getAllClasesPracticas,
  getClasePracticaById,
  getClasePracticaDetalleById,
  updateClasePractica,
} from "../services/clasePractica.services.js";

import { getAlumnoById } from "../services/alumno.services.js";
import { getProfesorById } from "../services/profesor.services.js";
import { getVehiculoById } from "../services/vehiculo.services.js";

import {
  validarReglasHorarioPractica,
  validateClasePracticaCreate,
  validateClasePracticaIdParam,
  validateClasePracticaUpdate,
} from "../validations/clasePractica.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosClasePractica(data) {
  const limpio = { ...data };

  const camposNumericos = ["id_alumno", "id_profesor", "id_vehiculo"];

  camposNumericos.forEach((campo) => {
    if (
      limpio[campo] !== undefined &&
      limpio[campo] !== null &&
      limpio[campo] !== ""
    ) {
      limpio[campo] = Number(limpio[campo]);
    }
  });

  const camposTexto = [
    "fecha",
    "hora_inicio",
    "hora_fin",
    "sede",
    "estado",
    "observacion",
  ];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (limpio.observacion === "") {
    limpio.observacion = null;
  }

  return limpio;
}

function obtenerMensajeConflicto(conflicto) {
  if (!conflicto) {
    return "Existe un choque de horario";
  }

  if (conflicto.conflicto_tipo === "alumno") {
    return "El alumno ya tiene una clase práctica en ese horario";
  }

  if (conflicto.conflicto_tipo === "profesor") {
    return "El profesor ya tiene una clase práctica en ese horario";
  }

  if (conflicto.conflicto_tipo === "vehiculo") {
    return "El vehículo ya tiene una clase práctica en ese horario";
  }

  return "Existe un choque de horario con otra clase práctica";
}

export async function getClasesPracticasController(req, res) {
  try {
    const clases = await getAllClasesPracticas();

    return handleSuccess(
      res,
      200,
      "Clases prácticas obtenidas exitosamente",
      clases
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener clases prácticas",
      error.message
    );
  }
}

export async function getClasePracticaController(req, res) {
  try {
    const paramErrors = validateClasePracticaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const { id } = req.params;

    const clase = await getClasePracticaDetalleById(id);

    if (!clase) {
      return handleErrorClient(
        res,
        404,
        "Clase práctica no encontrada"
      );
    }

    return handleSuccess(
      res,
      200,
      "Clase práctica obtenida exitosamente",
      clase
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener clase práctica",
      error.message
    );
  }
}

export async function createClasePracticaController(req, res) {
  try {
    const claseData = limpiarDatosClasePractica(req.body);

    if (!claseData.estado) {
      claseData.estado = "Programada";
    }

    const validationErrors = validateClasePracticaCreate(claseData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de clase práctica inválidos",
        validationErrors
      );
    }

    const chequeoHorario = validarReglasHorarioPractica(claseData.hora_inicio, claseData.hora_fin);
    if (!chequeoHorario.valido) {
        return handleErrorClient(res, 400, "Regla de seguridad vial", [chequeoHorario.mensaje]);
    }

    const alumno = await getAlumnoById(claseData.id_alumno);

    if (!alumno) {
      return handleErrorClient(res, 404, "El alumno no existe");
    }

    const profesor = await getProfesorById(claseData.id_profesor);

    if (!profesor) {
      return handleErrorClient(res, 404, "El profesor no existe");
    }

    if (!profesor.estado) {
      return handleErrorClient(
        res,
        400,
        "El profesor se encuentra inactivo"
      );
    }

    const vehiculo = await getVehiculoById(claseData.id_vehiculo);

    if (!vehiculo) {
      return handleErrorClient(res, 404, "El vehículo no existe");
    }

    if (vehiculo.estado_operativo !== "Disponible") {
      return handleErrorClient(
        res,
        400,
        "El vehículo no se encuentra disponible"
      );
    }

    const conflicto = await buscarChoqueClasePractica({
      id_alumno: claseData.id_alumno,
      id_profesor: claseData.id_profesor,
      id_vehiculo: claseData.id_vehiculo,
      fecha: claseData.fecha,
      hora_inicio: claseData.hora_inicio,
      hora_fin: claseData.hora_fin,
    });

    if (conflicto) {
      return handleErrorClient(
        res,
        409,
        obtenerMensajeConflicto(conflicto),
        conflicto
      );
    }

    const nuevaClase = await createClasePractica(claseData);

    const claseDetalle = await getClasePracticaDetalleById(
      nuevaClase.id_clase_practica
    );

    return handleSuccess(
      res,
      201,
      "Clase práctica creada exitosamente",
      claseDetalle
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear clase práctica",
      error.message
    );
  }
}

export async function updateClasePracticaController(req, res) {
  try {
    const paramErrors = validateClasePracticaIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parámetros inválidos",
        paramErrors
      );
    }

    const { id } = req.params;
    const claseData = limpiarDatosClasePractica(req.body);

    const validationErrors = validateClasePracticaUpdate(claseData);

    if (validationErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de clase práctica inválidos",
        validationErrors
      );
    }

    const claseExistente = await getClasePracticaById(id);

    if (!claseExistente) {
      return handleErrorClient(
        res,
        404,
        "Clase práctica no encontrada"
      );
    }

    const claseFinal = {
      ...claseExistente,
      ...claseData,
    };

    const chequeoHorario = validarReglasHorarioPractica(claseFinal.hora_inicio, claseFinal.hora_fin);
    if (!chequeoHorario.valido) {
        return handleErrorClient(res, 400, "Regla de seguridad vial", [chequeoHorario.mensaje]);
    }

    const alumno = await getAlumnoById(claseFinal.id_alumno);

    if (!alumno) {
      return handleErrorClient(res, 404, "El alumno no existe");
    }

    const profesor = await getProfesorById(claseFinal.id_profesor);

    if (!profesor) {
      return handleErrorClient(res, 404, "El profesor no existe");
    }

    const vehiculo = await getVehiculoById(claseFinal.id_vehiculo);

    if (!vehiculo) {
      return handleErrorClient(res, 404, "El vehículo no existe");
    }

    if (claseFinal.estado === "Programada") {
      if (!profesor.estado) {
        return handleErrorClient(
          res,
          400,
          "El profesor se encuentra inactivo"
        );
      }

      if (vehiculo.estado_operativo !== "Disponible") {
        return handleErrorClient(
          res,
          400,
          "El vehículo no se encuentra disponible"
        );
      }

      const conflicto = await buscarChoqueClasePractica({
        id_alumno: claseFinal.id_alumno,
        id_profesor: claseFinal.id_profesor,
        id_vehiculo: claseFinal.id_vehiculo,
        fecha: claseFinal.fecha,
        hora_inicio: claseFinal.hora_inicio,
        hora_fin: claseFinal.hora_fin,
        id_clase_excluida: id,
      });

      if (conflicto) {
        return handleErrorClient(
          res,
          409,
          obtenerMensajeConflicto(conflicto),
          conflicto
        );
      }
    }

    const claseActualizada = await updateClasePractica(id, claseData);

    return handleSuccess(
      res,
      200,
      "Clase práctica actualizada exitosamente",
      claseActualizada
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar clase práctica",
      error.message
    );
  }
}