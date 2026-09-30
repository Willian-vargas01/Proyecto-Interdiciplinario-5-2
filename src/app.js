import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { call } from './db.js';
import { ROLES, ZONAS, esSupervisor, puedeZona, sesion, soloRoles, deZona } from './auth.js';
import { ACCIONES, datosCompletos } from './acciones.js';
import { falla, manejar } from './util.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.post('/api/auth/login', manejar(async (req, res) => {
  const { email, password } = req.body;
  const [[usuario]] = await call('sp_loginEmpleado', [email]);
  if (!usuario) throw falla(401, 'Correo o contraseña incorrectos');
  const claveCorrecta = await bcrypt.compare(password || '', usuario.password_hash);
  if (!claveCorrecta) throw falla(401, 'Correo o contraseña incorrectos');
  const datosUsuario = { id: usuario.id_empleado, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol, zona: usuario.zona };
  const token = jwt.sign(datosUsuario, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: datosUsuario });
}));

app.get('/api/lotes', sesion, manejar(async (req, res) => {
  const [filas] = await call('sp_listarLotes');
  res.json(filas || []);
}));

app.get('/api/inventario', sesion, manejar(async (req, res) => {
  const [filas] = await call('sp_listarInventario');
  res.json(filas || []);
}));

app.get('/api/inventario/alertas', sesion, manejar(async (req, res) => {
  const [filas] = await call('sp_alertasStock');
  res.json(filas || []);
}));

app.get('/api/aves', sesion, deZona('Aves'), manejar(async (req, res) => {
  const [filas] = await call('sp_AvesPorLote', [req.query.lote ?? null]);
  res.json(filas || []);
}));

app.get('/api/alimentacion', sesion, deZona('Alimentacion'), manejar(async (req, res) => {
  const [filas] = await call('sp_listarAlimentacion');
  res.json(filas || []);
}));

app.get('/api/vacunacion', sesion, deZona('Vacunacion'), manejar(async (req, res) => {
  const [filas] = await call('sp_listarVacunacion');
  res.json(filas || []);
}));

app.get('/api/ventas', sesion, deZona('Ventas'), manejar(async (req, res) => {
  const [filas] = await call('sp_listarVentas');
  res.json(filas || []);
}));

app.get('/api/ventas/:id', sesion, deZona('Ventas'), manejar(async (req, res) => {
  const [filas] = await call('sp_detalleVenta', [req.params.id]);
  res.json(filas || []);
}));

app.get('/api/reportes/lotes', sesion, soloRoles('Admin', 'Supervisor'), manejar(async (req, res) => {
  const [filas] = await call('sp_reporteLotes');
  res.json(filas || []);
}));

app.get('/api/reportes/mortalidad', sesion, soloRoles('Admin', 'Supervisor'), manejar(async (req, res) => {
  const [filas] = await call('sp_reporteMortalidad');
  res.json(filas || []);
}));

app.get('/api/reportes/ventas-empleados', sesion, soloRoles('Admin'), manejar(async (req, res) => {
  const [filas] = await call('sp_reporteVentasEmpleados');
  res.json(filas || []);
}));

// Acá entran las altas y modificaciones de las zonas (lotes, aves, inventario,
// alimentación, vacunación y ventas). Si quien pide es supervisor o admin, se
// ejecuta directo. Si es un empleado, en vez de ejecutar el cambio se guarda
// como una solicitud pendiente, para que un supervisor la revise después.
app.post('/api/acciones', sesion, manejar(async (req, res) => {
  const { accion, datos } = req.body;
  const definicion = ACCIONES[accion];
  if (!definicion) throw falla(400, 'La acción pedida no existe');
  if (!puedeZona(req.user, definicion.zona)) throw falla(403, 'Esa acción no corresponde a tu zona');
  if (!datosCompletos(definicion, datos)) throw falla(400, 'Completá todos los datos');

  if (esSupervisor(req.user)) {
    await call(definicion.sp, definicion.params(datos, req.user));
    return res.json({ estado: 'Ejecutada' });
  }
  await call('sp_crearSolicitud', [accion, JSON.stringify(datos), req.user.id]);
  res.status(201).json({ estado: 'Pendiente' });
}));

