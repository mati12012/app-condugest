"use strict";
import {DataSource} from "typeorm";
import {DATABASE, DB_USERNAME, DB_HOST, DB_PASSWORD, DB_PORT} from "./configEnv.js";
import Alumno from "../entitys/alumno.entity.js";
import SalaPsicotecnica from "../entitys/salaPsicotecnica.entity.js";
import SalaTeorica from "../entitys/salaTeorica.entity.js";
import ReservaSala from "../entitys/reservaSala.entity.js";
import {ProfesorEntity} from "../entitys/profesor.entity.js";
import Vehiculo from "../entitys/vehiculo.entity.js";
import ClasePractica from "../entitys/clasePractica.entity.js";
import ClaseTeorica from "../entitys/claseTeorica.entity.js";
import Usuario from "../entitys/usuario.entity.js";
import Plan from "../entitys/plan.entity.js";
import SolicitudMatricula from "../entitys/solicitudMatricula.entity.js";
import Matricula from "../entitys/matricula.entity.js";
import Pago from "../entitys/pago.entity.js";
import AsistenciaTeorica from "../entitys/asistencia_teorica.entity.js";
import EvaluacionPractica from "../entitys/evaluacionPractica.entity.js";
import SolicitudReprogramacion from "../entitys/solicitudReprogramacion.entity.js";
import MaterialEstudio from "../entitys/materialEstudio.entity.js";
import SolicitudExamen from "../entitys/solicitudExamen.entity.js";
import DisponibilidadProfesor from "../entitys/disponibilidadProfesor.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DATABASE,
    entities: [Alumno, SalaPsicotecnica, SalaTeorica, ReservaSala, ProfesorEntity, Vehiculo, ClasePractica, ClaseTeorica, Usuario, Plan, SolicitudMatricula, Matricula, Pago, AsistenciaTeorica, EvaluacionPractica, SolicitudReprogramacion, MaterialEstudio, SolicitudExamen, DisponibilidadProfesor],
    synchronize: true, // Cambiar a false en producción para evitar pérdida de datos
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
