import jwt from 'jsonwebtoken';

export const ZONAS = ['Lotes', 'Aves', 'Vacunacion', 'Alimentacion', 'Inventario', 'Ventas'];
export const ROLES = ['Admin', 'Supervisor', 'Empleado'];

export const esSupervisor = (usuario) => usuario.rol === 'Admin' || usuario.rol === 'Supervisor';
export const puedeZona = (usuario, zona) => esSupervisor(usuario) || usuario.zona === zona;

export const sesion = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'La sesión venció, volvé a ingresar' });
  }
};

export const soloRoles = (...roles) => (req, res, next) =>
  roles.includes(req.user.rol) ? next() : res.status(403).json({ error: 'No tenés permiso para esta acción' });

export const deZona = (zona) => (req, res, next) =>
  puedeZona(req.user, zona) ? next() : res.status(403).json({ error: 'Esa sección no corresponde a tu zona' });
