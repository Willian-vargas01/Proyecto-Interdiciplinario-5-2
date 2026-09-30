import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { modulosVisibles } from './modulos.js';
import Icono from './Iconos.jsx';
import Login from './Login.jsx';
import Inicio from './Inicio.jsx';
import Modulo from './Modulo.jsx';
import Solicitudes from './Solicitudes.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [actual, setActual] = useState('inicio');
  const [colapsado, setColapsado] = useState(() => localStorage.getItem('menu') === '1');
  const [pendientes, setPendientes] = useState(0);
  const supervisor = usuario && usuario.rol !== 'Empleado';

  const refrescarPendientes = useCallback(() => {
    if (usuario && supervisor) api('/solicitudes?estado=Pendiente').then((l) => setPendientes(l.length)).catch(() => {});
  }, [usuario, supervisor]);

  useEffect(() => { refrescarPendientes(); }, [refrescarPendientes]);

  if (!usuario) return <Login onEntrar={setUsuario} />;

  const alternar = () => {
    localStorage.setItem('menu', colapsado ? '0' : '1');
    setColapsado(!colapsado);
  };
  const salir = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    setActual('inicio');
  };
  const visibles = modulosVisibles(usuario);
  const boton = (id, titulo, icono, insignia) => (
    <button key={id} title={titulo} className={'item' + (actual === id ? ' activo' : '')} onClick={() => setActual(id)}>
      <Icono nombre={icono} />
      <span className="txt">{titulo}</span>
      {insignia > 0 && <span className="insignia">{insignia}</span>}
    </button>
  );

  let contenido;
  if (actual === 'inicio') contenido = <Inicio usuario={usuario} pendientes={pendientes} irA={setActual} />;
  else if (actual === 'solicitudes') contenido = <Solicitudes usuario={usuario} alCambiar={refrescarPendientes} />;
  else {
    const modulo = visibles.find((m) => m.id === actual);
    contenido = modulo ? <Modulo modulo={modulo} usuario={usuario} /> : <Inicio usuario={usuario} pendientes={pendientes} irA={setActual} />;
  }

  return (
    <div className={'app' + (colapsado ? ' colapsado' : '')}>
      <nav>
        <div className="nav-cab">
          <img className="marca" src={colapsado ? '/logo-icono-negro.png' : '/logo-negro.png'} alt="Keke Company" />
        </div>
        <button className="item toggle" onClick={alternar} aria-label={colapsado ? 'Expandir menú' : 'Achicar menú'}>
          <Icono nombre={colapsado ? 'ampliar' : 'achicar'} /><span className="txt">Achicar menú</span>
        </button>
        {boton('inicio', 'Inicio', 'inicio')}
        {visibles.map((m) => boton(m.id, m.titulo, m.icono))}
        {boton('solicitudes', supervisor ? 'Aprobaciones' : 'Mis solicitudes', 'solicitudes', supervisor ? pendientes : 0)}
        <div className="usuario">
          <p className="txt">{usuario.nombre} {usuario.apellido}<br />{usuario.rol}</p>
          <button className="item" title="Cerrar sesión" onClick={salir}><Icono nombre="salir" /><span className="txt">Cerrar sesión</span></button>
        </div>
      </nav>
      <main>{contenido}</main>
    </div>
  );
}
