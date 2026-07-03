"use strict";

import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entitys/usuario.entity.js";

async function crearUsuarioSecretaria() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const correo = "secretaria@admin.condugest.cl";
    const password = "Admin1234";

    const usuarioExistente = await usuarioRepository.findOne({
      where: {
        correo,
      },
    });

    if (usuarioExistente) {
      console.log("El usuario secretaria ya existe:");
      console.log(correo);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = usuarioRepository.create({
      correo,
      password_hash: passwordHash,
      rol: "secretaria",
      id_profesor: null,
      id_alumno: null,
      estado: true,
      debe_cambiar_password: false,
    });

    await usuarioRepository.save(nuevoUsuario);

    console.log("Usuario secretaria creado exitosamente");
    console.log("Correo:", correo);
    console.log("Contraseña:", password);
  } catch (error) {
    console.error("Error al crear usuario secretaria:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(0);
  }
}

crearUsuarioSecretaria();