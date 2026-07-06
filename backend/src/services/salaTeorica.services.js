"use strict";

import { AppDataSource } from "../config/configDb.js";
import SalaTeorica from "../entitys/salaTeorica.entity.js";

function getSalaTeoricaRepository() {
  return AppDataSource.getRepository(SalaTeorica);
}

export async function createSalaTeorica(data) {
  const salaRepository = getSalaTeoricaRepository();
  const nuevaSala = salaRepository.create(data);

  return await salaRepository.save(nuevaSala);
}

export async function getAllSalasTeoricas() {
  const salaRepository = getSalaTeoricaRepository();

  return await salaRepository.find({
    order: {
      estado: "ASC",
      nombre: "ASC",
    },
  });
}

export async function getSalaTeoricaById(id) {
  const salaRepository = getSalaTeoricaRepository();

  return await salaRepository.findOneBy({
    id_sala_teorica: Number(id),
  });
}

export async function updateSalaTeorica(id, data) {
  const salaRepository = getSalaTeoricaRepository();
  const salaExistente = await getSalaTeoricaById(id);

  if (!salaExistente) return null;

  await salaRepository.update(
    { id_sala_teorica: Number(id) },
    data
  );

  return await getSalaTeoricaById(id);
}

export async function deleteSalaTeorica(id) {
  const salaRepository = getSalaTeoricaRepository();
  const salaExistente = await getSalaTeoricaById(id);

  if (!salaExistente) return null;

  await salaRepository.delete({
    id_sala_teorica: Number(id),
  });

  return salaExistente;
}
