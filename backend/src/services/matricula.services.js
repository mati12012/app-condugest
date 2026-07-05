import { AppDataSource } from "../config/configDb.js";
import Alumno from "../entitys/alumno.entity.js";
import Matricula from "../entitys/matricula.entity.js";
import Plan from "../entitys/plan.entity.js";

function matriculaRepository() {
  return AppDataSource.getRepository(Matricula);
}

function alumnoRepository() {
  return AppDataSource.getRepository(Alumno);
}

function planRepository() {
  return AppDataSource.getRepository(Plan);
}

export async function getAlumnoMatriculaById(idAlumno) {
  return await alumnoRepository().findOne({
    where: {
      id_alumno: Number(idAlumno),
    },
  });
}

export async function getPlanActivoMatriculaById(idPlan) {
  return await planRepository().findOne({
    where: {
      id_plan: Number(idPlan),
      estado: "Activo",
    },
  });
}

export async function getMatriculaActivaPorAlumno(idAlumno, idMatriculaExcluida = null) {
  const parametros = [Number(idAlumno)];

  let consulta = `
    SELECT
      id_matricula,
      id_alumno,
      id_plan,
      estado
    FROM matriculas
    WHERE id_alumno = $1
      AND estado = 'Activa'
  `;

  if (idMatriculaExcluida) {
    consulta += ` AND id_matricula <> $2`;
    parametros.push(Number(idMatriculaExcluida));
  }

  consulta += ` LIMIT 1`;

  const resultado = await AppDataSource.query(consulta, parametros);

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function getAllMatriculas() {
  return await AppDataSource.query(`
    SELECT
      m.id_matricula,
      m.id_alumno,
      m.id_plan,
      m.fecha_matricula,
      m.cantidad_clases_practicas,
      m.cantidad_clases_teoricas,
      m.valor_total,
      m.estado,

      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      a.rut AS alumno_rut,
      a.correo AS alumno_correo,

      p.nombre AS plan_nombre,
      p.tipo AS plan_tipo,
      p.estado AS plan_estado
    FROM matriculas m
    INNER JOIN alumnos a ON m.id_alumno = a.id_alumno
    INNER JOIN planes p ON m.id_plan = p.id_plan
    ORDER BY m.fecha_matricula DESC, m.id_matricula DESC
  `);
}

export async function getMatriculaDetalleById(idMatricula) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      m.id_matricula,
      m.id_alumno,
      m.id_plan,
      m.fecha_matricula,
      m.cantidad_clases_practicas,
      m.cantidad_clases_teoricas,
      m.valor_total,
      m.estado,

      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      a.rut AS alumno_rut,
      a.correo AS alumno_correo,
      a.licencia AS alumno_licencia,
      a.sede AS alumno_sede,

      p.nombre AS plan_nombre,
      p.descripcion AS plan_descripcion,
      p.tipo AS plan_tipo,
      p.estado AS plan_estado
    FROM matriculas m
    INNER JOIN alumnos a ON m.id_alumno = a.id_alumno
    INNER JOIN planes p ON m.id_plan = p.id_plan
    WHERE m.id_matricula = $1
    LIMIT 1
    `,
    [Number(idMatricula)]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function getMatriculasPorAlumno(idAlumno) {
  return await AppDataSource.query(
    `
    SELECT
      m.id_matricula,
      m.id_alumno,
      m.id_plan,
      m.fecha_matricula,
      m.cantidad_clases_practicas,
      m.cantidad_clases_teoricas,
      m.valor_total,
      m.estado,
      p.nombre AS plan_nombre,
      p.descripcion AS plan_descripcion,
      p.tipo AS plan_tipo,
      p.estado AS plan_estado
    FROM matriculas m
    INNER JOIN planes p ON m.id_plan = p.id_plan
    WHERE m.id_alumno = $1
    ORDER BY m.fecha_matricula DESC, m.id_matricula DESC
    `,
    [Number(idAlumno)]
  );
}

export async function createMatriculaDesdePlan({ id_alumno, plan }) {
  const nuevaMatricula = matriculaRepository().create({
    id_alumno: Number(id_alumno),
    id_plan: Number(plan.id_plan),
    cantidad_clases_practicas: plan.cantidad_clases_practicas,
    cantidad_clases_teoricas: plan.cantidad_clases_teoricas,
    valor_total: plan.valor,
    estado: "Activa",
  });

  const matriculaGuardada = await matriculaRepository().save(nuevaMatricula);

  return await getMatriculaDetalleById(matriculaGuardada.id_matricula);
}

export async function updateMatricula(idMatricula, matriculaData) {
  const matricula = await matriculaRepository().findOne({
    where: {
      id_matricula: Number(idMatricula),
    },
  });

  if (!matricula) {
    return null;
  }

  await matriculaRepository().update(
    { id_matricula: Number(idMatricula) },
    matriculaData
  );

  return await getMatriculaDetalleById(idMatricula);
}

export async function deleteMatricula(idMatricula) {
  const matricula = await matriculaRepository().findOne({
    where: {
      id_matricula: Number(idMatricula),
    },
  });

  if (!matricula) {
    return null;
  }

  await matriculaRepository().remove(matricula);

  return matricula;
}
