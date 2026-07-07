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

export async function getMatriculaDetalleById(idMatricula, manager = AppDataSource.manager) {
  const resultado = await manager.query(
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

export async function getResumenMatriculaById(idMatricula) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      m.id_matricula,
      m.estado,
      m.id_alumno,
      m.id_plan,
      m.cantidad_clases_practicas,
      m.cantidad_clases_teoricas,
      m.valor_total,

      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,
      a.rut AS alumno_rut,
      a.correo AS alumno_correo,

      p.nombre AS plan_nombre,
      p.tipo AS plan_tipo,

      COALESCE((
        SELECT SUM(pg.monto)
        FROM pagos pg
        WHERE pg.id_matricula = m.id_matricula
          AND pg.estado = 'Registrado'
      ), 0)::int AS total_pagado,

      COALESCE((
        SELECT COUNT(*)
        FROM clases_practicas cp
        WHERE cp.id_alumno = m.id_alumno
          AND cp.estado = 'Realizada'
      ), 0)::int AS clases_practicas_realizadas
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

  const matricula = resultado[0];
  const valorTotal = Number(matricula.valor_total);
  const totalPagado = Number(matricula.total_pagado);
  const saldoPendiente = Math.max(valorTotal - totalPagado, 0);

  let estadoPago = "Pendiente";

  if (totalPagado > 0 && totalPagado < valorTotal) {
    estadoPago = "Parcial";
  }

  if (totalPagado >= valorTotal && totalPagado > 0) {
    estadoPago = "Pagado";
  }

  const clasesPracticasContratadas = Number(matricula.cantidad_clases_practicas);
  const clasesPracticasRealizadas = Number(matricula.clases_practicas_realizadas);
  const clasesTeoricasContratadas = Number(matricula.cantidad_clases_teoricas);
  // Las clases teoricas aun no tienen relacion directa con alumno o matricula.
  const clasesTeoricasRealizadas = 0;

  return {
    id_matricula: Number(matricula.id_matricula),
    estado_matricula: matricula.estado,
    alumno: {
      id_alumno: Number(matricula.id_alumno),
      nombre: matricula.alumno_nombre,
      apellido: matricula.alumno_apellido,
      rut: matricula.alumno_rut,
      correo: matricula.alumno_correo,
    },
    plan: {
      id_plan: Number(matricula.id_plan),
      nombre: matricula.plan_nombre,
      tipo: matricula.plan_tipo,
    },
    resumen_financiero: {
      valor_total: valorTotal,
      total_pagado: totalPagado,
      saldo_pendiente: saldoPendiente,
      estado_pago: estadoPago,
    },
    resumen_academico: {
      clases_practicas_contratadas: clasesPracticasContratadas,
      clases_practicas_realizadas: clasesPracticasRealizadas,
      clases_practicas_restantes: Math.max(
        clasesPracticasContratadas - clasesPracticasRealizadas,
        0
      ),
      clases_teoricas_contratadas: clasesTeoricasContratadas,
      clases_teoricas_realizadas: clasesTeoricasRealizadas,
      clases_teoricas_restantes: Math.max(
        clasesTeoricasContratadas - clasesTeoricasRealizadas,
        0
      ),
    },
  };
}

export async function createMatriculaDesdePlan({ id_alumno, plan, manager = AppDataSource.manager }) {
  const repo = manager.getRepository(Matricula);
  const nuevaMatricula = repo.create({
    id_alumno: Number(id_alumno),
    id_plan: Number(plan.id_plan),
    cantidad_clases_practicas: plan.cantidad_clases_practicas,
    cantidad_clases_teoricas: plan.cantidad_clases_teoricas,
    valor_total: plan.valor,
    estado: "Activa",
  });

  const matriculaGuardada = await repo.save(nuevaMatricula);

  return await getMatriculaDetalleById(matriculaGuardada.id_matricula, manager);
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
