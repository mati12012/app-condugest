import {
  createPago,
  getAllPagos,
  getMatriculaPagoById,
  getPagoDetalleById,
  getPagosPorMatricula,
  getResumenFinancieroMatricula,
  updatePago,
} from "../services/pago.services.js";

import {
  validatePagoCreate,
  validatePagoIdParam,
  validatePagoMatriculaParam,
  validatePagoUpdate,
} from "../validations/pago.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosPago(data) {
  const limpio = { ...data };

  ["id_matricula", "monto"].forEach((campo) => {
    if (limpio[campo] === "") {
      delete limpio[campo];
    } else if (limpio[campo] !== undefined && limpio[campo] !== null) {
      limpio[campo] = Number(limpio[campo]);
    }
  });

  ["metodo_pago", "estado", "observacion"].forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (limpio.observacion === "") {
    limpio.observacion = null;
  }

  if (limpio.fecha_pago === "") {
    delete limpio.fecha_pago;
  }

  return limpio;
}

function validarReglasRegistroPago({ matricula, resumen, monto, metodoPago }) {
  if (["Anulada", "Finalizada"].includes(matricula.estado)) {
    return "No se pueden registrar pagos en matrículas anuladas o finalizadas.";
  }

  const saldoPendiente = Number(resumen?.saldo_pendiente || 0);

  if (saldoPendiente <= 0) {
    return "La matrícula ya no tiene saldo pendiente.";
  }

  if (monto > saldoPendiente) {
    return "El monto del pago no puede superar el saldo pendiente de la matrícula.";
  }

  const esPagoSaldoMenorAlMinimo = saldoPendiente < 5000 && monto === saldoPendiente;

  if (monto < 5000 && !esPagoSaldoMenorAlMinimo) {
    return "El monto mínimo de abono es de $5.000.";
  }

  if (metodoPago === "Efectivo" && monto % 10 !== 0) {
    return "Para pagos en efectivo, el monto debe ser múltiplo de 10.";
  }

  return null;
}

export async function getPagosController(req, res) {
  try {
    const pagos = await getAllPagos();

    return handleSuccess(
      res,
      200,
      "Pagos obtenidos exitosamente",
      pagos
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener pagos",
      error.message
    );
  }
}

export async function getPagoController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validatePagoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const pago = await getPagoDetalleById(id);

    if (!pago) {
      return handleErrorClient(res, 404, "Pago no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Pago obtenido exitosamente",
      pago
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener pago",
      error.message
    );
  }
}

export async function getPagosPorMatriculaController(req, res) {
  try {
    const { id_matricula } = req.params;
    const paramErrors = validatePagoMatriculaParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const matricula = await getMatriculaPagoById(id_matricula);

    if (!matricula) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    const pagos = await getPagosPorMatricula(id_matricula);

    return handleSuccess(
      res,
      200,
      "Pagos de la matricula obtenidos exitosamente",
      pagos
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener pagos de la matricula",
      error.message
    );
  }
}

export async function createPagoController(req, res) {
  try {
    const pagoData = limpiarDatosPago(req.body);
    const { errors, value } = validatePagoCreate(pagoData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de pago invalidos",
        errors
      );
    }

    const matricula = await getMatriculaPagoById(value.id_matricula);

    if (!matricula) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    const resumen = await getResumenFinancieroMatricula(value.id_matricula);

    const errorReglasPago = validarReglasRegistroPago({
      matricula,
      resumen,
      monto: value.monto,
      metodoPago: value.metodo_pago,
    });

    if (errorReglasPago) {
      return handleErrorClient(
        res,
        409,
        errorReglasPago
      );
    }

    const nuevoPago = await createPago(value);

    return handleSuccess(
      res,
      201,
      "Pago registrado exitosamente",
      nuevoPago
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al registrar pago",
      error.message
    );
  }
}

export async function updatePagoController(req, res) {
  try {
    const { id } = req.params;
    const paramErrors = validatePagoIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const pagoActual = await getPagoDetalleById(id);

    if (!pagoActual) {
      return handleErrorClient(res, 404, "Pago no encontrado");
    }

    if (pagoActual.estado === "Anulado") {
      return handleErrorClient(res, 409, "El pago ya se encuentra anulado");
    }

    const pagoData = limpiarDatosPago(req.body);
    const { errors, value } = validatePagoUpdate(pagoData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de pago invalidos",
        errors
      );
    }

    const pagoActualizado = await updatePago(id, value);

    return handleSuccess(
      res,
      200,
      "Pago anulado exitosamente",
      pagoActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar pago",
      error.message
    );
  }
}

export async function getResumenFinancieroMatriculaController(req, res) {
  try {
    const { id_matricula } = req.params;
    const paramErrors = validatePagoMatriculaParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const resumen = await getResumenFinancieroMatricula(id_matricula);

    if (!resumen) {
      return handleErrorClient(res, 404, "Matricula no encontrada");
    }

    return handleSuccess(
      res,
      200,
      "Resumen financiero de la matricula obtenido exitosamente",
      resumen
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener resumen financiero de la matricula",
      error.message
    );
  }
}
