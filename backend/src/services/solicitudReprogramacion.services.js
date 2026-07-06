import { AppDataSource } from "../config/configDb.js";
import SolicitudReprogramacion from "../entitys/solicitudReprogramacion.entity.js";

function solicitudReprogramacionRepository() {
  return AppDataSource.getRepository(SolicitudReprogramacion);
}

const SELECT_DETALLE_REPROGRAMACION = `
  SELECT
    sr.id_solicitud,
    sr.id_alumno,
    sr.id_clase_practica,
    sr.motivo,
    sr.fecha_solicitada,
    sr.hora_inicio_solicitada,
    sr.hora_fin_solicitada,
    sr.estado,
    sr.respuesta_secretaria,
    sr.fecha_solicitud,

    a.nombre AS alumno_nombre,
    a.apellido AS alumno_apellido,
    a.rut AS alumno_rut,
    a.correo AS alumno_correo,

    cp.fecha AS clase_fecha,
    cp.hora_inicio AS clase_hora_inicio,
    cp.hora_fin AS clase_hora_fin,
    cp.estado AS clase_estado,
    cp.sede AS clase_sede,

    p.nombre AS profesor_nombre,
    p.apellido AS profesor_apellido,

    v.patente AS vehiculo_patente,
    v.marca AS vehiculo_marca,
    v.modelo AS vehiculo_modelo
  FROM solicitudes_reprogramacion sr
  INNER JOIN alumnos a
    ON sr.id_alumno = a.id_alumno
  INNER JOIN clases_practicas cp
    ON sr.id_clase_practica = cp.id_clase_practica
  INNER JOIN profesores p
    ON cp.id_profesor = p.id_profesor
  INNER JOIN vehiculos v
    ON cp.id_vehiculo = v.id_vehiculo
`;

export async function getClasePracticaReprogramacionById(idClasePractica) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      id_clase_practica,
      id_alumno,
      id_profesor,
      id_vehiculo,
      fecha,
      hora_inicio,
      hora_fin,
      sede,
      estado
    FROM clases_practicas
    WHERE id_clase_practica = $1
    LIMIT 1
    `,
    [Number(idClasePractica)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function getSolicitudPendientePorClase(idClasePractica) {
  const resultado = await AppDataSource.query(
    `
    SELECT id_solicitud
    FROM solicitudes_reprogramacion
    WHERE id_clase_practica = $1
      AND estado = 'Pendiente'
    LIMIT 1
    `,
    [Number(idClasePractica)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function createSolicitudReprogramacion(idAlumno, data) {
  const nuevaSolicitud = solicitudReprogramacionRepository().create({
    ...data,
    id_alumno: Number(idAlumno),
    estado: "Pendiente",
  });

  const solicitudGuardada = await solicitudReprogramacionRepository().save(
    nuevaSolicitud
  );

  return await getSolicitudReprogramacionById(
    solicitudGuardada.id_solicitud
  );
}

export async function getAllSolicitudesReprogramacion() {
  return await AppDataSource.query(`
    ${SELECT_DETALLE_REPROGRAMACION}
    ORDER BY sr.fecha_solicitud DESC, sr.id_solicitud DESC
  `);
}

export async function getSolicitudesReprogramacionPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `
    ${SELECT_DETALLE_REPROGRAMACION}
    WHERE sr.id_alumno = $1
    ORDER BY sr.fecha_solicitud DESC, sr.id_solicitud DESC
    `,
    [Number(idAlumno)]
  );
}

export async function getSolicitudReprogramacionById(idSolicitud) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_REPROGRAMACION}
    WHERE sr.id_solicitud = $1
    LIMIT 1
    `,
    [Number(idSolicitud)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function updateSolicitudReprogramacion(idSolicitud, data) {
  const solicitud = await solicitudReprogramacionRepository().findOne({
    where: {
      id_solicitud: Number(idSolicitud),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudReprogramacionRepository().update(
    { id_solicitud: Number(idSolicitud) },
    data
  );

  return await getSolicitudReprogramacionById(idSolicitud);
}
