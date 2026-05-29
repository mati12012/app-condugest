import { EntitySchema } from "typeorm";

export const ProfesorEntity = new EntitySchema({
  name: "Profesor",
  tableName: "profesores",
  columns: {
    id_profesor: {
      primary: true,
      type: "int",
      generated: true,
    },
    rut: {
      type: "varchar",
      length: 20,
      unique: true,
      nullable: false,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    correo_institucional: {
      type: "varchar",
      length: 120,
      unique: true,
      nullable: false,
    },
    correo_personal: {
      type: "varchar",
      length: 120,
      unique: true,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    sede: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    licencia_autorizada: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    especialidad: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    estado: {
      type: "boolean",
      default: true,
    },
  },
});