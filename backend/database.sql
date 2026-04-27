-- Inicializa la base de datos en PostgreSQL
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    licencia VARCHAR(20),
    sede VARCHAR(50),
    clases_completadas INTEGER DEFAULT 0,
    total_clases INTEGER DEFAULT 12,
    estado VARCHAR(50) DEFAULT 'Activo'
);

-- Inserta un alumno de prueba
INSERT INTO alumnos (nombre, correo, licencia, sede) 
VALUES ('Juan Perez', 'juan@alumno.cl', 'Clase B', 'Sede Centro');

-- Hace commit
COMMIT;