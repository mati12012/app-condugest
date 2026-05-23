# ConduGest

ConduGest es una aplicación web orientada a la gestión académica y administrativa de una escuela de conducción. El sistema está diseñado para ser utilizado tanto por alumnos como por trabajadores de la institución, permitiendo centralizar información relacionada con alumnos, clases, reservas, salas, profesores, vehículos y agenda operativa.

El objetivo principal del proyecto es facilitar la organización interna de la escuela, mejorar el seguimiento del proceso formativo de los alumnos y entregar herramientas de gestión a los usuarios administrativos, especialmente Secretaría.

---
## Integrantes
Matias Ignacio Caamaño Chacon
Felipe Ignacio Riquelme Suarez
## Usuarios del sistema

El software contempla distintos tipos de usuarios según su rol dentro de la escuela de conducción.

### Alumno

El alumno podrá acceder al sistema para consultar información relacionada con su proceso académico, avance en clases, estado de matrícula y progreso general dentro del curso.

### Secretaría

El usuario con rol de Secretaría podrá realizar tareas administrativas y operativas, tales como gestionar alumnos, consultar disponibilidad de recursos, reservar salas psicotécnicas y revisar la agenda diaria de actividades.

### Profesor

El profesor podrá consultar clases asignadas, revisar información de alumnos asociados y apoyar el seguimiento académico según las funcionalidades disponibles en el sistema.

### Administrador

El administrador podrá supervisar la información general del sistema y gestionar configuraciones o recursos asociados a la operación de la escuela.

---

## Funcionalidades principales del sistema

El proyecto contempla las siguientes funcionalidades principales:

### Gestión de alumnos

Permite registrar, consultar, actualizar y controlar información de los alumnos inscritos en la escuela de conducción.

Información considerada:

- Nombre del alumno
- Correo electrónico
- Tipo de licencia
- Sede
- Clases completadas
- Total de clases del plan
- Estado del alumno

### Seguimiento académico del alumno

Permite visualizar el avance del alumno dentro de su proceso formativo, considerando clases completadas, clases pendientes y estado general del proceso.

### Gestión de salas psicotécnicas

Permite administrar las salas utilizadas para evaluaciones o actividades psicotécnicas.

Funcionalidades:

- Crear sala psicotécnica
- Listar salas registradas
- Buscar sala por ID
- Actualizar información de una sala
- Eliminar o desactivar una sala

### Gestión de reservas de salas psicotécnicas

Permite que Secretaría reserve una sala psicotécnica para una fecha y horario determinado.

Funcionalidades:

- Crear reserva de sala
- Listar reservas
- Buscar reserva por ID
- Actualizar reserva
- Cancelar o eliminar reserva
- Consultar disponibilidad de una sala

Regla de negocio principal:

> El sistema no permite registrar una reserva si la sala ya se encuentra ocupada en el mismo rango horario.

### Agenda operativa

El sistema contempla una agenda para apoyar la planificación diaria o semanal de actividades, clases y reservas asociadas a la operación de la escuela.

### Gestión de profesores

Funcionalidad proyectada para administrar profesores, asignaciones y disponibilidad horaria.

### Gestión de vehículos

Funcionalidad proyectada para administrar vehículos disponibles para clases prácticas de conducción.

### Gestión de clases

Funcionalidad proyectada para programar clases teóricas y prácticas, asignando alumnos, profesores, horarios y recursos disponibles.

---

## Estado actual del proyecto

Actualmente el proyecto se encuentra en desarrollo académico.

Funcionalidades implementadas o en avance:

- Backend base con Node.js y Express.
- Conexión a base de datos PostgreSQL.
- Gestión de alumnos.
- Gestión de salas psicotécnicas.
- Gestión de reservas de salas psicotécnicas.
- Validación de disponibilidad de salas.
- Prevención de choques de horario.
- Frontend en React para vistas administrativas iniciales.

Funcionalidades proyectadas:

- Vista completa para alumno.
- Vista completa para Secretaría.
- Agenda diaria/semanal.
- Gestión de profesores.
- Gestión de vehículos.
- Programación de clases.
- Control de usuarios por rol.
- Reportes administrativos.

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- HTML
- CSS

### Backend

- Node.js
- Express
- TypeORM
- PostgreSQL
- Joi
- Morgan
- Dotenv
- CORS
- Nodemon

### Herramientas de desarrollo

- Git
- GitHub
- Postman
- Visual Studio Code
- PostgreSQL

---

## Estructura general del proyecto

```txt
app-condugest/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── entitys/
│   │   ├── handlers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validations/
│   │   └── index.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
└── README.md