import { ETIQUETA_ZONA } from './zonas.js';

const entero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const dinero = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 });

function fecha(valor, conHora) {
  const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return valor;
  const dia = `${m[3]}/${m[2]}/${m[1]}`;
  return conHora && m[4] ? `${dia} ${m[4]}:${m[5]}` : dia;
}

export function formatear(valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return '—';
  switch (tipo) {
    case 'entero':
      return entero.format(Number(valor));
    case 'decimal':
      return decimal.format(Number(valor));
    case 'dinero':
      return dinero.format(Number(valor));
    case 'fecha':
      return fecha(valor, false);
    case 'fechahora':
      return fecha(valor, true);
    case 'zona':
      return ETIQUETA_ZONA[valor] || valor;
    case 'estado':
      return String(valor).replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
    default:
      return valor;
  }
}

export const esNumerico = (tipo) => tipo === 'entero' || tipo === 'decimal' || tipo === 'dinero';

const buenos = ['Sano', 'Aprobada', 'Ejecutada', 'LISTO_PARA_VENTA'];
const medios = ['Enfermo', 'Pendiente'];
const malos = ['Muerto', 'Rechazada'];

export const claseEstado = (valor) => (buenos.includes(valor) ? 'bueno' : medios.includes(valor) ? 'medio' : malos.includes(valor) ? 'malo' : '');
