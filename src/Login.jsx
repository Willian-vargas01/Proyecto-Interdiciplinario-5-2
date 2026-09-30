import { useState } from 'react';
import { api } from './api.js';

export default function Login({ onEntrar }) {
  const [datos, setDatos] = useState({ email: '', password: '' });
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const r = await api('/auth/login', { method: 'POST', body: datos });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      onEntrar(r.user);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <main className="ingreso">
      <div className="ingreso-marca">
        <img src="/logo-negro.png" alt="KEKE Company" />
        <p>Lotes, vacunas, stock y ventas de la granja.</p>
      </div>
      <form className="ingreso-form" onSubmit={enviar}>
        <h1 className="titulo">Ingresar</h1>
        <p className="nota">Usá el correo y la contraseña que te dio el administrador.</p>
        <label className="campo">
          <span>Correo</span>
          <input type="email" autoComplete="username" required value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} />
        </label>
        <label className="campo">
          <span>Contraseña</span>
          <div className="clave">
            <input type={ver ? 'text' : 'password'} autoComplete="current-password" required value={datos.password} onChange={(e) => setDatos({ ...datos, password: e.target.value })} />
            <button type="button" onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Mostrar'}</button>
          </div>
        </label>
        {error && <p className="aviso error" role="alert">{error}</p>}
        <button className="boton grande" type="submit" disabled={enviando}>{enviando ? 'Ingresando' : 'Ingresar'}</button>
      </form>
    </main>
  );
}
