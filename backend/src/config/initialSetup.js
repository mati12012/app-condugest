"use strict";
import bcrypt from "bcrypt";
import {AppDataSource} from "./configDb.js";
import {User} from "../entities/User.js";

export async function encryptPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function createUsers() { 
    try {
        const userRepository = AppDataSource.getRepository(User);
        const count = await userRepository.count();
        if (count > 0) return;

        const now = new Date();

        //Crear usuarios iniciales para el sistema
        await Promise.all([
            userRepository.save({
                nombre: "Admin",
                apellido: "Sistema",
                email: "admin@example.com",
                password: await encryptPassword("admin123"),
                rol: "admin",
                estado_activo: true,
            })
        ]);
    } catch (error) {
        console.error("Error creating initial users:", error);
    }
}
