const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1ra ruta: Obtener datos de un alumno por su correo (Esto es para el login)
app.get('/api/alumnos/correo/:correo', async (req, res) => {
    try {
        const { correo } = req.params;
        console.log("-> Intentando buscar el correo:", correo);

        // Busqueda pero ignorando mayusculas
        const result = await pool.query('SELECT * FROM alumnos WHERE LOWER(correo) = LOWER($1)', [correo]);
        
        if (result.rows.length > 0) {
            console.log("-> Exito: Alumno encontrado en BD");
            res.json(result.rows[0]);
        } else {
            console.log("-> Fallo: No existe en BD");
            res.status(404).json({ error: "Alumno no encontrado" });
        }
    } catch (err) {
        console.error("-> ERROR FATAL EN POSTGRESQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2da ruta: Registrar un nuevo alumno (Esto es para la secretaria)
app.post('/api/alumnos', async (req, res) => {
    try {
        const { nombre, correo, licencia, sede } = req.body;
        const result = await pool.query(
            'INSERT INTO alumnos (nombre, correo, licencia, sede) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correo, licencia, sede]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("-> ERROR AL GUARDAR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => {
    console.log('Servidor backend corriendo en http://localhost:3001');
});