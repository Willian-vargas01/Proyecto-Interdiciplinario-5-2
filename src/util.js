export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export const falla = (status, mensaje) => new ErrorHttp(status, mensaje);

const conocidos = {
  ER_DUP_ENTRY: 'Ya existe un registro con esos datos',
  ER_NO_REFERENCED_ROW_2: 'El dato elegido no existe',
  ER_CHECK_CONSTRAINT_VIOLATED: 'La operación dejaría un valor negativo',
  ER_CONSTRAINT_FAILED: 'La operación dejaría un valor negativo'
};

export const manejar = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (e instanceof ErrorHttp) return res.status(e.status).json({ error: e.message });
    if (e.sqlState === '45000') return res.status(400).json({ error: e.sqlMessage });
    if (conocidos[e.code]) return res.status(400).json({ error: conocidos[e.code] });
    console.error(e);
    res.status(500).json({ error: 'Error del servidor' });
  });
