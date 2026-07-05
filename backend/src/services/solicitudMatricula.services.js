import { AppDataSource } from "../config/configDb.js";
import Plan from "../entitys/plan.entity.js";
import SolicitudMatricula from "../entitys/solicitudMatricula.entity.js";

function solicitudRepository() {
  return AppDataSource.getRepository(SolicitudMatricula);
}

function planRepository() {
  return AppDataSource.getRepository(Plan);
}

export async function getPlanActivoById(idPlan) {
  return await planRepository().findOne({
    where: {
      id_plan: Number(idPlan),
      estado: "Activo",
    },
  });
}

export async function createSolicitudMatricula(solicitudData) {
  const nuevaSolicitud = solicitudRepository().create({
    ...solicitudData,
    estado: "Pendiente",
  });

  return await solicitudRepository().save(nuevaSolicitud);
}

export async function getAllSolicitudesMatricula() {
  return await AppDataSource.query(`
    SELECT
      sm.id_solicitud,
      sm.nombre,
      sm.apellido,
      sm.rut,
      sm.correo,
      sm.telefono,
      sm.id_plan,
      sm.mensaje,
      sm.estado,
      sm.fecha_solicitud,
      p.nombre AS plan_nombre,
      p.tipo AS plan_tipo,
      p.valor AS plan_valor
    FROM solicitudes_matricula sm
    INNER JOIN planes p ON sm.id_plan = p.id_plan
    ORDER BY sm.fecha_solicitud DESC, sm.id_solicitud DESC
  `);
}

export async function getSolicitudMatriculaDetalleById(id) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      sm.id_solicitud,
      sm.nombre,
      sm.apellido,
      sm.rut,
      sm.correo,
      sm.telefono,
      sm.id_plan,
      sm.mensaje,
      sm.estado,
      sm.fecha_solicitud,
      p.nombre AS plan_nombre,
      p.descripcion AS plan_descripcion,
      p.cantidad_clases_practicas AS plan_clases_practicas,
      p.cantidad_clases_teoricas AS plan_clases_teoricas,
      p.valor AS plan_valor,
      p.tipo AS plan_tipo,
      p.estado AS plan_estado
    FROM solicitudes_matricula sm
    INNER JOIN planes p ON sm.id_plan = p.id_plan
    WHERE sm.id_solicitud = $1
    LIMIT 1
    `,
    [Number(id)]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function updateSolicitudMatricula(id, solicitudData) {
  const solicitud = await solicitudRepository().findOne({
    where: {
      id_solicitud: Number(id),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudRepository().update(
    { id_solicitud: Number(id) },
    solicitudData
  );

  return await getSolicitudMatriculaDetalleById(id);
}

export async function deleteSolicitudMatricula(id) {
  const solicitud = await solicitudRepository().findOne({
    where: {
      id_solicitud: Number(id),
    },
  });

  if (!solicitud) {
    return null;
  }

  await solicitudRepository().remove(solicitud);

  return solicitud;
}
