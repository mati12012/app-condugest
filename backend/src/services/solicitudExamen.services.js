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
      fecha_matricula,
      cantidad_clases_practicas,
      cantidad_clases_teoricas,
      valor_total
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

function calcularPorcentajeAsistencia(presentes, total) {
  const totalClases = Number(total || 0);

  if (totalClases <= 0) return 0;

  const porcentaje = (Number(presentes || 0) / totalClases) * 100;

  return Math.min(100, Math.round(porcentaje * 100) / 100);
}

function obtenerEstadoPago(valorTotal, totalPagado) {
  if (Number(totalPagado || 0) >= Number(valorTotal || 0) && Number(valorTotal || 0) > 0) {
    return "Pagado";
  }

  if (Number(totalPagado || 0) > 0) {
    return "Parcial";
  }

  return "Pendiente";
}

export async function getBloqueosSolicitudExamenAlumno(idAlumno) {
  const solicitudes = await AppDataSource.query(
    `
    SELECT
      id_solicitud_examen,
      estado,
      resultado_examen
    FROM solicitudes_examen
    WHERE id_alumno = $1
    `,
    [Number(idAlumno)]
  );

  return {
    tiene_solicitud_pendiente: solicitudes.some(
      (solicitud) => solicitud.estado === "Pendiente"
    ),
    tiene_solicitud_aprobada_o_gestionada_pendiente: solicitudes.some(
      (solicitud) =>
        ["Aprobada", "Gestionada"].includes(solicitud.estado) &&
        solicitud.resultado_examen === "Pendiente"
    ),
    tiene_examen_aprobado: solicitudes.some(
      (solicitud) => solicitud.resultado_examen === "Aprobado"
    ),
  };
}

export async function getRequisitosExamenAlumno(idAlumno) {
  const matricula = await getMatriculaValidaMasRecienteAlumno(idAlumno);
  const motivosBloqueo = [];

  if (!matricula) {
    return {
      porcentaje_asistencia_practica: 0,
      porcentaje_asistencia_teorica: 0,
      cumple_asistencia_practica: false,
      cumple_asistencia_teorica: false,
      tiene_evaluaciones: false,
      estado_pago: "Sin matricula valida",
      saldo_pendiente: 0,
      puede_solicitar: false,
      motivos_bloqueo: [
        "Debes tener una matricula activa o finalizada para solicitar examen municipal",
      ],
      cumple_matricula: false,
      sin_solicitud_pendiente: true,
      sin_solicitud_aprobada_o_gestionada_pendiente: true,
      sin_examen_aprobado: true,
    };
  }

  const [
    asistenciaPracticaResultado,
    asistenciaTeoricaResultado,
    evaluacionesResultado,
    pagosResultado,
    bloqueos,
  ] = await Promise.all([
    AppDataSource.query(
      `
      SELECT
        COUNT(*)::int AS total_registros,
        COUNT(*) FILTER (
          WHERE COALESCE(ap.estado_asistencia, cp.asistencia, 'Pendiente') = 'Presente'
        )::int AS presentes
      FROM clases_practicas cp
      LEFT JOIN asistencias_practicas ap
        ON ap.id_clase_practica = cp.id_clase_practica
      WHERE cp.id_alumno = $1
      `,
      [Number(idAlumno)]
    ),
    AppDataSource.query(
      `
      SELECT
        COUNT(*)::int AS total_registros,
        COUNT(*) FILTER (
          WHERE ast.estado_asistencia = 'Presente'
        )::int AS presentes
      FROM asistencias_teoricas ast
      INNER JOIN clases_teoricas ct
        ON ct.id_clase_teorica = ast.id_clase_teorica
      WHERE ast.id_alumno = $1
        AND ct.estado <> 'Cancelada'
      `,
      [Number(idAlumno)]
    ),
    AppDataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM evaluaciones_practicas
      WHERE id_alumno = $1
      `,
      [Number(idAlumno)]
    ),
    AppDataSource.query(
      `
      SELECT COALESCE(SUM(monto), 0)::int AS total_pagado
      FROM pagos
      WHERE id_matricula = $1
        AND estado = 'Registrado'
      `,
      [Number(matricula.id_matricula)]
    ),
    getBloqueosSolicitudExamenAlumno(idAlumno),
  ]);

  const asistenciaPractica = asistenciaPracticaResultado[0] || {};
  const asistenciaTeorica = asistenciaTeoricaResultado[0] || {};
  const totalPracticas = Number(matricula.cantidad_clases_practicas || 0) > 0
    ? Number(matricula.cantidad_clases_practicas)
    : Number(asistenciaPractica.total_registros || 0);
  const totalTeoricas = Number(matricula.cantidad_clases_teoricas || 0) > 0
    ? Number(matricula.cantidad_clases_teoricas)
    : Number(asistenciaTeorica.total_registros || 0);
  const porcentajeAsistenciaPractica = calcularPorcentajeAsistencia(
    asistenciaPractica.presentes,
    totalPracticas
  );
  const porcentajeAsistenciaTeorica = calcularPorcentajeAsistencia(
    asistenciaTeorica.presentes,
    totalTeoricas
  );
  const cumpleAsistenciaPractica = porcentajeAsistenciaPractica >= 80;
  const cumpleAsistenciaTeorica = porcentajeAsistenciaTeorica >= 80;
  const tieneEvaluaciones = Number(evaluacionesResultado[0]?.total || 0) > 0;
  const valorTotal = Number(matricula.valor_total || 0);
  const totalPagado = Number(pagosResultado[0]?.total_pagado || 0);
  const saldoPendiente = Math.max(valorTotal - totalPagado, 0);

  if (bloqueos.tiene_solicitud_pendiente) {
    motivosBloqueo.push("Ya tienes una solicitud de examen pendiente");
  }

  if (bloqueos.tiene_solicitud_aprobada_o_gestionada_pendiente) {
    motivosBloqueo.push(
      "Ya tienes una solicitud aprobada o gestionada con resultado pendiente"
    );
  }

  if (bloqueos.tiene_examen_aprobado) {
    motivosBloqueo.push("Ya tienes un examen municipal aprobado");
  }

  if (!cumpleAsistenciaPractica || !cumpleAsistenciaTeorica) {
    motivosBloqueo.push(
      "No cumples el porcentaje mínimo de asistencia requerido para solicitar examen."
    );
  }

  if (!tieneEvaluaciones) {
    motivosBloqueo.push("Aún no tienes evaluaciones prácticas registradas.");
  }

  return {
    porcentaje_asistencia_practica: porcentajeAsistenciaPractica,
    porcentaje_asistencia_teorica: porcentajeAsistenciaTeorica,
    cumple_asistencia_practica: cumpleAsistenciaPractica,
    cumple_asistencia_teorica: cumpleAsistenciaTeorica,
    tiene_evaluaciones: tieneEvaluaciones,
    estado_pago: obtenerEstadoPago(valorTotal, totalPagado),
    saldo_pendiente: saldoPendiente,
    puede_solicitar: motivosBloqueo.length === 0,
    motivos_bloqueo: motivosBloqueo,
    cumple_matricula: true,
    sin_solicitud_pendiente: !bloqueos.tiene_solicitud_pendiente,
    sin_solicitud_aprobada_o_gestionada_pendiente:
      !bloqueos.tiene_solicitud_aprobada_o_gestionada_pendiente,
    sin_examen_aprobado: !bloqueos.tiene_examen_aprobado,
  };
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
