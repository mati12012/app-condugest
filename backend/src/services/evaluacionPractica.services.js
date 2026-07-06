import { AppDataSource } from "../config/configDb.js";
import EvaluacionPractica from "../entitys/evaluacionPractica.entity.js";

function evaluacionPracticaRepository() {
  return AppDataSource.getRepository(EvaluacionPractica);
}

const SELECT_DETALLE_EVALUACION = `
  SELECT
    ep.id_evaluacion,
    ep.id_clase_practica,
    ep.id_alumno,
    ep.id_profesor,
    ep.nivel_general,
    ep.manejo_vehiculo,
    ep.normas_transito,
    ep.seguridad,
    ep.estacionamiento,
    ep.observacion,
    ep.recomendacion,
    ep.fecha_evaluacion,

    cp.fecha AS clase_fecha,
    cp.hora_inicio AS clase_hora_inicio,
    cp.hora_fin AS clase_hora_fin,
    cp.estado AS clase_estado,
    cp.asistencia AS clase_asistencia,
    cp.sede AS clase_sede,
    cp.id_profesor AS clase_id_profesor,

    a.nombre AS alumno_nombre,
    a.apellido AS alumno_apellido,
    a.rut AS alumno_rut,

    p.nombre AS profesor_nombre,
    p.apellido AS profesor_apellido,
    p.correo_institucional AS profesor_correo_institucional
  FROM evaluaciones_practicas ep
  INNER JOIN clases_practicas cp
    ON ep.id_clase_practica = cp.id_clase_practica
  INNER JOIN alumnos a
    ON ep.id_alumno = a.id_alumno
  INNER JOIN profesores p
    ON ep.id_profesor = p.id_profesor
`;

export async function getClasePracticaEvaluacionById(idClasePractica) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      cp.id_clase_practica,
      cp.id_alumno,
      cp.id_profesor,
      cp.fecha,
      cp.hora_inicio,
      cp.hora_fin,
      cp.estado,
      cp.asistencia,
      cp.sede
    FROM clases_practicas cp
    WHERE cp.id_clase_practica = $1
    LIMIT 1
    `,
    [Number(idClasePractica)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function getAllEvaluacionesPracticas() {
  return await AppDataSource.query(`
    ${SELECT_DETALLE_EVALUACION}
    ORDER BY ep.fecha_evaluacion DESC, ep.id_evaluacion DESC
  `);
}

export async function getEvaluacionesPracticasPorProfesor(idProfesor) {
  return await AppDataSource.query(
    `
    ${SELECT_DETALLE_EVALUACION}
    WHERE cp.id_profesor = $1
    ORDER BY ep.fecha_evaluacion DESC, ep.id_evaluacion DESC
    `,
    [Number(idProfesor)]
  );
}

export async function getEvaluacionesPracticasPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `
    ${SELECT_DETALLE_EVALUACION}
    WHERE ep.id_alumno = $1
    ORDER BY ep.fecha_evaluacion DESC, ep.id_evaluacion DESC
    `,
    [Number(idAlumno)]
  );
}

export async function getEvaluacionPracticaById(idEvaluacion) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_EVALUACION}
    WHERE ep.id_evaluacion = $1
    LIMIT 1
    `,
    [Number(idEvaluacion)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function getEvaluacionPracticaPorClase(idClasePractica) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_EVALUACION}
    WHERE ep.id_clase_practica = $1
    LIMIT 1
    `,
    [Number(idClasePractica)]
  );

  return resultado.length > 0 ? resultado[0] : null;
}

export async function createEvaluacionPractica(clasePractica, evaluacionData) {
  const nuevaEvaluacion = evaluacionPracticaRepository().create({
    ...evaluacionData,
    id_clase_practica: Number(clasePractica.id_clase_practica),
    id_alumno: Number(clasePractica.id_alumno),
    id_profesor: Number(clasePractica.id_profesor),
  });

  const evaluacionGuardada = await evaluacionPracticaRepository().save(
    nuevaEvaluacion
  );

  return await getEvaluacionPracticaById(evaluacionGuardada.id_evaluacion);
}

export async function updateEvaluacionPractica(idEvaluacion, evaluacionData) {
  const evaluacion = await evaluacionPracticaRepository().findOne({
    where: {
      id_evaluacion: Number(idEvaluacion),
    },
  });

  if (!evaluacion) {
    return null;
  }

  await evaluacionPracticaRepository().update(
    { id_evaluacion: Number(idEvaluacion) },
    evaluacionData
  );

  return await getEvaluacionPracticaById(idEvaluacion);
}
