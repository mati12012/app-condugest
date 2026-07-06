import { AppDataSource } from "../config/configDb.js";

export async function getAlumnoIdDesdeUsuario(idUsuario) {
  const resultado = await AppDataSource.query(
    `SELECT id_alumno FROM usuarios WHERE id_usuario = $1 AND rol = 'alumno'`,
    [idUsuario]
  );
  return resultado.length > 0 ? resultado[0].id_alumno : null;
}

export async function getPerfilAlumno(idAlumno) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      a.id_alumno,
      a.licencia,
      a.sede,
      m.id_matricula,
      m.estado AS estado_matricula,
      m.cantidad_clases_practicas,
      m.valor_total,
      p.nombre AS nombre_plan,
      p.tipo AS tipo_plan,
      COALESCE((
        SELECT COUNT(*)
        FROM clases_practicas cp
        WHERE cp.id_alumno = a.id_alumno
          AND cp.estado = 'Realizada'
          AND cp.asistencia = 'Presente'
      ), 0)::int AS clases_practicas_realizadas,
      COALESCE((
        SELECT SUM(pg.monto)
        FROM pagos pg
        WHERE pg.id_matricula = m.id_matricula
          AND pg.estado = 'Registrado'
      ), 0)::int AS total_pagado
    FROM alumnos a
    LEFT JOIN LATERAL (
      SELECT
        id_matricula,
        id_plan,
        cantidad_clases_practicas,
        valor_total,
        estado
      FROM matriculas
      WHERE id_alumno = a.id_alumno
        AND estado = 'Activa'
      ORDER BY fecha_matricula DESC, id_matricula DESC
      LIMIT 1
    ) m ON true
    LEFT JOIN planes p
      ON p.id_plan = m.id_plan
    WHERE a.id_alumno = $1
    `,
    [idAlumno]
  );
  
  if (resultado.length === 0) return null;

  const alumno = resultado[0];
  const tieneMatriculaActiva = Boolean(alumno.id_matricula);
  const totalClasesPracticas = tieneMatriculaActiva
    ? Number(alumno.cantidad_clases_practicas || 0)
    : 0;
  const clasesPracticasRealizadas = tieneMatriculaActiva
    ? Number(alumno.clases_practicas_realizadas || 0)
    : 0;
  const valorTotal = Number(alumno.valor_total || 0);
  const totalPagado = Number(alumno.total_pagado || 0);
  const saldoPendiente = Math.max(valorTotal - totalPagado, 0);

  let estadoPago = "Pendiente";

  if (totalPagado > 0 && totalPagado < valorTotal) {
    estadoPago = "Parcial";
  }

  if (totalPagado >= valorTotal && valorTotal > 0) {
    estadoPago = "Pagado";
  }

  return {
    licencia: alumno.licencia,
    sede: alumno.sede,
    id_matricula: tieneMatriculaActiva ? Number(alumno.id_matricula) : null,
    nombre_plan: tieneMatriculaActiva ? alumno.nombre_plan : "Sin matrícula activa",
    tipo_plan: tieneMatriculaActiva ? alumno.tipo_plan : null,
    total_clases_practicas: totalClasesPracticas,
    clases_practicas_realizadas: clasesPracticasRealizadas,
    clases_practicas_restantes: Math.max(
      totalClasesPracticas - clasesPracticasRealizadas,
      0
    ),
    valor_total: valorTotal,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    estado_pago: estadoPago,
    estado_matricula: tieneMatriculaActiva
      ? alumno.estado_matricula
      : "Sin matrícula activa",
    mensaje: tieneMatriculaActiva ? null : "Sin matrícula activa",

    // Alias temporales para compatibilidad con componentes antiguos del panel.
    plan: tieneMatriculaActiva ? alumno.nombre_plan : "Sin matrícula activa",
    clases_completadas: clasesPracticasRealizadas,
    total_clases: totalClasesPracticas,
  };
}

export async function getClasesPracticasPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `SELECT cp.*, 
            p.nombre AS profesor_nombre, p.apellido AS profesor_apellido,
            v.patente AS vehiculo_patente, v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo
     FROM clases_practicas cp
     INNER JOIN profesores p ON cp.id_profesor = p.id_profesor
     INNER JOIN vehiculos v ON cp.id_vehiculo = v.id_vehiculo
     WHERE cp.id_alumno = $1
     ORDER BY cp.fecha ASC, cp.hora_inicio ASC`,
    [idAlumno]
  );
}

export async function getClasesTeoricasPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `SELECT
            ct.id_clase_teorica,
            ct.fecha,
            ct.hora_inicio,
            ct.hora_fin,
            ct.estado,
            ct.tema,
            ct.sede,
            ast.id_asistencia,
            ast.estado_asistencia,
            p.nombre AS profesor_nombre,
            p.apellido AS profesor_apellido
     FROM asistencias_teoricas ast
     INNER JOIN clases_teoricas ct
       ON ast.id_clase_teorica = ct.id_clase_teorica
     LEFT JOIN profesores p ON ct.id_profesor = p.id_profesor
     WHERE ast.id_alumno = $1
     ORDER BY ct.fecha ASC, ct.hora_inicio ASC`,
    [idAlumno]
  );
}

export async function cancelarClasePractica(idClase, idAlumno) {
  const resultado = await AppDataSource.query(
    `UPDATE clases_practicas
     SET estado = 'Cancelada'
     WHERE id_clase_practica = $1 AND id_alumno = $2 AND estado = 'Programada'
     RETURNING *`,
    [idClase, idAlumno]
  );
  
  return resultado.length > 0 ? resultado[0] : null;
}