app.get('/api/solicitudes', sesion, manejar(async (req, res) => {
  const estado = { Pendiente: 'Pendiente', Historial: 'Historial' }[req.query.estado] ?? null;
  const propietario = esSupervisor(req.user) ? null : req.user.id;
  const [filas] = await call('sp_listarSolicitudes', [estado, propietario]);
  res.json((filas || []).map((s) => ({ ...s, datos: JSON.parse(s.datos) })));
}));

app.post('/api/solicitudes/:id/aprobar', sesion, soloRoles('Admin', 'Supervisor'), manejar(async (req, res) => {
  const [[solicitud]] = await call('sp_obtenerSolicitud', [req.params.id]);
  if (!solicitud) throw falla(404, 'La solicitud no existe');
  const definicion = ACCIONES[solicitud.accion];
  if (!definicion) throw falla(400, 'La acción de esta solicitud ya no existe');

  await call('sp_resolverSolicitud', [solicitud.id_solicitud, 'Aprobada', req.user.id, null]);
  try {
    const datosOriginales = JSON.parse(solicitud.datos);
    await call(definicion.sp, definicion.params(datosOriginales, { id: solicitud.id_solicitante }));
  } catch (error) {
    // Si al aplicar el cambio real algo sale mal (por ejemplo, ya no hay
    // stock), la solicitud vuelve a quedar pendiente en vez de perderse.
    await call('sp_reabrirSolicitud', [solicitud.id_solicitud]);
    throw error;
  }
  res.json({ ok: true });
}));

app.post('/api/solicitudes/:id/rechazar', sesion, soloRoles('Admin', 'Supervisor'), manejar(async (req, res) => {
  const motivo = String(req.body.motivo || '').trim().slice(0, 255);
  if (!motivo) throw falla(400, 'Escribí el motivo del rechazo');
  await call('sp_resolverSolicitud', [req.params.id, 'Rechazada', req.user.id, motivo]);
  res.json({ ok: true });
}));

function datosEmpleadoValidos(b, requierePassword) {
  if (!b.nombre || !b.apellido || !b.email || !ROLES.includes(b.rol)) throw falla(400, 'Completá todos los datos del empleado');
  if (b.rol === 'Empleado' && !ZONAS.includes(b.zona)) throw falla(400, 'Elegí la zona del empleado');
  if (requierePassword && String(b.password || '').length < 6) throw falla(400, 'La contraseña debe tener al menos 6 caracteres');
  return b.rol === 'Empleado' ? b.zona : null;
}

app.get('/api/empleados', sesion, soloRoles('Admin'), manejar(async (req, res) => {
  const [filas] = await call('sp_listarEmpleados');
  res.json(filas || []);
}));

app.post('/api/empleados', sesion, soloRoles('Admin'), manejar(async (req, res) => {
  const b = req.body;
  const zona = datosEmpleadoValidos(b, true);
  const hash = await bcrypt.hash(b.password, 10);
  await call('sp_registrarEmpleado', [b.nombre, b.apellido, b.email, hash, b.rol, zona]);
  res.status(201).json({ ok: true });
}));

app.put('/api/empleados/:id', sesion, soloRoles('Admin'), manejar(async (req, res) => {
  const b = req.body;
  const zona = datosEmpleadoValidos(b, false);
  await call('sp_modificarEmpleado', [req.params.id, b.nombre, b.apellido, b.email, b.rol, zona]);
  res.json({ ok: true });
}));

app.delete('/api/empleados/:id', sesion, soloRoles('Admin'), manejar(async (req, res) => {
  if (Number(req.params.id) === req.user.id) throw falla(400, 'No podés darte de baja a vos mismo');
  await call('sp_eliminarEmpleado', [req.params.id]);
  res.json({ ok: true });
}));

app.listen(process.env.PORT || 3000);
