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
        rut: {
            type: "varchar",
            length: 12,
            unique: true,
            nullable: false,
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
            default: 0,
        },
        total_clases: {
            type: "int",
            nullable: false,
        },
        estado: {
            type: "varchar",
            length: 50,
            default: "Matriculado",
        },
    },
});

export default Alumno;

