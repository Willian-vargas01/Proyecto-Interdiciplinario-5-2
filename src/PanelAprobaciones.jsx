import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, InputGroup, Badge } from 'react-bootstrap';

function PanelAprobaciones({ currentUser, actualizarDatosGlobales }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [motivos, setMotivos] = useState({});

  const cargarPendientes = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/solicitudes/pendientes');
      if (res.ok) setSolicitudes(await res.json());
    } catch (err) {
      console.error("Error cargando pendientes de MySQL:", err);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  // 👈 FUNCIÓN NUEVA: Convierte el texto JSON crudo en un texto limpio y legible
  const formatearDetalles = (accion, datosRaw) => {
    try {
      const obj = JSON.parse(datosRaw);
      if (accion === 'REGISTRAR_LOTE') {
        return `Código Lote: ${obj.codigo_lote || obj.codigoLote} | Aves Iniciales: ${obj.cantidad_inicial || obj.cantidadInicial}`;
      }
      if (accion === 'REGISTRAR_ALIMENTACION') {
        return `ID Lote: ${obj.id_lote} | Insumo ID: ${obj.id_inventario} | Cantidad: ${obj.cantidad_kg} kg`;
      }
      if (accion === 'REGISTRAR_VACUNACION') {
        return `ID Lote: ${obj.id_lote} | Vacuna ID: ${obj.id_inventario} | Dosis: ${obj.dosis_aplicada} un.`;
      }
      return datosRaw;
    } catch (e) {
      return datosRaw;
    }
  };

  const resolverSoli = async (idSoli, nuevoEstado) => {
    const motivoText = motivos[idSoli] || '';
    if (nuevoEstado === 'Rechazada' && !motivoText.trim()) {
      alert("Por favor, escribe un motivo para rechazar la solicitud.");
      return;
    }

    const payload = {
      id_solicitud: idSoli,
      estado: nuevoEstado,
      id_revisor: currentUser?.id_empleado || 1,
      motivo: motivoText || "Aprobado desde el panel de control"
    };

    try {
      const response = await fetch(`http://localhost:8080/api/solicitudes/${idSoli}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`✅ Operación procesada: Solicitud ${nuevoEstado}.`);
        cargarPendientes();
        if (actualizarDatosGlobales) actualizarDatosGlobales();
      } else {
        alert("Error en el servidor al intentar resolver.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red.");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white fw-bold">Cola de Aprobaciones (MySQL Audit)</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Operación</th>
              <th>Detalles del Pedido</th>
              <th>Acciones de Validación</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map(s => (
              <tr key={s.id_solicitud}>
                <td>#{s.id_solicitud}</td>
                <td><Badge bg="info">{s.accion}</Badge></td>
                <td className="fw-semibold text-secondary">
                  {formatearDetalles(s.accion, s.datos)}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="success" size="sm" className="fw-bold" onClick={() => resolverSoli(s.id_solicitud, 'Aprobada')}>
                      Aprobar e Insertar
                    </Button>
                    <InputGroup size="sm" style={{ maxWidth: '250px' }}>
                      <Form.Control 
                        placeholder="Escribí el por qué del rechazo..." 
                        value={motivos[s.id_solicitud] || ''} 
                        onChange={e => setMotivos({...motivos, [s.id_solicitud]: e.target.value})}
                      />
                      <Button variant="danger" onClick={() => resolverSoli(s.id_solicitud, 'Rechazada')}>
                        Rechazar
                      </Button>
                    </InputGroup>
                  </div>
                </td>
              </tr>
            ))}
            {solicitudes.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No hay aprobaciones pendientes en MySQL. ¡Todo al día!
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default PanelAprobaciones;
