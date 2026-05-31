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

        // Generar correo automaticamente
        if (alumnoData.nombre && alumnoData.apellido) {
            const nom = alumnoData.nombre.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(' ', '');
            const ape = alumnoData.apellido.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(' ', '');
            alumnoData.correo = `${nom}.${ape}@alumnos.condugest.cl`;
        }
        
        const validationErrors = validateAlumnoData(alumnoData);
        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos del alumno invalidos", validationErrors);
        }
        const nuevoAlumno = await createAlumno(alumnoData);
        return handleSuccess(res, 201, "Alumno creado exitosamente", nuevoAlumno);
    } catch (error) {
        const errorMsg = error.message ? error.message.toLowerCase() : "";
        if (errorMsg.includes("llave duplicada") || errorMsg.includes("unicidad") || errorMsg.includes("duplicate key")) {
            return handleErrorClient(res, 400, "Error de registro", ["RUT ya registrado en el sistema."]);
        }
        return handleErrorClient(res, 400, "Error de sistema", ["No se pudo guardar el alumno. Intente nuevamente."]);
    }
}

export async function updateAlumnoController(req, res) {
    try {
        const { id } = req.params;  
        const { id_alumno, id: bodyId, ...alumnoDataSeguro } = req.body;
        const validationErrors = validateAlumnoData(alumnoDataSeguro);

        if (validationErrors.length > 0) {
            return handleErrorClient(res, 400, "Datos del alumno invalidos", validationErrors);
        }

        const alumnoActualizado = await updateAlumno(id, alumnoDataSeguro);

        // Para error de superar clases completadas sobre total de clases del plan
        if (alumnoActualizado && alumnoActualizado.errorNegocio) {
            return handleErrorClient(res, 400, "Límite de clases excedido", [alumnoActualizado.errorNegocio]);
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