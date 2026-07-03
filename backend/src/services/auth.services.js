"use strict";

import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entitys/usuario.entity.js";

function usuarioRepository() {
  return AppDataSource.getRepository(Usuario);
}

export async function getUsuarioByCorreo(correo) {
  return await usuarioRepository().findOne({
    where: {
      correo,
    },
  });
}

export async function crearUsuarioAuth({
  correo,
  password,
  rol,
  id_profesor = null,
  id_alumno = null,
  estado = true,
  debe_cambiar_password = true,
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const nuevoUsuario = usuarioRepository().create({
    correo,
    password_hash: passwordHash,
    rol,
    id_profesor,
    id_alumno,
    estado,
    debe_cambiar_password,
  });

  return await usuarioRepository().save(nuevoUsuario);
}

export async function compararPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
}