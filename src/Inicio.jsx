import { useEffect, useState } from 'react';
import { api } from './api.js';
import { formatear } from './formato.js';
import { ETIQUETA_ZONA } from './zonas.js';

export default function Inicio({ usuario, pendientes, irA }) {
  const [alertas, setAlertas] = useState(null);
  const supervisor = usuario.rol !== 'Empleado';

  useEffect(() => {
    api('/inventario/alertas').then(setAlertas).catch(() => setAlertas([]));
  }, []);

  let mensaje;
  if (supervisor) {
    mensaje = pendientes > 0 ? `Tenés ${pendientes} ${pendientes === 1 ? 'solicitud esperando' : 'solicitudes esperando'} tu aprobación.` : 'No hay solicitudes esperando tu aprobación.';
  } else {
    mensaje = usuario.zona ? `Tu zona de trabajo es ${ETIQUETA_ZONA[usuario.zona]}.` : 'Todavía no tenés una zona asignada. Pedile al administrador que te la asigne.';
  }

  return (
    <section>
      <header className="cabecera">
        <h1 className="titulo">Hola, {usuario.nombre}</h1>
      </header>
      <p className="nota">{mensaje}</p>
      {supervisor && pendientes > 0 && <button className="boton" onClick={() => irA('solicitudes')}>Revisar solicitudes</button>}
      <h2 className="seccion">Productos con poco stock</h2>
      {alertas === null && <p className="nota">Cargando</p>}
      {alertas && alertas.length === 0 && <p className="nota">Todos los productos están por encima de su stock mínimo.</p>}
      <ul className="alertas">
        {alertas && alertas.map((a) => (
          <li key={a.id_inventario}>
            <strong>{a.nombre_producto}</strong>
            <span>Quedan {formatear(a.cantidad_stock, 'decimal')} y el mínimo es {formatear(a.stock_minimo, 'decimal')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
