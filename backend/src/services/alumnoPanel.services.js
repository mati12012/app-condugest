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
    `SELECT licencia, sede, clases_completadas, total_clases FROM alumnos WHERE id_alumno = $1`,
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
    `SELECT ct.id_clase_teorica, ct.fecha, ct.hora_inicio, ct.hora_fin, ct.estado, ct.tema,
            p.nombre AS profesor_nombre, p.apellido AS profesor_apellido
     FROM clases_teoricas ct
     LEFT JOIN profesores p ON ct.id_profesor = p.id_profesor
     WHERE ct.sede = (SELECT sede FROM alumnos WHERE id_alumno = $1)
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
