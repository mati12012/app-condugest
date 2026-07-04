import {
  createPlan,
  deletePlan,
  getAllPlanes,
  getPlanById,
  updatePlan,
} from "../services/plan.services.js";

import {
  validatePlanCreate,
  validatePlanIdParam,
  validatePlanUpdate,
} from "../validations/plan.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

function limpiarDatosPlan(data) {
  const limpio = { ...data };

  const camposTexto = ["nombre", "descripcion", "tipo", "estado"];

  camposTexto.forEach((campo) => {
    if (typeof limpio[campo] === "string") {
      limpio[campo] = limpio[campo].trim();
    }
  });

  if (limpio.descripcion === "") {
    limpio.descripcion = null;
  }

  const camposNumericos = [
    "cantidad_clases_practicas",
    "cantidad_clases_teoricas",
    "valor",
  ];

  camposNumericos.forEach((campo) => {
    if (
      limpio[campo] !== undefined &&
      limpio[campo] !== null &&
      limpio[campo] !== ""
    ) {
      limpio[campo] = Number(limpio[campo]);
    }
  });

  return limpio;
}

export async function getPlanesController(req, res) {
  try {
    const planes = await getAllPlanes();

    return handleSuccess(
      res,
      200,
      "Planes obtenidos exitosamente",
      planes
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener planes",
      error.message
    );
  }
}

export async function getPlanController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validatePlanIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const plan = await getPlanById(id);

    if (!plan) {
      return handleErrorClient(res, 404, "Plan no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Plan obtenido exitosamente",
      plan
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener plan",
      error.message
    );
  }
}

export async function createPlanController(req, res) {
  try {
    const planData = limpiarDatosPlan(req.body);
    const { errors, value } = validatePlanCreate(planData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de plan invalidos",
        errors
      );
    }

    const nuevoPlan = await createPlan(value);

    return handleSuccess(
      res,
      201,
      "Plan creado exitosamente",
      nuevoPlan
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al crear plan",
      error.message
    );
  }
}

export async function updatePlanController(req, res) {
  try {
    const { id } = req.params;
    const planData = limpiarDatosPlan(req.body);

    const paramErrors = validatePlanIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const { errors, value } = validatePlanUpdate(planData);

    if (errors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Datos de plan invalidos",
        errors
      );
    }

    const planActualizado = await updatePlan(id, value);

    if (!planActualizado) {
      return handleErrorClient(res, 404, "Plan no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Plan actualizado exitosamente",
      planActualizado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al actualizar plan",
      error.message
    );
  }
}

export async function deletePlanController(req, res) {
  try {
    const { id } = req.params;

    const paramErrors = validatePlanIdParam(req.params);

    if (paramErrors.length > 0) {
      return handleErrorClient(
        res,
        400,
        "Parametros invalidos",
        paramErrors
      );
    }

    const planEliminado = await deletePlan(id);

    if (!planEliminado) {
      return handleErrorClient(res, 404, "Plan no encontrado");
    }

    return handleSuccess(
      res,
      200,
      "Plan eliminado exitosamente",
      planEliminado
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al eliminar plan",
      error.message
    );
  }
}
