import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

export async function call(nombre, params = []) {
  const marcas = params.map(() => '?').join(',');
  const [res] = await pool.query(`CALL ${nombre}(${marcas})`, params);
  return Array.isArray(res) ? res : [];
}
