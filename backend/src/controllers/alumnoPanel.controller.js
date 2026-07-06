import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import {
  getAlumnoIdDesdeUsuario,
  getPerfilAlumno,
  getClasesPracticasPorAlumno,
  getClasesTeoricasPorAlumno,
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
      getClasesTeoricasPorAlumno(idAlumno),
    ]);

    return handleSuccess(res, 200, "Clases obtenidas", {
      clases_practicas: clasesPracticas,
      clases_teoricas: clasesTeoricas,
    });
  } catch (error) {
    return handleErrorServer(res, 500, "Error", error.message);
  }
}
