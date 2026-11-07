import React from 'react';
import { Table, Card } from 'react-bootstrap';

function PanelSupervisor({ lotesDB, alimentacionDB, vacunacionDB }) {
  return (
    <div>
      <h2 className="fw-bold text-info mb-4">Auditoría de Registros</h2>
      
      <Card className="mb-4">
        <Card.Header className="bg-info text-white fw-bold">Registros de Lotes Activos</Card.Header>
        <Card.Body>
          <Table size="sm" bordered>
            <thead><tr><th>Código</th><th>Fecha</th><th>Aves</th></tr></thead>
            <tbody>
              {lotesDB.map(l => <tr key={l.id}><td>{l.codigo}</td><td>{l.fecha}</td><td>{l.cantidad}</td></tr>)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-success text-white fw-bold">Registros de Alimentación</Card.Header>
        <Card.Body>
          <Table size="sm" bordered>
            <thead><tr><th>Lote</th><th>Alimento Consumido</th><th>Cantidad</th><th>Fecha</th></tr></thead>
            <tbody>
              {alimentacionDB.map(a => <tr key={a.id}><td>{a.lote}</td><td>{a.alimento}</td><td>{a.cantidad}</td><td>{a.fecha}</td></tr>)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white fw-bold">Registros de Vacunación</Card.Header>
        <Card.Body>
          <Table size="sm" bordered>
            <thead><tr><th>Lote</th><th>Vacuna Aplicada</th><th>Dosis</th><th>Fecha</th></tr></thead>
            <tbody>
              {vacunacionDB.map(v => <tr key={v.id}><td>{v.lote}</td><td>{v.vacuna}</td><td>{v.dosis}</td><td>{v.fecha}</td></tr>)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default PanelSupervisor;

