"use strict";
import { EntitySchema } from "typeorm";

const Alumno = new EntitySchema({
    name: "Alumno",
    tableName: "alumnos",
    columns: {
        id_alumno: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        correo: {
            type: "varchar",
            length: 100,
            unique: true,
            nullable: false,
        },
        licencia: {
            type: "varchar",
            length: 20,
            nullable: false,
        },
        sede: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        clases_completadas: {
            type: "int",
            nullable: false,
        },
        total_clases: {
            type: "int",
            nullable: false,
        },
        estado: {
            type: "boolean",
            default: true,
        },
    },
});

export default Alumno;

