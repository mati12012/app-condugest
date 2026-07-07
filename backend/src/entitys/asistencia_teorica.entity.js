"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaTeorica = new EntitySchema({
    name: "AsistenciaTeorica",
    tableName: "asistencias_teoricas",
    columns: {
        id_asistencia: {
            type: "int",
            primary: true,
            generated: true,
        },
        id_clase_teorica: {
            type: "int",
            nullable: false,
        },
        id_alumno: {
            type: "int",
            nullable: false,
        },
        estado_asistencia: {
            type: "varchar",
            length: 20,
            nullable: false,
            default: "Pendiente", 
        },
        modo_participacion: {
            type: "varchar",
            length: 20,
            nullable: false,
            default: "Presencial",
        },
        fecha_registro: {
            type: "timestamp",
            createDate: true,
        }
    },
    foreignKeys: [
        {
            name: "fk_asistencia_clase_teorica",
            target: "ClaseTeorica",
            columnNames: ["id_clase_teorica"],
            referencedColumnNames: ["id_clase_teorica"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        {
            name: "fk_asistencia_alumno",
            target: "Alumno",
            columnNames: ["id_alumno"],
            referencedColumnNames: ["id_alumno"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        }
    ]
});

export default AsistenciaTeorica;
