"use strict";

import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/configDb.js";
import Usuario from "../entitys/usuario.entity.js";

const PASSWORD_ALUMNOS = "Alumno1234";

async function resetPasswordAlumnos() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const usuariosAlumnos = await usuarioRepository.find({
      where: {
        rol: "alumno",
      },
    });

    if (usuariosAlumnos.length === 0) {
      console.log("No existen usuarios con rol alumno.");
      return;
    }

    const passwordHash = await bcrypt.hash(PASSWORD_ALUMNOS, 10);

    for (const usuario of usuariosAlumnos) {
      usuario.password_hash = passwordHash;
      usuario.debe_cambiar_password = true;

      await usuarioRepository.save(usuario);
    }

    console.log("Contraseña actualizada para todos los alumnos.");
    console.log("Cantidad de alumnos actualizados:", usuariosAlumnos.length);
    console.log("Nueva contraseña:", PASSWORD_ALUMNOS);
  } catch (error) {
    console.error("Error al resetear contraseña de alumnos:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit(0);
  }
}

resetPasswordAlumnos();