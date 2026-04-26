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
        const result = await pool.query('SELECT * FROM alumnos WHERE correo = $1', [correo]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Alumno no encontrado" });
        }
    } catch (err) {
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
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});