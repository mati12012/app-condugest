import { AppDataSource } from "../config/configDb.js";
import Plan from "../entitys/plan.entity.js";

function planRepository() {
  return AppDataSource.getRepository(Plan);
}

export async function getAllPlanes() {
  return await planRepository().find({
    order: {
      id_plan: "ASC",
    },
  });
}

export async function getPlanesActivosPublicos() {
  return await planRepository().find({
    select: {
      id_plan: true,
      nombre: true,
      descripcion: true,
      cantidad_clases_practicas: true,
      cantidad_clases_teoricas: true,
      valor: true,
      tipo: true,
    },
    where: {
      estado: "Activo",
    },
    order: {
      id_plan: "ASC",
    },
  });
}

export async function getPlanById(id) {
  return await planRepository().findOne({
    where: {
      id_plan: Number(id),
    },
  });
}

export async function createPlan(planData) {
  const nuevoPlan = planRepository().create(planData);
  return await planRepository().save(nuevoPlan);
}

export async function updatePlan(id, planData) {
  const plan = await getPlanById(id);

  if (!plan) {
    return null;
  }

  const planActualizado = planRepository().merge(plan, planData);

  return await planRepository().save(planActualizado);
}

export async function deletePlan(id) {
  const plan = await getPlanById(id);

  if (!plan) {
    return null;
  }

  await planRepository().remove(plan);

  return plan;
}
