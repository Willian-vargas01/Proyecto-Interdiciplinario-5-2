import { formatear } from './formato.js';
import { OPCIONES_ZONA } from './zonas.js';

const texto = (nombre, etiqueta) => ({ nombre, etiqueta, tipo: 'text' });
const numero = (nombre, etiqueta) => ({ nombre, etiqueta, tipo: 'number' });
const fecha = (nombre, etiqueta) => ({ nombre, etiqueta, tipo: 'date' });
const correo = (nombre, etiqueta) => ({ nombre, etiqueta, tipo: 'email' });
const clave = (nombre, etiqueta) => ({ nombre, etiqueta, tipo: 'password' });
const elegir = (nombre, etiqueta, opciones, visible) => ({ nombre, etiqueta, tipo: 'select', opciones, visible });
const referencia = (nombre, etiqueta, ref) => ({ nombre, etiqueta, tipo: 'ref', ref });

const refLote = {
  ruta: '/lotes',
  id: 'id_lote',
  nombre: 'codigo_lote',
  texto: (f) => `${f.codigo_lote} (${formatear(f.cantidad_actual, 'entero')} aves)`
};

const refAve = {
  ruta: '/aves',
  id: 'id_ave',
  nombre: 'codigo_ave',
  texto: (f) => `${f.codigo_ave} (lote ${f.codigo_lote})`
};

const refProducto = (tipo) => ({
  ruta: '/inventario',
  id: 'id_inventario',
  nombre: 'nombre_producto',
  filtro: tipo ? (f) => f.tipo === tipo : undefined,
  texto: (f) => `${f.nombre_producto} (${formatear(f.cantidad_stock, 'decimal')} ${f.unidad_medida})`
});

const estadosAve = [['Sano', 'Sano'], ['Enfermo', 'Enfermo'], ['Muerto', 'Muerto']];
const estadosLote = [['EN_CRECIMIENTO', 'En crecimiento'], ['LISTO_PARA_VENTA', 'Listo para venta'], ['FINALIZADO', 'Finalizado']];
const tiposProducto = [['Alimento', 'Alimento'], ['Medicamento', 'Medicamento'], ['Insumo', 'Insumo']];
const roles = [['Admin', 'Administrador'], ['Supervisor', 'Supervisor'], ['Empleado', 'Empleado']];
const esEmpleado = (v) => v.rol === 'Empleado';

const camposEmpleado = [
  texto('nombre', 'Nombre'),
  texto('apellido', 'Apellido'),
  correo('email', 'Correo'),
  elegir('rol', 'Rol', roles),
  elegir('zona', 'Zona de trabajo', OPCIONES_ZONA, esEmpleado)
];

