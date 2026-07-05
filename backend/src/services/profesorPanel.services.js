"use strict";

import { AppDataSource } from "../config/configDb.js";

export async function getProfesorIdDesdeUsuario(idUsuario) {
  const resultado = await AppDataSource.query(
    `
    SELECT 
      id_profesor
    FROM usuarios
    WHERE id_usuario = $1
      AND rol = 'profesor'
      AND estado = true
    `,
    [idUsuario]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0].id_profesor;
}

export async function getClasesPracticasPorProfesor(idProfesor) {
  return await AppDataSource.query(
    `
    SELECT
      cp.id_clase_practica,
      cp.fecha,
      cp.hora_inicio,
      cp.hora_fin,
      cp.sede,
      cp.estado,
      cp.observacion,

      a.id_alumno,
      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      a.rut AS alumno_rut,
      a.licencia AS alumno_licencia,

      v.id_vehiculo,
      v.patente AS vehiculo_patente,
      v.marca AS vehiculo_marca,
      v.modelo AS vehiculo_modelo,
      v.tipo_transmision,
      v.licencia_requerida

    FROM clases_practicas cp
    INNER JOIN alumnos a ON cp.id_alumno = a.id_alumno
    INNER JOIN vehiculos v ON cp.id_vehiculo = v.id_vehiculo
    WHERE cp.id_profesor = $1
    ORDER BY cp.fecha ASC, cp.hora_inicio ASC
    `,
    [idProfesor]
  );
}

export async function getClasesTeoricasPorProfesor(id_profesor) {
    return await AppDataSource.query(`
        SELECT ct.*,
        (SELECT COUNT(*) FROM asistencias_teoricas WHERE id_clase_teorica = ct.id_clase_teorica) as total_alumnos
        FROM clases_teoricas ct
        WHERE ct.id_profesor = $1
        ORDER BY ct.fecha DESC, ct.hora_inicio ASC
    `, [Number(id_profesor)]);
}

export async function getClaseTeoricaProfesorById(idClase, idProfesor) {
    const resultado = await AppDataSource.query(`
        SELECT id_clase_teorica, id_profesor
        FROM clases_teoricas
        WHERE id_clase_teorica = $1
        LIMIT 1
    `, [Number(idClase)]);

    if (resultado.length === 0) {
        return null;
    }

    return {
        clase: resultado[0],
        perteneceProfesor: Number(resultado[0].id_profesor) === Number(idProfesor),
    };
}

export async function getAsistenciaTeoricaProfesorById(idAsistencia, idProfesor) {
    const resultado = await AppDataSource.query(`
        SELECT
            ast.id_asistencia,
            ast.id_clase_teorica,
            ast.id_alumno,
            ast.estado_asistencia,
            ct.id_profesor
        FROM asistencias_teoricas ast
        INNER JOIN clases_teoricas ct
          ON ast.id_clase_teorica = ct.id_clase_teorica
        WHERE ast.id_asistencia = $1
        LIMIT 1
    `, [Number(idAsistencia)]);

    if (resultado.length === 0) {
        return null;
    }

    return {
        asistencia: resultado[0],
        perteneceProfesor: Number(resultado[0].id_profesor) === Number(idProfesor),
    };
}

export async function registrarAsistenciaTeorica(id_asistencia, estado) {
    const resultado = await AppDataSource.query(`
        UPDATE asistencias_teoricas
        SET estado_asistencia = $1
        WHERE id_asistencia = $2
        RETURNING *
    `, [estado, Number(id_asistencia)]);

    return resultado.length > 0 ? resultado[0] : null;
}
