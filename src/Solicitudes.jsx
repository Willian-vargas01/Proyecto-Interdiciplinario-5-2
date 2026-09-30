import { useEffect, useState } from 'react';
import { api } from './api.js';
import { catalogo } from './modulos.js';
import { formatear, claseEstado } from './formato.js';
import { ETIQUETA_ZONA } from './zonas.js';

const refs = {};
Object.values(catalogo).forEach((a) => a.campos.filter((c) => c.tipo === 'ref').forEach((c) => { refs[c.ref.ruta] = c.ref; }));

function valorLegible(campo, valor, nombres) {
  if (campo.tipo === 'ref') return nombres[campo.ref.ruta]?.[valor] ?? `N° ${valor}`;
  if (campo.tipo === 'select') return campo.opciones.find(([v]) => v === valor)?.[1] ?? valor;
  if (campo.tipo === 'number') return formatear(valor, 'decimal');
  if (campo.tipo === 'date') return formatear(valor, 'fecha');
  return valor;
}

export default function Solicitudes({ usuario, alCambiar }) {
  const supervisor = usuario.rol !== 'Empleado';
  const [pestana, setPestana] = useState('Pendiente');
  const [lista, setLista] = useState(null);
  const [nombres, setNombres] = useState({});
  const [avisos, setAvisos] = useState({});
  const [rechazando, setRechazando] = useState(null);
  const [motivo, setMotivo] = useState('');

  const cargar = () =>
    api(`/solicitudes${supervisor ? `?estado=${pestana}` : ''}`)
      .then(setLista)
      .catch(() => setLista([]));

  useEffect(() => {
    setLista(null);
    cargar();
  }, [pestana]);

  useEffect(() => {
    Object.entries(refs).forEach(([ruta, ref]) =>
      api(ruta)
        .then((filas) => setNombres((n) => ({ ...n, [ruta]: Object.fromEntries(filas.map((f) => [String(f[ref.id]), f[ref.nombre]])) })))
        .catch(() => {})
    );
  }, []);

  const resolver = async (s, accion, cuerpo) => {
    setAvisos((a) => ({ ...a, [s.id_solicitud]: null }));
    try {
      await api(`/solicitudes/${s.id_solicitud}/${accion}`, { method: 'POST', body: cuerpo });
      setRechazando(null);
      setMotivo('');
      await cargar();
      if (alCambiar) alCambiar();
    } catch (e) {
      setAvisos((a) => ({ ...a, [s.id_solicitud]: e.message }));
    }
  };

  const vacio = supervisor ? (pestana === 'Pendiente' ? 'No hay solicitudes esperando tu aprobación.' : 'Todavía no se resolvió ninguna solicitud.') : 'Todavía no enviaste solicitudes.';

  return (
    <section>
      <header className="cabecera">
        <h1 className="titulo">{supervisor ? 'Aprobaciones' : 'Mis solicitudes'}</h1>
      </header>
      {supervisor && (
        <div className="pestanas" role="tablist">
          {[['Pendiente', 'Pendientes'], ['Historial', 'Historial']].map(([v, t]) => (
            <button key={v} role="tab" className="pestana" aria-selected={pestana === v} onClick={() => setPestana(v)}>{t}</button>
          ))}
        </div>
      )}
      {lista === null && <p className="nota">Cargando</p>}
      {lista && lista.length === 0 && <p className="nota">{vacio}</p>}
      <div className="lista-solicitudes">
        {lista && lista.map((s) => {
          const definicion = catalogo[s.accion];
          return (
            <article className="solicitud" key={s.id_solicitud}>
              <div className="solicitud-cabecera">
                <h2>{definicion ? `${definicion.modulo}: ${definicion.titulo}` : s.accion}</h2>
                <span className={`sello ${claseEstado(s.estado)}`}>{s.estado}</span>
              </div>
              <p className="meta">
                {supervisor && `Pidió ${s.solicitante}, zona ${ETIQUETA_ZONA[s.zona] || 'sin zona'}, el ${formatear(s.fecha_solicitud, 'fechahora')}.`}
                {!supervisor && `Enviada el ${formatear(s.fecha_solicitud, 'fechahora')}.`}
                {s.revisor && ` Revisó ${s.revisor} el ${formatear(s.fecha_revision, 'fechahora')}.`}
              </p>
              {definicion && (
                <dl className="detalle">
                  {definicion.campos.filter((c) => s.datos[c.nombre] !== undefined).map((c) => (
                    <div key={c.nombre}>
                      <dt>{c.etiqueta}</dt>
                      <dd>{valorLegible(c, s.datos[c.nombre], nombres)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {s.estado === 'Rechazada' && <p className="aviso error">Motivo del rechazo: {s.motivo}</p>}
              {supervisor && s.estado === 'Pendiente' && rechazando !== s.id_solicitud && (
                <div className="botones">
                  <button className="boton" onClick={() => resolver(s, 'aprobar')}>Aprobar</button>
                  <button className="boton secundario" onClick={() => { setRechazando(s.id_solicitud); setMotivo(''); }}>Rechazar</button>
                </div>
              )}
              {supervisor && s.estado === 'Pendiente' && rechazando === s.id_solicitud && (
                <form className="rechazo" onSubmit={(e) => { e.preventDefault(); resolver(s, 'rechazar', { motivo }); }}>
                  <label className="campo">
                    <span>Motivo del rechazo</span>
                    <input value={motivo} required maxLength={255} onChange={(e) => setMotivo(e.target.value)} />
                  </label>
                  <button className="boton" type="submit">Confirmar rechazo</button>
                  <button className="boton secundario" type="button" onClick={() => setRechazando(null)}>Cancelar</button>
                </form>
              )}
              {avisos[s.id_solicitud] && <p className="aviso error" role="alert">{avisos[s.id_solicitud]}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
