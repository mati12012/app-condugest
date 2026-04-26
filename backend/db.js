const { Pool } = require('pg');

const pool = new Pool({
  user: 'user2',
  host: 'localhost',
  database: 'user2_db',
  password: 'U@er2',
  port: 5432,
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL (user2_db)'))
  .catch(err => console.error('Error de conexión:', err.stack));

module.exports = pool;