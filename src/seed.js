import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { call, pool } from './db.js';

try {
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await call('sp_registrarEmpleado', ['Admin', 'General', process.env.ADMIN_EMAIL, hash, 'Admin', null]);
  console.log('Administrador creado:', process.env.ADMIN_EMAIL);
} catch (e) {
  console.log(e.code === 'ER_DUP_ENTRY' ? 'El administrador ya existe' : e.message);
}
await pool.end();