export const modulos = [
  {
    id: 'lotes',
    titulo: 'Lotes',
    zona: 'Lotes',
    icono: 'lotes',
    ruta: '/lotes',
    vacio: 'Todavía no hay lotes cargados.',
    columnas: [
      { clave: 'codigo_lote', titulo: 'Código' },
      { clave: 'fecha_ingreso', titulo: 'Ingreso', tipo: 'fecha' },
      { clave: 'cantidad_inicial', titulo: 'Aves al ingreso', tipo: 'entero' },
      { clave: 'cantidad_actual', titulo: 'Aves actuales', tipo: 'entero' },
      { clave: 'estado', titulo: 'Estado', tipo: 'estado' }
    ],
    acciones: [
      { clave: 'lote.crear', titulo: 'Nuevo lote', boton: 'Guardar lote', campos: [texto('codigo_lote', 'Código del lote'), fecha('fecha_ingreso', 'Fecha de ingreso'), numero('cantidad', 'Cantidad de aves')] },
      { clave: 'lote.estado', titulo: 'Cambiar estado', boton: 'Guardar estado', campos: [referencia('id_lote', 'Lote', refLote), elegir('estado', 'Estado nuevo', estadosLote)] }
    ]
  },
  {
    id: 'aves',
    titulo: 'Aves',
    zona: 'Aves',
    icono: 'aves',
    ruta: '/aves',
    vacio: 'Todavía no hay aves registradas.',
    columnas: [
      { clave: 'codigo_ave', titulo: 'Código' },
      { clave: 'codigo_lote', titulo: 'Lote' },
      { clave: 'raza', titulo: 'Raza' },
      { clave: 'peso_kg', titulo: 'Peso (kg)', tipo: 'decimal' },
      { clave: 'estado_salud', titulo: 'Salud', tipo: 'estado' }
    ],
    acciones: [
      { clave: 'ave.crear', titulo: 'Nueva ave', boton: 'Guardar ave', campos: [texto('codigo', 'Código del ave'), texto('raza', 'Raza'), numero('peso', 'Peso en kg'), elegir('estado_salud', 'Salud', estadosAve), referencia('id_lote', 'Lote', refLote)] },
      { clave: 'ave.estado', titulo: 'Cambiar salud', boton: 'Guardar salud', campos: [referencia('id_ave', 'Ave', refAve), elegir('estado_salud', 'Salud nueva', estadosAve)] }
    ]
  },
  {
    id: 'vacunacion',
    titulo: 'Vacunación',
    zona: 'Vacunacion',
    icono: 'vacunacion',
    ruta: '/vacunacion',
    vacio: 'Todavía no hay vacunaciones registradas.',
    columnas: [
      { clave: 'fecha_aplicacion', titulo: 'Fecha', tipo: 'fecha' },
      { clave: 'codigo_lote', titulo: 'Lote' },
      { clave: 'vacuna', titulo: 'Vacuna' },
      { clave: 'dosis_aplicada', titulo: 'Dosis', tipo: 'decimal' },
      { clave: 'empleado', titulo: 'Aplicó' }
    ],
    acciones: [
      { clave: 'vacunacion.crear', titulo: 'Registrar vacunación', boton: 'Guardar vacunación', campos: [referencia('id_lote', 'Lote', refLote), referencia('id_inventario', 'Vacuna', refProducto('Medicamento')), fecha('fecha', 'Fecha de aplicación'), numero('dosis', 'Dosis aplicada')] }
    ]
  },
  {
    id: 'alimentacion',
    titulo: 'Alimentación',
    zona: 'Alimentacion',
    icono: 'alimentacion',
    ruta: '/alimentacion',
    vacio: 'Todavía no hay registros de alimentación.',
    columnas: [
      { clave: 'fecha_registro', titulo: 'Fecha', tipo: 'fechahora' },
      { clave: 'codigo_lote', titulo: 'Lote' },
      { clave: 'alimento', titulo: 'Alimento' },
      { clave: 'cantidad_kg', titulo: 'Cantidad (kg)', tipo: 'decimal' }
    ],
    acciones: [
      { clave: 'alimentacion.crear', titulo: 'Registrar alimentación', boton: 'Guardar alimentación', campos: [referencia('id_lote', 'Lote', refLote), referencia('id_inventario', 'Alimento', refProducto('Alimento')), numero('cantidad_kg', 'Cantidad en kg')] }
    ]
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    zona: 'Inventario',
    icono: 'inventario',
    ruta: '/inventario',
    vacio: 'Todavía no hay productos en el inventario.',
    columnas: [
      { clave: 'nombre_producto', titulo: 'Producto' },
      { clave: 'tipo', titulo: 'Tipo' },
      { clave: 'cantidad_stock', titulo: 'Stock', tipo: 'decimal' },
      { clave: 'unidad_medida', titulo: 'Unidad' },
      { clave: 'stock_minimo', titulo: 'Mínimo', tipo: 'decimal' }
    ],
    acciones: [
      { clave: 'inventario.crear', titulo: 'Nuevo producto', boton: 'Guardar producto', campos: [texto('nombre', 'Producto'), elegir('tipo', 'Tipo', tiposProducto), numero('cantidad_stock', 'Stock inicial'), texto('unidad_medida', 'Unidad de medida'), numero('stock_minimo', 'Stock mínimo')] },
      { clave: 'inventario.ingreso', titulo: 'Ingresar stock', boton: 'Guardar ingreso', campos: [referencia('id_inventario', 'Producto', refProducto()), numero('cantidad', 'Cantidad que ingresa')] }
    ]
  },
  {
    id: 'ventas',
    titulo: 'Ventas',
    zona: 'Ventas',
    icono: 'ventas',
    ruta: '/ventas',
    vacio: 'Todavía no hay ventas registradas.',
    columnas: [
      { clave: 'fecha_venta', titulo: 'Fecha', tipo: 'fechahora' },
      { clave: 'cliente', titulo: 'Cliente' },
      { clave: 'codigo_lote', titulo: 'Lote' },
      { clave: 'cantidad_aves', titulo: 'Aves vendidas', tipo: 'entero' },
      { clave: 'precio_unitario', titulo: 'Precio por ave', tipo: 'dinero' },
      { clave: 'total', titulo: 'Total', tipo: 'dinero' },
      { clave: 'empleado', titulo: 'Vendedor' }
    ],
    acciones: [
      {
        clave: 'venta.crear',
        titulo: 'Nueva venta',
        boton: 'Guardar venta',
        campos: [texto('cliente', 'Cliente'), referencia('id_lote', 'Lote', refLote), numero('cantidad', 'Cantidad de aves'), numero('precio_unitario', 'Precio por ave')],
        resumen: (v) => (v.cantidad && v.precio_unitario ? `Total a cobrar: ${formatear(v.cantidad * v.precio_unitario, 'dinero')}` : null)
      }
    ]
  },
  {
    id: 'personal',
    titulo: 'Personal',
    roles: ['Admin'],
    icono: 'personal',
    ruta: '/empleados',
    vacio: 'Todavía no hay empleados cargados.',
    columnas: [
      { clave: 'nombre', titulo: 'Nombre' },
      { clave: 'apellido', titulo: 'Apellido' },
      { clave: 'email', titulo: 'Correo' },
      { clave: 'rol', titulo: 'Rol' },
      { clave: 'zona', titulo: 'Zona', tipo: 'zona' }
    ],
    acciones: [
      { ruta: '/empleados', titulo: 'Nuevo empleado', boton: 'Crear empleado', campos: [...camposEmpleado, clave('password', 'Contraseña inicial')] }
    ],
    editar: { titulo: 'Editar empleado', boton: 'Guardar cambios', campos: camposEmpleado, ruta: (f) => `/empleados/${f.id_empleado}` },
    baja: (f) => `/empleados/${f.id_empleado}`
  }
];

export const modulosVisibles = (usuario) =>
  modulos.filter((m) => (m.roles ? m.roles.includes(usuario.rol) : usuario.rol !== 'Empleado' || m.zona === usuario.zona));

export const catalogo = Object.fromEntries(
  modulos.flatMap((m) => m.acciones.filter((a) => a.clave).map((a) => [a.clave, { ...a, modulo: m.titulo }]))
);
