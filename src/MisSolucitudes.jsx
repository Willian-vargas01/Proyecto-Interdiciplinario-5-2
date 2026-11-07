import React, { useEffect, useState } from 'react';
import { Table, Badge, Card } from 'react-bootstrap';

function MisSolicitudes({ currentUser }) {
  const [misReq, setMisReq] = useState([]);

  useEffect(() => {
    const cargarMisSolicitudes = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/solicitudes/solicitante/${currentUser?.id_empleado}`);
        if (res.ok) setMisReq(await res.json());
      } catch (err) {
        console.error("Error leyendo solicitudes del empleado:", err);
      }
    };
    if (currentUser?.id_empleado) cargarMisSolicitudes();
  }, [currentUser]);

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-dark text-white fw-bold">Mis Solicitudes Enviadas</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Acción Solicitada</th>
              <th>Fecha Envío</th>
              <th>Estado</th>
              <th>Motivo de Rechazo</th>
            </tr>
          </thead>
          <tbody>
            {misReq.map(req => (
              <tr key={req.id_solicitud}>
                <td>#{req.id_solicitud}</td>
                <td className="fw-bold">{req.accion}</td>
                <td>{req.fecha_creacion || 'Hoy'}</td>
                <td>
                  <Badge bg={req.estado === 'Aprobada' ? 'success' : req.estado === 'Rechazada' ? 'danger' : 'warning'}>
                    {req.estado}
                  </Badge>
                </td>
                <td className="text-muted">{req.motivo || '-'}</td>
              </tr>
            ))}
            {misReq.length === 0 && (
              <tr><td colSpan="5" className="text-center py-3 text-muted">No has enviado ninguna solicitud todavía.</td></tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default MisSolicitudes;
