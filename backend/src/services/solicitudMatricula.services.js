import { AppDataSource } from "../config/configDb.js";
import Plan from "../entitys/plan.entity.js";
import SolicitudMatricula from "../entitys/solicitudMatricula.entity.js";
import {
  crearAlumnoConUsuario,
  getAlumnoByRutOrCorreo,
} from "./alumno.services.js";
import {
  createMatriculaDesdePlan,
} from "./matricula.services.js";
import { validateAlumnoData } from "../validations/alumno.validation.js";
import {
  normalizarEmail,
  normalizarRutBasico,
  normalizarTexto,
} from "../validations/common.validation.js";

function solicitudRepository() {
  return AppDataSource.getRepository(SolicitudMatricula);
}

function planRepository() {
  return AppDataSource.getRepository(Plan);
}

export class SolicitudMatriculaBusinessError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = "SolicitudMatriculaBusinessError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function getPlanActivoById(idPlan) {
  return await planRepository().findOne({
    where: {
      id_plan: Number(idPlan),
      estado: "Activo",
    },
  });
}

export async function createSolicitudMatricula(solicitudData) {
  const nuevaSolicitud = solicitudRepository().create({
    ...solicitudData,
    estado: "Pendiente",
  });

  return await solicitudRepository().save(nuevaSolicitud);
}

export async function getAllSolicitudesMatricula() {
  return await AppDataSource.query(`
    SELECT
      sm.id_solicitud,
      sm.nombre,
      sm.apellido,
      sm.rut,
      sm.correo,
      sm.telefono,
      sm.id_plan,
      sm.mensaje,
      sm.estado,
      sm.fecha_solicitud,
      p.nombre AS plan_nombre,
      p.tipo AS plan_tipo,
      p.valor AS plan_valor
    FROM solicitudes_matricula sm
    INNER JOIN planes p ON sm.id_plan = p.id_plan
    ORDER BY sm.fecha_solicitud DESC, sm.id_solicitud DESC
  `);
}

export async function getSolicitudMatriculaDetalleById(id, manager = AppDataSource.manager) {
  const resultado = await manager.query(
    `
    SELECT
      sm.id_solicitud,
      sm.nombre,
      sm.apellido,
      sm.rut,
      sm.correo,
      sm.telefono,
      sm.id_plan,
      sm.mensaje,
      sm.estado,
      sm.fecha_solicitud,
      p.nombre AS plan_nombre,
      p.descripcion AS plan_descripcion,
      p.cantidad_clases_practicas AS plan_clases_practicas,
      p.cantidad_clases_teoricas AS plan_clases_teoricas,
      p.valor AS plan_valor,
      p.tipo AS plan_tipo,
      p.estado AS plan_estado
    FROM solicitudes_matricula sm
    INNER JOIN planes p ON sm.id_plan = p.id_plan
    WHERE sm.id_solicitud = $1
    LIMIT 1
    `,
    [Number(id)]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function updateSolicitudMatricula(id, solicitudData) {
  const solicitud = await solicitudRepository().findOne({
    where: {
      id_solicitud: Number(id),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudRepository().update(
    { id_solicitud: Number(id) },
    solicitudData
  );

  return await getSolicitudMatriculaDetalleById(id);
}

function obtenerLicenciaDesdePlan(plan) {
  const textoPlan = `${plan?.nombre || ""} ${plan?.descripcion || ""}`.toLowerCase();

  if (textoPlan.includes("clase c") || textoPlan.includes("licencia c")) {
    return "Clase C";
  }

  if (textoPlan.includes("a2") || textoPlan.includes("clase a2")) {
    return "Clase A2";
  }

  return "Clase B";
}

function construirAlumnoDesdeSolicitud(solicitud, plan) {
  const totalClases = Math.max(
    Number(plan.cantidad_clases_practicas || 0),
    Number(plan.cantidad_clases_teoricas || 0),
    1
  );

  return {
    rut: normalizarRutBasico(solicitud.rut),
    nombre: normalizarTexto(solicitud.nombre),
    apellido: normalizarTexto(solicitud.apellido),
    correo: "autogenerado@condugest.cl",
    licencia: obtenerLicenciaDesdePlan(plan),
    sede: "Sede Concepcion",
    clases_completadas: 0,
    total_clases: totalClases,
    estado: "Matriculado",
  };
}

async function getMatriculaActivaPorAlumnoTransaccion(manager, idAlumno) {
  const resultado = await manager.query(
    `
    SELECT
      id_matricula,
      id_alumno,
      id_plan,
      estado
    FROM matriculas
    WHERE id_alumno = $1
      AND estado = 'Activa'
    LIMIT 1
    `,
    [Number(idAlumno)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function matricularSolicitudMatricula(idSolicitud) {
  return await AppDataSource.transaction(async (manager) => {
    const solicitudRepo = manager.getRepository(SolicitudMatricula);
    const planRepo = manager.getRepository(Plan);

    const solicitud = await solicitudRepo.findOne({
      where: {
        id_solicitud: Number(idSolicitud),
      },
    });

    if (!solicitud) {
      throw new SolicitudMatriculaBusinessError(
        "Solicitud de matricula no encontrada",
        404
      );
    }

    if (!solicitud.id_plan) {
      throw new SolicitudMatriculaBusinessError(
        "No se puede matricular una solicitud sin plan asociado.",
        400
      );
    }

    const planActivo = await planRepo.findOne({
      where: {
        id_plan: Number(solicitud.id_plan),
        estado: "Activo",
      },
    });

    if (!planActivo) {
      throw new SolicitudMatriculaBusinessError(
        "El plan seleccionado no existe o no se encuentra activo",
        404
      );
    }

    const rutSolicitud = normalizarRutBasico(solicitud.rut);
    const correoSolicitud = normalizarEmail(solicitud.correo);
    let alumno = await getAlumnoByRutOrCorreo(
      rutSolicitud,
      correoSolicitud,
      manager
    );
    const alumnoExistente = Boolean(alumno);

    if (alumno) {
      const matriculaActiva = await getMatriculaActivaPorAlumnoTransaccion(
        manager,
        alumno.id_alumno
      );

      if (matriculaActiva) {
        throw new SolicitudMatriculaBusinessError(
          "El alumno ya tiene una matrícula activa.",
          409
        );
      }
    } else {
      const alumnoData = construirAlumnoDesdeSolicitud(solicitud, planActivo);
      const validationErrors = validateAlumnoData(alumnoData);

      if (validationErrors.length > 0) {
        throw new SolicitudMatriculaBusinessError(
          "Datos del alumno invalidos",
          400,
          validationErrors
        );
      }

      alumno = await crearAlumnoConUsuario(alumnoData, manager);
    }

    const matricula = await createMatriculaDesdePlan({
      id_alumno: alumno.id_alumno,
      plan: planActivo,
      manager,
    });

    await solicitudRepo.update(
      { id_solicitud: Number(idSolicitud) },
      { estado: "Matriculado" }
    );

    const solicitudActualizada = await getSolicitudMatriculaDetalleById(
      idSolicitud,
      manager
    );

    return {
      solicitud: solicitudActualizada,
      alumno,
      matricula,
      alumno_existente: alumnoExistente,
    };
  });
}

export async function deleteSolicitudMatricula(id) {
  const solicitud = await solicitudRepository().findOne({
    where: {
      id_solicitud: Number(id),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudRepository().remove(solicitud);

  return solicitud;
}
