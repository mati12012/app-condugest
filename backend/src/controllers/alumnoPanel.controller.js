import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { 
  getAlumnoIdDesdeUsuario, 
  getPerfilAlumno, 
  getClasesPracticasPorAlumno, 
  getClasesTeoricasPorAlumno,
  cancelarClasePractica 
} from "../services/alumnoPanel.services.js";

export async function getMiPerfilAlumnoController(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idAlumno = await getAlumnoIdDesdeUsuario(idUsuario);
    if (!idAlumno) return handleErrorClient(res, 404, "Alumno no vinculado");

    const perfil = await getPerfilAlumno(idAlumno);
    return handleSuccess(res, 200, "Perfil obtenido", perfil);
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function getMisClasesAlumnoController(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idAlumno = await getAlumnoIdDesdeUsuario(idUsuario);
    if (!idAlumno) return handleErrorClient(res, 404, "Alumno no vinculado");

    const [clasesPracticas, clasesTeoricas] = await Promise.all([
      getClasesPracticasPorAlumno(idAlumno),
      getClasesTeoricasPorAlumno(idAlumno)
    ]);

    return handleSuccess(res, 200, "Clases obtenidas", { 
      clases_practicas: clasesPracticas,
      clases_teoricas: clasesTeoricas
    });
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}

export async function cancelarClaseAlumnoController(req, res) {
  try {
    const { idClase } = req.params;
    const idUsuario = req.usuario.id_usuario;
    const idAlumno = await getAlumnoIdDesdeUsuario(idUsuario);

    if (!idAlumno) return handleErrorClient(res, 404, "Alumno no vinculado");

    const claseCancelada = await cancelarClasePractica(idClase, idAlumno);

    if (!claseCancelada) {
      return handleErrorClient(res, 400, "No se pudo cancelar. Verifica que la clase esté 'Programada' y te pertenezca.");
    }

    return handleSuccess(res, 200, "Clase cancelada exitosamente", claseCancelada);
  } catch (error) {
    return handleErrorServer(res, 500, "Error al cancelar la clase", error.message);
  }
}