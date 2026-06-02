import { createClaseTeorica, getAllClasesTeoricas, updateClaseTeorica, deleteClaseTeorica } from "../services/claseTeorica.services.js";
import { validateClaseTeoricaData } from "../validations/claseTeorica.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function getClasesTeoricasController(req, res) {
    try {
        const clases = await getAllClasesTeoricas();
        return handleSuccess(res, 200, "Clases teóricas obtenidas", clases);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener clases", error.message);
    }
}

export async function createClaseTeoricaController(req, res) {
    try {
        const claseData = req.body;
        const validationErrors = validateClaseTeoricaData(claseData);
        
        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos inválidos", validationErrors);
        }
        
        const nuevaClase = await createClaseTeorica(claseData);
        return handleSuccess(res, 201, "Clase programada exitosamente", nuevaClase);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al crear la clase", error.message);
    }
}

export async function updateClaseTeoricaController(req, res) {
    try {
        const { id } = req.params;
        const { id_clase_teorica, id: bodyId, ...claseDataSeguro } = req.body;
        
        const validationErrors = validateClaseTeoricaData(claseDataSeguro);
        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos inválidos", validationErrors);
        }

        const claseActualizada = await updateClaseTeorica(id, claseDataSeguro);
        if (!claseActualizada) return handleErrorClient(res, 404, "Clase no encontrada");

        return handleSuccess(res, 200, "Clase actualizada", claseActualizada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar", error.message);
    }
}

export async function deleteClaseTeoricaController(req, res) {
    try {
        const { id } = req.params;
        const claseEliminada = await deleteClaseTeorica(id);
        
        if (!claseEliminada) return handleErrorClient(res, 404, "Clase no encontrada");
        return handleSuccess(res, 200, "Clase eliminada", claseEliminada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al eliminar", error.message);
    }
}