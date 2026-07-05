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
      a.licencia,
      a.sede,
      COALESCE(m.cantidad_clases_practicas, a.total_clases, 0)::int AS total_clases,
      COALESCE((
        SELECT COUNT(*)
        FROM clases_practicas cp
        WHERE cp.id_alumno = a.id_alumno
          AND cp.asistencia = 'Presente'
      ), 0)::int AS clases_completadas
    FROM alumnos a
    LEFT JOIN LATERAL (
      SELECT cantidad_clases_practicas
      FROM matriculas
      WHERE id_alumno = a.id_alumno
        AND estado = 'Activa'
      ORDER BY fecha_matricula DESC, id_matricula DESC
      LIMIT 1
    ) m ON true
    WHERE a.id_alumno = $1
    `,
    [idAlumno]
  );
  
  if (resultado.length === 0) return null;

  const alumno = resultado[0];

  return {
    plan: `Plan ${alumno.total_clases} Clases`,
    licencia: alumno.licencia,
    sede: alumno.sede,
    clases_completadas: alumno.clases_completadas,
    total_clases: alumno.total_clases
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
