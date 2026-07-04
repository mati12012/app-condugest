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