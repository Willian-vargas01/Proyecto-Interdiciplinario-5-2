import { useEffect, useState } from 'react';
import { api } from './api.js';

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
import { formatear, esNumerico, claseEstado } from './formato.js';
import Formulario from './Formulario.jsx';

export default function Modulo({ modulo, usuario }) {
  const [filas, setFilas] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [valores, setValores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const empleado = usuario.rol === 'Empleado';
  const conAprobacion = empleado && modulo.acciones.some((a) => a.clave);

  const cargar = () =>
    api(modulo.ruta)
      .then(setFilas)
      .catch((e) => {
        setFilas([]);
        setAviso({ tipo: 'error', texto: e.message });
      });

  useEffect(() => {
    setFilas(null);
    setAbierta(null);
    setValores({});
    setAviso(null);
    cargar();
  }, [modulo.id]);

  const abrir = (definicion, fila) => {
    setAviso(null);
    setAbierta({ ...definicion, fila });
    setValores(fila ? Object.fromEntries(definicion.campos.map((c) => [c.nombre, fila[c.nombre] ?? ''])) : {});
  };

  const cerrar = () => {
    setAbierta(null);
    setValores({});
  };

  const cambiar = (nombre, valor) => setValores((v) => ({ ...v, [nombre]: valor }));

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    const datos = Object.fromEntries(abierta.campos.filter((c) => !c.visible || c.visible(valores)).map((c) => [c.nombre, valores[c.nombre]]));
    try {
      let texto = 'Guardado';
      if (abierta.fila) {
        await api(abierta.ruta(abierta.fila), { method: 'PUT', body: datos });
        texto = 'Cambios guardados';
      } else if (abierta.ruta) {
        await api(abierta.ruta, { method: 'POST', body: datos });
      } else {
        const r = await api('/acciones', { method: 'POST', body: { accion: abierta.clave, datos } });
        if (r.estado === 'Pendiente') texto = 'Enviado al supervisor. Vas a ver su respuesta en Mis solicitudes.';
      }
      setAviso({ tipo: 'ok', texto });
      cerrar();
      cargar();
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  };

  const darDeBaja = async (fila) => {
    if (!window.confirm(`¿Dar de baja a ${fila.nombre} ${fila.apellido}? Su historial se conserva.`)) return;
    try {
      await api(modulo.baja(fila), { method: 'DELETE' });
      setAviso({ tipo: 'ok', texto: 'Empleado dado de baja' });
      cargar();
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    }
  };

  const celda = (fila, c) =>
    c.tipo === 'estado' ? <span className={`sello ${claseEstado(fila[c.clave])}`}>{formatear(fila[c.clave], 'estado')}</span> : formatear(fila[c.clave], c.tipo);

  const columnas = modulo.columnas.length + (modulo.editar ? 1 : 0);

  return (
    <section>
      <header className="cabecera">
        <h1 className="titulo">{modulo.titulo}</h1>
        {!abierta && (
          <div className="botones">
            {modulo.acciones.map((a) => <button key={a.titulo} className="boton" onClick={() => abrir(a)}>{a.titulo}</button>)}
          </div>
        )}
      </header>
      {conAprobacion && <p className="nota">Lo que cargues en esta sección lo revisa un supervisor antes de aplicarse.</p>}
      {abierta && (
        <Formulario
          titulo={abierta.fila ? modulo.editar.titulo : abierta.titulo}
          campos={abierta.campos}
          valores={valores}
          onCambio={cambiar}
          onEnviar={enviar}
          onCancelar={cerrar}
          boton={abierta.clave && empleado ? 'Enviar al supervisor' : abierta.boton}
          resumen={abierta.resumen}
          enviando={enviando}
        />
      )}
      {aviso && <p className={`aviso ${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
      <div className="tabla-caja">
        <table>
          <thead>
            <tr>
              {modulo.columnas.map((c) => <th key={c.clave} className={esNumerico(c.tipo) ? 'num' : ''}>{c.titulo}</th>)}
              {modulo.editar && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filas === null && <tr><td colSpan={columnas} className="vacio">Cargando</td></tr>}
            {filas && filas.length === 0 && <tr><td colSpan={columnas} className="vacio">{modulo.vacio}</td></tr>}
            {filas && filas.map((f, i) => (
              <tr key={i}>
                {modulo.columnas.map((c) => <td key={c.clave} className={esNumerico(c.tipo) ? 'num' : ''}>{celda(f, c)}</td>)}
                {modulo.editar && (
                  <td className="fila-acciones">
                    <button className="boton chico secundario" onClick={() => abrir(modulo.editar, f)}>Editar</button>
                    <button className="boton chico secundario" onClick={() => darDeBaja(f)}>Dar de baja</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
