export const ACCIONES = {
  'lote.crear': {
    zona: 'Lotes',
    sp: 'sp_registrarLote',
    requeridos: ['codigo_lote', 'fecha_ingreso', 'cantidad'],
    params: (d) => [d.codigo_lote, d.fecha_ingreso, d.cantidad]
  },
  'lote.estado': {
    zona: 'Lotes',
    sp: 'sp_cambiarEstadoLote',
    requeridos: ['id_lote', 'estado'],
    params: (d) => [d.id_lote, d.estado]
  },
  'ave.crear': {
    zona: 'Aves',
    sp: 'sp_registrarAve',
    requeridos: ['codigo', 'raza', 'peso', 'estado_salud', 'id_lote'],
    params: (d) => [d.codigo, d.raza, d.peso, d.estado_salud, d.id_lote]
  },
  'ave.estado': {
    zona: 'Aves',
    sp: 'sp_cambiarEstadoAve',
    requeridos: ['id_ave', 'estado_salud'],
    params: (d) => [d.id_ave, d.estado_salud]
  },
  'vacunacion.crear': {
    zona: 'Vacunacion',
    sp: 'sp_registrarVacunacion',
    requeridos: ['id_lote', 'id_inventario', 'fecha', 'dosis'],
    params: (d, u) => [d.id_lote, d.id_inventario, d.fecha, d.dosis, u.id]
  },
  'alimentacion.crear': {
    zona: 'Alimentacion',
    sp: 'sp_registrarAlimentacion',
    requeridos: ['id_lote', 'id_inventario', 'cantidad_kg'],
    params: (d) => [d.id_lote, d.id_inventario, d.cantidad_kg]
  },
  'inventario.crear': {
    zona: 'Inventario',
    sp: 'sp_registrarProducto',
    requeridos: ['nombre', 'tipo', 'cantidad_stock', 'unidad_medida', 'stock_minimo'],
    params: (d) => [d.nombre, d.tipo, d.cantidad_stock, d.unidad_medida, d.stock_minimo]
  },
  'inventario.ingreso': {
    zona: 'Inventario',
    sp: 'sp_ingresarStock',
    requeridos: ['id_inventario', 'cantidad'],
    params: (d) => [d.id_inventario, d.cantidad]
  },
  'venta.crear': {
    zona: 'Ventas',
    sp: 'sp_registrarVenta',
    requeridos: ['cliente', 'id_lote', 'cantidad', 'precio_unitario'],
    params: (d, u) => [d.cliente, u.id, d.id_lote, d.cantidad, d.precio_unitario]
  }
};

export const datosCompletos = (definicion, datos) =>
  Boolean(datos) && definicion.requeridos.every((k) => datos[k] !== undefined && datos[k] !== null && String(datos[k]).trim() !== '');
