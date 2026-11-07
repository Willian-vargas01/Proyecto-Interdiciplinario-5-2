import React, { useState } from 'react';
import { Table, Button, Form, Card, Alert } from 'react-bootstrap';

function PanelNutricionista({ alimentacionDB = [], setAlimentacionDB, lotesDB = [], inventarioDB = [], setInventarioDB, currentUser }) {
  const [loteId, setLoteId] = useState('');
  const [invId, setInvId] = useState('');
  const [cantidad, setCantidad] = useState('');

  const alimentos = inventarioDB.filter(i => i.tipo === 'Alimento');
  const esJefe = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'supervisor';

  const handleRegistrar = async (e) => {
    e.preventDefault();
    const insumo = inventarioDB.find(i => i.id_inventario === parseInt(invId) || i.id === parseInt(invId));
    const cant = parseFloat(cantidad);

    if (isNaN(cant) || cant <= 0) {
      alert("❌ La cantidad de alimento debe ser un número mayor a 0 kg.");
      return;
    }

    if (insumo && insumo.stock < cant) {
      alert(`❌ Stock insuficiente de ${insumo.producto}. Stock actual: ${insumo.stock}`);
      return;
    }


    const payload = {
      id_lote: parseInt(loteId),
      id_inventario: parseInt(invId),
      cantidad_kg: cant
    };

    if (esJefe) {
      try {
        const response = await fetch('http://localhost:8080/api/alimentacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resAlim = await fetch('http://localhost:8080/api/alimentacion');
          if (resAlim.ok) setAlimentacionDB(await resAlim.json());
          const resInv = await fetch('http://localhost:8080/api/inventario');
          if (resInv.ok) setInventarioDB(await resInv.json());

          setLoteId(''); setInvId(''); setCantidad('');
          alert("✅ Alimentación procesada de forma directa.");
        }
      } catch (err) {
        alert("Error de conexión directa.");
      }
    } else {
      const solicitudPayload = {
        accion: 'REGISTRAR_ALIMENTACION',
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
          alert("⏳ Solicitud de alimentación enviada al Supervisor.");
          setLoteId(''); setInvId(''); setCantidad('');
        }
      } catch (err) {
        alert("Error al despachar la solicitud.");
      }
    }
  };

  return (
    <div>
      <h2 className="fw-bold text-success mb-4">Panel de Nutrición</h2>
      <Card className="mb-4 shadow-sm bg-dark text-white border-secondary">
        <Card.Header className="bg-success text-white fw-bold">
          {esJefe ? "Asignar Alimentación Directa" : "Generar Solicitud de Alimentación"}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleRegistrar} className="d-flex gap-3 align-items-end">
            <Form.Group className="flex-grow-1">
              <Form.Label>Seleccionar Lote</Form.Label>
              <Form.Select required value={loteId} onChange={e => setLoteId(e.target.value)}>
                <option value="">Elegir lote...</option>
                {lotesDB.map(l => <option key={l.id_lote || l.id} value={l.id_lote || l.id}>{l.codigo_lote}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Alimento Disponible</Form.Label>
              <Form.Select required value={invId} onChange={e => setInvId(e.target.value)}>
                <option value="">Elegir alimento...</option>
                {alimentos.map(a => <option key={a.id_inventario || a.id} value={a.id_inventario || a.id}>{a.producto} (Disp: {a.stock})</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Cantidad (Kg)</Form.Label>
              <Form.Control type="number" step="any" required value={cantidad} onChange={e => setCantidad(e.target.value)} />
            </Form.Group>
            <Button variant="success" type="submit" className="fw-bold">
              {esJefe ? "Procesar" : "Enviar Solicitud"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive className="table-dark-custom">
        <thead className="table-dark">
          <tr><th>ID</th><th>Lote</th><th>Alimento</th><th>Cantidad</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {alimentacionDB.map((reg) => (
            <tr key={reg.id}><td>#{reg.id}</td><td className="fw-bold">{reg.lote}</td><td>{reg.alimento}</td><td>{reg.cantidad} kg</td><td>{reg.fecha}</td></tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PanelNutricionista;
