import { AppDataSource } from "../config/configDb.js";
import SolicitudExamen from "../entitys/solicitudExamen.entity.js";

function solicitudExamenRepository() {
  return AppDataSource.getRepository(SolicitudExamen);
}

const SELECT_DETALLE_SOLICITUD_EXAMEN = `
  SELECT
    se.id_solicitud_examen,
    se.id_alumno,
    se.id_matricula,
    se.tipo_vehiculo,
    se.fecha_solicitada,
    se.mensaje,
    se.estado,
    se.respuesta_secretaria,
    se.resultado_examen,
    se.fecha_solicitud,

    a.nombre AS alumno_nombre,
    a.apellido AS alumno_apellido,
    a.rut AS alumno_rut,
    a.correo AS alumno_correo,
    a.licencia AS alumno_licencia,
    a.sede AS alumno_sede,

    m.estado AS matricula_estado,
    m.fecha_matricula,
    m.valor_total,

    p.nombre AS plan_nombre,
    p.tipo AS plan_tipo
  FROM solicitudes_examen se
  INNER JOIN alumnos a
    ON se.id_alumno = a.id_alumno
  INNER JOIN matriculas m
    ON se.id_matricula = m.id_matricula
  INNER JOIN planes p
    ON m.id_plan = p.id_plan
`;

export async function getMatriculaValidaMasRecienteAlumno(idAlumno) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      id_matricula,
      id_alumno,
      estado,
      fecha_matricula
    FROM matriculas
    WHERE id_alumno = $1
      AND estado IN ('Activa', 'Finalizada')
    ORDER BY fecha_matricula DESC, id_matricula DESC
    LIMIT 1
    `,
    [Number(idAlumno)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function getSolicitudExamenPendientePorAlumno(idAlumno) {
  const resultado = await AppDataSource.query(
    `
    SELECT id_solicitud_examen
    FROM solicitudes_examen
    WHERE id_alumno = $1
      AND estado = 'Pendiente'
    LIMIT 1
    `,
    [Number(idAlumno)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function createSolicitudExamenAlumno(idAlumno, idMatricula, data) {
  const nuevaSolicitud = solicitudExamenRepository().create({
    id_alumno: Number(idAlumno),
    id_matricula: Number(idMatricula),
    tipo_vehiculo: data.tipo_vehiculo,
    fecha_solicitada: data.fecha_solicitada,
    mensaje: data.mensaje || null,
    estado: "Pendiente",
    resultado_examen: "Pendiente",
  });

  const solicitudGuardada = await solicitudExamenRepository().save(
    nuevaSolicitud
  );

  return await getSolicitudExamenById(
    solicitudGuardada.id_solicitud_examen
  );
}

export async function getSolicitudesExamenPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `
    ${SELECT_DETALLE_SOLICITUD_EXAMEN}
    WHERE se.id_alumno = $1
    ORDER BY se.fecha_solicitud DESC, se.id_solicitud_examen DESC
    `,
    [Number(idAlumno)]
  );
}

export async function getAllSolicitudesExamen() {
  return await AppDataSource.query(`
    ${SELECT_DETALLE_SOLICITUD_EXAMEN}
    ORDER BY se.fecha_solicitud DESC, se.id_solicitud_examen DESC
  `);
}

export async function getSolicitudExamenById(idSolicitudExamen) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_SOLICITUD_EXAMEN}
    WHERE se.id_solicitud_examen = $1
    LIMIT 1
    `,
    [Number(idSolicitudExamen)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function updateSolicitudExamen(idSolicitudExamen, data) {
  const solicitud = await solicitudExamenRepository().findOne({
    where: {
      id_solicitud_examen: Number(idSolicitudExamen),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudExamenRepository().update(
    { id_solicitud_examen: Number(idSolicitudExamen) },
    data
  );

  return await getSolicitudExamenById(idSolicitudExamen);
}
