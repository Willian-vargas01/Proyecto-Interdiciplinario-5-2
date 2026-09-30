import { useEffect, useState } from 'react';
import { api } from './api.js';

function useOpciones(ruta) {
  const [filas, setFilas] = useState([]);
  useEffect(() => {
    if (ruta) api(ruta).then(setFilas).catch(() => setFilas([]));
  }, [ruta]);
  return filas;
}

function Campo({ campo, valor, onCambio }) {
  const { nombre, etiqueta, tipo, opciones, ref } = campo;
  const filas = useOpciones(tipo === 'ref' ? ref.ruta : null);
  const props = { id: nombre, value: valor ?? '', required: true, onChange: (e) => onCambio(nombre, e.target.value) };
  let control;

  if (tipo === 'select') {
    control = (
      <select {...props}>
        <option value="">Elegir</option>
        {opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    );
  } else if (tipo === 'ref') {
    const lista = ref.filtro ? filas.filter(ref.filtro) : filas;
    control = (
      <select {...props}>
        <option value="">Elegir</option>
        {lista.map((f) => <option key={f[ref.id]} value={f[ref.id]}>{ref.texto(f)}</option>)}
      </select>
    );
  } else {
    control = <input type={tipo} step="any" min={tipo === 'number' ? 0 : undefined} {...props} />;
  }

  return (
    <label className="campo" htmlFor={nombre}>
      <span>{etiqueta}</span>
      {control}
    </label>
  );
}

export default function Formulario({ titulo, campos, valores, onCambio, onEnviar, onCancelar, boton, resumen, enviando }) {
  const visibles = campos.filter((c) => !c.visible || c.visible(valores));
  const total = resumen ? resumen(valores) : null;

  return (
    <form className="formulario" onSubmit={onEnviar}>
      <h2>{titulo}</h2>
      <div className="campos">
        {visibles.map((c) => <Campo key={c.nombre} campo={c} valor={valores[c.nombre]} onCambio={onCambio} />)}
      </div>
      {total && <p className="resumen">{total}</p>}
      <div className="acciones-form">
        <button className="boton" type="submit" disabled={enviando}>{enviando ? 'Guardando' : boton}</button>
        <button className="boton secundario" type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
