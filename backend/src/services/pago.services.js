import { AppDataSource } from "../config/configDb.js";
import Matricula from "../entitys/matricula.entity.js";
import Pago from "../entitys/pago.entity.js";

function pagoRepository() {
  return AppDataSource.getRepository(Pago);
}

function matriculaRepository() {
  return AppDataSource.getRepository(Matricula);
}

export async function getMatriculaPagoById(idMatricula) {
  return await matriculaRepository().findOne({
    where: {
      id_matricula: Number(idMatricula),
    },
  });
}

export async function getAllPagos() {
  return await AppDataSource.query(`
    SELECT
      p.id_pago,
      p.id_matricula,
      p.monto,
      p.metodo_pago,
      p.fecha_pago,
      p.estado,
      p.observacion,
      m.valor_total AS matricula_valor_total,
      m.estado AS matricula_estado
    FROM pagos p
    INNER JOIN matriculas m ON p.id_matricula = m.id_matricula
    ORDER BY p.fecha_pago DESC, p.id_pago DESC
  `);
}

export async function getPagoDetalleById(idPago) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      p.id_pago,
      p.id_matricula,
      p.monto,
      p.metodo_pago,
      p.fecha_pago,
      p.estado,
      p.observacion,
      m.valor_total AS matricula_valor_total,
      m.estado AS matricula_estado
    FROM pagos p
    INNER JOIN matriculas m ON p.id_matricula = m.id_matricula
    WHERE p.id_pago = $1
    LIMIT 1
    `,
    [Number(idPago)]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function getPagosPorMatricula(idMatricula) {
  return await AppDataSource.query(
    `
    SELECT
      p.id_pago,
      p.id_matricula,
      p.monto,
      p.metodo_pago,
      p.fecha_pago,
      p.estado,
      p.observacion
    FROM pagos p
    WHERE p.id_matricula = $1
    ORDER BY p.fecha_pago DESC, p.id_pago DESC
    `,
    [Number(idMatricula)]
  );
}

export async function createPago(pagoData) {
  const nuevoPago = pagoRepository().create(pagoData);
  const pagoGuardado = await pagoRepository().save(nuevoPago);

  return await getPagoDetalleById(pagoGuardado.id_pago);
}

export async function updatePago(idPago, pagoData) {
  const pago = await pagoRepository().findOne({
    where: {
      id_pago: Number(idPago),
    },
  });

  if (!pago) {
    return null;
  }

  await pagoRepository().update(
    { id_pago: Number(idPago) },
    pagoData
  );

  return await getPagoDetalleById(idPago);
}

export async function getResumenFinancieroMatricula(idMatricula) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      m.id_matricula,
      m.valor_total,
      COALESCE(SUM(
        CASE
          WHEN p.estado = 'Registrado' THEN p.monto
          ELSE 0
        END
      ), 0)::int AS total_pagado
    FROM matriculas m
    LEFT JOIN pagos p ON p.id_matricula = m.id_matricula
    WHERE m.id_matricula = $1
    GROUP BY m.id_matricula, m.valor_total
    LIMIT 1
    `,
    [Number(idMatricula)]
  );

  if (resultado.length === 0) {
    return null;
  }

  const valorTotal = Number(resultado[0].valor_total);
  const totalPagado = Number(resultado[0].total_pagado);
  const saldoPendiente = Math.max(valorTotal - totalPagado, 0);

  let estadoPago = "Pendiente";

  if (totalPagado > 0 && totalPagado < valorTotal) {
    estadoPago = "Parcial";
  }

  if (totalPagado >= valorTotal && totalPagado > 0) {
    estadoPago = "Pagado";
  }

  return {
    id_matricula: Number(resultado[0].id_matricula),
    valor_total: valorTotal,
    total_pagado: totalPagado,
    saldo_pendiente: saldoPendiente,
    estado_pago: estadoPago,
  };
}
