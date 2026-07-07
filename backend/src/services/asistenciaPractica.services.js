"use strict";

import { AppDataSource } from "../config/configDb.js";

const estadoClasePorAsistencia = {
  Presente: "Realizada",
  Ausente: "Realizada",
  Justificado: "Cancelada",
  Pendiente: "Programada",
};

function normalizarObservacion(observacion) {
  if (typeof observacion !== "string") return null;

  const texto = observacion.trim();
  return texto.length > 0 ? texto : null;
}

function construirFiltroHistorial({ idAlumno = null, idProfesor = null } = {}) {
  const filtros = [];
  const parametros = [];

  if (idAlumno) {
    parametros.push(Number(idAlumno));
    filtros.push(`cp.id_alumno = $${parametros.length}`);
  }

  if (idProfesor) {
    parametros.push(Number(idProfesor));
    filtros.push(`cp.id_profesor = $${parametros.length}`);
  }

  return {
    where: filtros.length ? `WHERE ${filtros.join(" AND ")}` : "",
    parametros,
  };
}

function consultaHistorialBase(where = "") {
  return `
    SELECT
      ap.id_asistencia_practica,
      cp.id_clase_practica,
      cp.fecha AS clase_fecha,
      cp.fecha,
      cp.hora_inicio,
      cp.hora_fin,
      cp.sede AS clase_sede,
      cp.estado AS clase_estado,
      cp.observacion AS clase_observacion,
      a.id_alumno,
      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      a.rut AS alumno_rut,
      p.id_profesor,
      p.nombre AS profesor_nombre,
      p.apellido AS profesor_apellido,
      p.rut AS profesor_rut,
      v.patente AS vehiculo_patente,
      v.marca AS vehiculo_marca,
      v.modelo AS vehiculo_modelo,
      COALESCE(ap.estado_asistencia, cp.asistencia, 'Pendiente') AS estado_asistencia,
      COALESCE(ap.observacion, cp.observacion) AS observacion,
      ap.registrado_por,
      u.correo AS registrado_por_correo,
      ap.fecha_registro
    FROM clases_practicas cp
    INNER JOIN alumnos a
      ON a.id_alumno = cp.id_alumno
    INNER JOIN profesores p
      ON p.id_profesor = cp.id_profesor
    INNER JOIN vehiculos v
      ON v.id_vehiculo = cp.id_vehiculo
    LEFT JOIN asistencias_practicas ap
      ON ap.id_clase_practica = cp.id_clase_practica
    LEFT JOIN usuarios u
      ON u.id_usuario = ap.registrado_por
    ${where}
    ORDER BY cp.fecha DESC, cp.hora_inicio DESC, cp.id_clase_practica DESC
  `;
}

export async function getAsistenciaPracticaPorClase(idClase) {
  const resultado = await AppDataSource.query(
    `${consultaHistorialBase("WHERE cp.id_clase_practica = $1")} LIMIT 1`,
    [Number(idClase)]
  );

  return resultado.length ? resultado[0] : null;
}

export async function getHistorialAsistenciasPracticas(filtros = {}) {
  const { where, parametros } = construirFiltroHistorial(filtros);
  return await AppDataSource.query(consultaHistorialBase(where), parametros);
}

export async function getResumenAsistenciaPracticaAlumno(idAlumno) {
  const historial = await getHistorialAsistenciasPracticas({ idAlumno });

  const resumen = historial.reduce(
    (acumulado, asistencia) => {
      const estado = asistencia.estado_asistencia || "Pendiente";

      acumulado.total += 1;
      if (estado === "Presente") acumulado.presentes += 1;
      if (estado === "Ausente") acumulado.ausentes += 1;
      if (estado === "Justificado") acumulado.justificados += 1;
      if (estado === "Pendiente") acumulado.pendientes += 1;

      return acumulado;
    },
    {
      total: 0,
      presentes: 0,
      ausentes: 0,
      justificados: 0,
      pendientes: 0,
    }
  );

  return { resumen, historial };
}

export async function upsertAsistenciaPractica({
  idClasePractica,
  estadoAsistencia,
  observacion = null,
  registradoPor,
}) {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const clases = await queryRunner.manager.query(
      `
      SELECT
        id_clase_practica,
        id_alumno,
        id_profesor
      FROM clases_practicas
      WHERE id_clase_practica = $1
      FOR UPDATE
      `,
      [Number(idClasePractica)]
    );

    if (clases.length === 0) {
      await queryRunner.rollbackTransaction();
      return null;
    }

    const clase = clases[0];
    const observacionNormalizada = normalizarObservacion(observacion);

    const registros = await queryRunner.manager.query(
      `
      SELECT id_asistencia_practica
      FROM asistencias_practicas
      WHERE id_clase_practica = $1
      LIMIT 1
      `,
      [Number(idClasePractica)]
    );

    if (registros.length > 0) {
      await queryRunner.manager.query(
        `
        UPDATE asistencias_practicas
        SET estado_asistencia = $1,
            observacion = $2,
            registrado_por = $3,
            id_alumno = $4,
            id_profesor = $5,
            fecha_registro = NOW()
        WHERE id_asistencia_practica = $6
        `,
        [
          estadoAsistencia,
          observacionNormalizada,
          Number(registradoPor),
          Number(clase.id_alumno),
          Number(clase.id_profesor),
          Number(registros[0].id_asistencia_practica),
        ]
      );
    } else {
      await queryRunner.manager.query(
        `
        INSERT INTO asistencias_practicas (
          id_clase_practica,
          id_alumno,
          id_profesor,
          estado_asistencia,
          observacion,
          registrado_por,
          fecha_registro
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `,
        [
          Number(idClasePractica),
          Number(clase.id_alumno),
          Number(clase.id_profesor),
          estadoAsistencia,
          observacionNormalizada,
          Number(registradoPor),
        ]
      );
    }

    await queryRunner.manager.query(
      `
      UPDATE clases_practicas
      SET asistencia = $1,
          estado = $2
      WHERE id_clase_practica = $3
      `,
      [
        estadoAsistencia,
        estadoClasePorAsistencia[estadoAsistencia],
        Number(idClasePractica),
      ]
    );

    await queryRunner.commitTransaction();
    return await getAsistenciaPracticaPorClase(idClasePractica);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
