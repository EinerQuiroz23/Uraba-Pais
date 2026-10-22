import pg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno antes de crear el pool
dotenv.config();

const { Pool } = pg;

/**
 * Pool de conexiones PostgreSQL para uraba_pais_db
 * Gestiona conexiones reutilizables al motor relacional.
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'uraba_pais_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log de eventos del pool
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool] Error inesperado en cliente idle:', err.message);
});

/**
 * Ejecuta una consulta SQL parametrizada
 * @param {string} text - Query SQL con placeholders $1, $2, ...
 * @param {Array} params - Valores de los parámetros
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente del pool para transacciones manuales
 * @returns {Promise<pg.PoolClient>}
 */
export const getClient = () => pool.connect();

/**
 * Verifica la conexión a la base de datos
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() AS server_time');
    console.log(`[PostgreSQL] ✅ Conexión exitosa a "${process.env.DB_NAME || 'uraba_pais_db'}". Hora del servidor: ${res.rows[0].server_time}`);
    return true;
  } catch (err) {
    console.error(`[PostgreSQL] ❌ Error de conexión:`, err.message);
    return false;
  }
};

export default pool;
