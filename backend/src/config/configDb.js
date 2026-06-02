"use strict";
import {DataSource} from "typeorm";
import {DATABASE, DB_USERNAME, HOST, DB_PASSWORD} from "./configEnv.js";
import Alumno from "../entitys/alumno.entity.js";
import SalaPsicotecnica from "../entitys/salaPsicotecnica.entity.js";
import ReservaSala from "../entitys/reservaSala.entity.js";
import {ProfesorEntity} from "../entitys/profesor.entity.js";
import Vehiculo from "../entitys/vehiculo.entity.js";
import ClasePractica from "../entitys/clasePractica.entity.js";
import ClaseTeorica from "../entitys/claseTeorica.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: `${HOST}`,
    port: 5432,
    username: `${DB_USERNAME}`,
    password: `${DB_PASSWORD}`,
    database: `${DATABASE}`,
    entities: [Alumno, SalaPsicotecnica, ReservaSala, ProfesorEntity, Vehiculo, ClasePractica, ClaseTeorica],
    synchronize: true, // Cambia a false en producción para evitar pérdida de datos
    logging: false,
});

export async function connectDb() {
    try {
        await AppDataSource.initialize();
        console.log("Conexion exitosa a la base de datos.");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}