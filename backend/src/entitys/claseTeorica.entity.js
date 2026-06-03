"use strict";
import { EntitySchema } from "typeorm";

const ClaseTeorica = new EntitySchema({
    name: "ClaseTeorica",
    tableName: "clases_teoricas",
    columns: {
        id_clase_teorica: {
            type: "int",
            primary: true,
            generated: true,
        },
        tema: {
            type: "varchar",
            length: 150,
            nullable: false,
        },
        fecha: {
            type: "date",
            nullable: false,
        },
        hora_inicio: {
            type: "time",
            nullable: false,
        },
        hora_fin: {
            type: "time",
            nullable: false,
        },
        sede: {
            type: "varchar",
            length: 50,
            nullable: false,
            default: "Sede Concepción",
        },
        estado: {
            type: "varchar",
            length: 50,
            default: "Programada",
        },
    },
    relations: {
        profesor: {
            target: "Profesor",
            type: "many-to-one",
            joinColumn: { name: "id_profesor" },
            onDelete: "SET NULL", // Si se borra al profe, la clase no se borra, solo queda sin un profe asignado
            nullable: true
        }
    }
});

export default ClaseTeorica;