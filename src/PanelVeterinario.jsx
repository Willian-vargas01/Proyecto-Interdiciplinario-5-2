import React, { useState } from 'react';
import { Table, Button, Form, Card, Badge } from 'react-bootstrap';

function PanelVeterinario({ vacunacionDB = [], setVacunacionDB, lotesDB = [], inventarioDB = [], setInventarioDB, currentUser }) {
  const [loteId, setLoteId] = useState('');
  const [invId, setInvId] = useState('');
  const [dosis, setDosis] = useState('');

  const vacunas = inventarioDB.filter(i => i.tipo === 'Vacuna');
  const esJefe = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'supervisor' || currentUser?.rol?.toLowerCase() === 'admin' || currentUser?.rol?.toLowerCase() === 'supervisor';

  const handleRegistrar = async (e) => {
    e.preventDefault();
    const insumo = inventarioDB.find(i => i.id_inventario === parseInt(invId) || i.id === parseInt(invId));
    const cant = parseFloat(dosis);

    // 🚀 VALIDACIÓN HISTÓRICA: Frena si ponen 0 o números negativos
    if (isNaN(cant) || cant <= 0) {
      alert("❌ La dosis aplicada debe ser un número mayor a 0.");
      return;
    }

    if (insumo && insumo.stock < cant) {
      alert(`❌ Stock insuficiente de vacunas. Disponible: ${insumo.stock}`);
      return;
    }

    const payload = {
      id_lote: parseInt(loteId),
      id_inventario: parseInt(invId),
      dosis_aplicada: cant,
      id_empleado: currentUser?.id_empleado || 1
    };

    if (esJefe) {
      try {
        const response = await fetch('http://localhost:8080/api/vacunacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resVac = await fetch('http://localhost:8080/api/vacunacion');
          if (resVac.ok) setVacunacionDB(await resVac.json());

          const resInv = await fetch('http://localhost:8080/api/inventario');
          if (resInv.ok) setInventarioDB(await resInv.json());

          setLoteId(''); setInvId(''); setDosis('');
          alert("✅ Sanidad: Vacunación grabada en MySQL de forma directa.");
        }
      } catch (err) {
        alert("Error al conectar con la API de Sanidad.");
      }
    } else {
      const solicitudPayload = {
        accion: 'REGISTRAR_VACUNACION',
        datos: JSON.stringify(payload),
        id_solicitante: currentUser?.id_empleado || 1
      };

      try {
        const response = await fetch('http://localhost:8080/api/solicitudes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudPayload)
        });
        if (response.ok) {
          alert("⏳ Solicitud enviada al Supervisor. Quedó en cola de aprobación.");
          setLoteId(''); setInvId(''); setDosis('');
        }
      } catch (err) {
        alert("Error al despachar la solicitud.");
      }
    }
  };

  return (
    <div>
      <h2 className="fw-bold text-primary mb-4">Panel de Sanidad (Veterinario)</h2>
      <Card className="mb-4 shadow-sm bg-dark text-white border-secondary">
        <Card.Header className="bg-primary text-white fw-bold">
          {esJefe ? "Registrar Vacunación Directa" : "Generar Solicitud de Vacunación"}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleRegistrar} className="d-flex gap-3 align-items-end">
            <Form.Group className="flex-grow-1">
              <Form.Label>Seleccionar Lote Real</Form.Label>
              <Form.Select required value={loteId} onChange={e => setLoteId(e.target.value)}>
                <option value="">Elegir lote...</option>
                {lotesDB.map(l => (
                  <option key={l.id_lote || l.id} value={l.id_lote || l.id}>
                    {l.codigo_lote || l.codigoLote}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Vacuna (Inventario)</Form.Label>
              <Form.Select required value={invId} onChange={e => setInvId(e.target.value)}>
                <option value="">Elegir vacuna...</option>
                {vacunas.map(v => (
                  <option key={v.id_inventario || v.id} value={v.id_inventario || v.id}>
                    {v.producto} (Disp: {v.stock} un.)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Dosis Total Aplicada</Form.Label>
              <Form.Control type="number" step="any" required value={dosis} onChange={e => setDosis(e.target.value)} placeholder="Ej: 15" />
            </Form.Group>
            <Button variant="primary" type="submit" className="fw-bold">
              {esJefe ? "Vacunar" : "Enviar Solicitud"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive className="table-dark-custom shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Lote</th>
            <th>Vacuna Aplicada</th>
            <th>Dosis Total</th>
            <th>Fecha Registro</th>
          </tr>
        </thead>
        <tbody>
          {vacunacionDB.map((vac) => {
            const idKey = vac.id_vacunacion || vac.id;
            return (
              <tr key={idKey} className="align-middle">
                <td>#{idKey}</td>
                <td className="fw-bold">{vac.lote || vac.codigo_lote}</td>
                <td>{vac.vacuna || vac.producto}</td>
                <td className="fw-bold text-info">{vac.dosis || vac.dosis_aplicada} un.</td>
                <td>{vac.fecha || vac.fecha_aplicacion || '-'}</td>
              </tr>
            );
          })}
          {vacunacionDB.length === 0 && (
            <tr><td colSpan="5" className="text-center text-muted py-3">No hay vacunas registradas en la base de datos.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default PanelVeterinario;
