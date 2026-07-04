import { getPlanesActivosPublicos } from "../services/plan.services.js";

import {
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getPlanesPublicosController(req, res) {
  try {
    const planes = await getPlanesActivosPublicos();

    return handleSuccess(
      res,
      200,
      "Planes publicos obtenidos exitosamente",
      planes
    );
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      "Error al obtener planes publicos",
      error.message
    );
  }
}
