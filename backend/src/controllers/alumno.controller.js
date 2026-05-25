import {
    createAlumno,
    getAllAlumnos,
    getAlumnoById,
    updateAlumno,
    deleteAlumno
} from "../services/alumno.services.js";
import {validateAlumnoData} from "../validations/alumno.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function getAlumnosController(req, res) { 
    try {
        const alumnos = await getAllAlumnos();
        return handleSuccess(res, 200, "Alumnos obtenidos exitosamente", alumnos);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener alumnos", error.message);
    }
}

export async function getAlumnoController(req, res) {
    try {
        const { id } = req.params;
        const alumno = await getAlumnoById(id);
        if (!alumno) {
            return handleErrorClient(res, 404, "Alumno no encontrado");
        }
        return handleSuccess(res, 200, "Alumno obtenido exitosamente", alumno);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener alumno", error.message);
    }
}

export async function createAlumnoController(req, res) {
    try {
        const alumnoData = req.body;
        const validationErrors = validateAlumnoData(alumnoData);
        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos del alumno invalidos", validationErrors);
        }
        const nuevoAlumno = await createAlumno(alumnoData);
        return handleSuccess(res, 201, "Alumno creado exitosamente", nuevoAlumno);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al crear alumno", error.message);
    }
}

export async function updateAlumnoController(req, res) {
    try {
        const { id } = req.params;  
        const alumnoData = req.body;
        const validationErrors = validateAlumnoData(alumnoData);

        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos del alumno invalidos", validationErrors);
        }

        const alumnoActualizado = await updateAlumno(id, alumnoData);

        // Para error de superar clases completadas sobre total de clases del plan
        if (alumnoActualizado && alumnoActualizado.errorNegocio) {
            return handleErrorClient(res, 400, "Limite de clases excedido", alumnoActualizado.errorNegocio);
        }

        // Para verificar si el alumno a actualizar existe o no
        if (!alumnoActualizado) {
            return handleErrorClient(res, 404, "Alumno no encontrado");
        }

        return handleSuccess(res, 200, "Alumno actualizado exitosamente", alumnoActualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar el alumno", error.message);
    }
}

export async function deleteAlumnoController(req, res) {
    try {
        const { id } = req.params;
        const alumnoEliminado = await deleteAlumno(id);

        if (!alumnoEliminado) {
            return handleErrorClient(res, 404, "Alumno no encontrado");
        }

        return handleSuccess(res, 200, "Alumno eliminado exitosamente", alumnoEliminado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al eliminar alumno", error.message);
    }
}