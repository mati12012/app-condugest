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

export async function getMiPerfilProfesor(idProfesor) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      p.id_profesor,
      p.nombre,
      p.apellido,
      CONCAT_WS(' ', p.nombre, p.apellido) AS nombre_completo,
      p.rut,
      p.correo_institucional,
      p.correo_personal,
      p.telefono,
      p.sede,
      p.licencia_autorizada,
      p.especialidad,
      p.estado,
      COALESCE((
        SELECT COUNT(*)
        FROM clases_practicas cp
        WHERE cp.id_profesor = p.id_profesor
      ), 0)::int AS cantidad_clases_practicas_asignadas,
      COALESCE((
        SELECT COUNT(*)
        FROM clases_teoricas ct
        WHERE ct.id_profesor = p.id_profesor
      ), 0)::int AS cantidad_clases_teoricas_asignadas,
      COALESCE((
        SELECT COUNT(*)
        FROM evaluaciones_practicas ep
        WHERE ep.id_profesor = p.id_profesor
      ), 0)::int AS cantidad_evaluaciones_registradas
    FROM profesores p
    WHERE p.id_profesor = $1
    LIMIT 1
    `,
    [Number(idProfesor)]
  );

  if (resultado.length === 0) {
    return null;
  }

  const disponibilidadHorariaActiva = await AppDataSource.query(
    `
    SELECT
      dia_semana,
      hora_inicio,
      hora_fin,
      sede,
      estado
    FROM disponibilidad_profesores
    WHERE id_profesor = $1
      AND LOWER(estado) = 'activa'
    ORDER BY
      CASE dia_semana
        WHEN 'Lunes' THEN 1
        WHEN 'Martes' THEN 2
        WHEN 'Miercoles' THEN 3
        WHEN 'Miércoles' THEN 3
        WHEN 'Jueves' THEN 4
        WHEN 'Viernes' THEN 5
        WHEN 'Sabado' THEN 6
        WHEN 'Sábado' THEN 6
        WHEN 'Domingo' THEN 7
        ELSE 8
      END,
      hora_inicio ASC
    `,
    [Number(idProfesor)]
  );

  return {
    ...resultado[0],
    disponibilidad_horaria_activa: disponibilidadHorariaActiva,
  };
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
        SELECT
          ct.*,
          st.nombre AS sala_nombre,
          st.sede AS sala_sede,
          st.capacidad AS sala_capacidad,
          (SELECT COUNT(*) FROM asistencias_teoricas WHERE id_clase_teorica = ct.id_clase_teorica)::int AS total_alumnos
        FROM clases_teoricas ct
        LEFT JOIN salas_teoricas st
          ON st.id_sala_teorica = ct.id_sala_teorica
        WHERE ct.id_profesor = $1
        ORDER BY ct.fecha DESC, ct.hora_inicio ASC
    `, [Number(id_profesor)]);
}

export async function getClaseTeoricaProfesorById(idClase, idProfesor) {
    const resultado = await AppDataSource.query(`
        SELECT
          ct.id_clase_teorica,
          ct.id_profesor,
          ct.tema,
          ct.fecha,
          ct.hora_inicio,
          ct.hora_fin,
          ct.sede,
          ct.estado,
          ct.modalidad,
          ct.link_reunion,
          ct.codigo_reunion,
          ct.url_grabacion,
          ct.id_sala_teorica,
          st.nombre AS sala_nombre,
          st.sede AS sala_sede,
          st.capacidad AS sala_capacidad
        FROM clases_teoricas ct
        LEFT JOIN salas_teoricas st
          ON st.id_sala_teorica = ct.id_sala_teorica
        WHERE ct.id_clase_teorica = $1
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

export async function actualizarRecursosClaseTeoricaProfesor(idClase, idProfesor, recursos) {
    const resultado = await AppDataSource.query(`
        UPDATE clases_teoricas
        SET
          link_reunion = $1,
          codigo_reunion = $2,
          url_grabacion = $3
        WHERE id_clase_teorica = $4
          AND id_profesor = $5
        RETURNING
          id_clase_teorica,
          id_profesor,
          tema,
          fecha,
          hora_inicio,
          hora_fin,
          sede,
          estado,
          modalidad,
          link_reunion,
          codigo_reunion,
          url_grabacion,
          id_sala_teorica
    `, [
        recursos.link_reunion,
        recursos.codigo_reunion,
        recursos.url_grabacion,
        Number(idClase),
        Number(idProfesor),
    ]);

    return resultado.length > 0 ? resultado[0] : null;
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
