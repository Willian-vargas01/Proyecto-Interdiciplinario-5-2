import React, { useState } from 'react';
import { Table, Button, Form, Card, InputGroup, Badge } from 'react-bootstrap';

function PanelLotes({ lotesDB = [], setLotesDB, currentUser }) {
  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [preciosEditados, setPreciosEditados] = useState({});
  const [loteInspeccionado, setLoteInspeccionado] = useState(null);
  const [avesDelLote, setAvesDelLote] = useState([]);

  const esJefe = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'supervisor';

  const handleRegistrar = async (e) => {
    e.preventDefault();
    const fechaHoy = new Date().toISOString().split('T')[0];
    const cantNum = parseInt(cantidad) || 0;

    const lotePayload = {
      codigo_lote: codigo,
      cantidad_inicial: cantNum,
      cantidad_actual: cantNum,
      fecha_ingreso: fechaHoy,
      estado: 'EN_CRECIMIENTO'
    };

    if (esJefe) {
      // 🚀 REGISTRO DIRECTO EN MYSQL
      try {
        const response = await fetch('http://localhost:8080/api/lotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lotePayload)
        });

        if (response.ok) {
          setCodigo(''); setCantidad('');
          const res = await fetch('http://localhost:8080/api/lotes');
          if (res.ok) setLotesDB(await res.json());
          alert('✅ Lote registrado con éxito en MySQL de forma directa.');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // ⏳ ENVÍO COMO SOLICITUD TRANSACCIONAL A LA BD
      const solicitudPayload = {
        accion: 'REGISTRAR_LOTE',
        datos: JSON.stringify(lotePayload),
        id_solicitante: currentUser?.id_empleado || 1
      };

      try {
        const response = await fetch('http://localhost:8080/api/solicitudes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(solicitudPayload)
        });
        if (response.ok) {
          alert('⏳ Solicitud de lote enviada a la base de datos. Pendiente de aprobación.');
          setCodigo(''); setCantidad('');
        }
      } catch (error) {
        alert('Error al enviar la solicitud.');
      }
    }
  };

  const handleActualizarPrecio = async (idLote) => {
    const nuevoPrecio = preciosEditados[idLote];
    if (!nuevoPrecio || isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
      alert("Ingresa un precio válido mayor a 0.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/lotes/${idLote}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          precioUnitario: parseFloat(nuevoPrecio),
          precio_unitario: parseFloat(nuevoPrecio)
        })
      });

      if (response.ok) {
        const res = await fetch('http://localhost:8080/api/lotes');
        if (res.ok) setLotesDB(await res.json());
        alert("💰 Precio del lote actualizado con éxito en MySQL.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verAves = async (idLote) => {
    try {
      // 👈 REEMPLAZADO CON LA URL CORRECTA USANDO ACENTOS GRAVES
      const res = await fetch("http://localhost:8080/api/lotes/" + idLote + "/aves");
      if (res.ok) {
        setAvesDelLote(await res.json());
        setLoteInspeccionado(idLote);
      }
    } catch (err) {
      console.error("Error al traer las aves de la BD:", err);
    }
  };
  
  return (
    <div>
      <h2 className="fw-bold text-primary mb-4">Gestión de Lotes</h2>
      
      <Card className="mb-4 shadow-sm bg-dark text-white border-secondary">
        <Card.Header className="bg-primary text-white fw-bold">
          {esJefe ? "Registrar Nuevo Lote Directo" : "Solicitar Alta de Lote"}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleRegistrar} className="d-flex gap-3 align-items-end">
            <Form.Group className="flex-grow-1">
              <Form.Label>Código de Lote</Form.Label>
              <Form.Control type="text" required value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Cantidad de Aves Inicial</Form.Label>
              <Form.Control type="number" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className="fw-bold">
              {esJefe ? "Registrar Lote" : "Mandar Solicitud"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive className="table-dark-custom shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Fecha Ingreso</th>
            <th>Cant. Inicial</th>
            <th>Cant. Actual</th>
            <th>Precio Unitario (ARS)</th>
            <th>Estado</th>
            <th>Aves</th>
            <th>Acción Precio</th>
          </tr>
        </thead>
        <tbody>
          {lotesDB.map((l) => {
            const idKey = l.id_lote || l.idLote || l.id;
            return (
              <tr key={idKey} className="align-middle">
                <td>{idKey}</td>
                <td className="fw-bold text-orange">{l.codigoLote || l.codigo_lote}</td>
                <td>{l.fechaIngreso || l.fecha_ingreso || '-'}</td>
                <td>{l.cantidadInicial || l.cantidad_inicial}</td>
                <td>{l.cantidadActual || l.cantidad_actual}</td>
                <td className="fw-bold text-success">
                  ${l.precioUnitario || l.precio_unitario || '2500'} ARS
                </td>
                <td>
                  <span className={`badge ${l.estado === 'EN_CRECIMIENTO' ? 'bg-success' : 'bg-warning'}`}>
                    {l.estado}
                  </span>
                </td>
                <td>
                  <Button variant="info" size="sm" className="fw-bold text-white" onClick={() => verAves(idKey)}>
                    Inspeccionar
                  </Button>
                </td>
                <td>
                  <InputGroup size="sm" style={{ maxWidth: '180px' }}>
                    <Form.Control
                      type="number"
                      placeholder="Precio"
                      value={preciosEditados[idKey] || ''}
                      onChange={(e) => setPreciosEditados({ ...preciosEditados, [idKey]: e.target.value })}
                    />
                    <Button variant="warning" className="fw-bold" onClick={() => handleActualizarPrecio(idKey)}>
                      Fijar
                    </Button>
                  </InputGroup>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* SUBMÓDULO DESPLEGABLE: INSPECCIÓN DE AVES DEL LOTE */}
      {loteInspeccionado && (
        <Card className="mt-4 border-info bg-dark text-white shadow-sm animate__animated animate__fadeIn">
          <Card.Header className="bg-info text-white fw-bold d-flex justify-content-between align-items-center">
            <span>Aves Clínicas Vinculadas al Lote #{loteInspeccionado} (Trazabilidad)</span>
            <Button variant="outline-light" size="sm" onClick={() => setLoteInspeccionado(null)}>Cerrar</Button>
          </Card.Header>
          <Card.Body>
            <Table size="sm" variant="dark" striped bordered className="mb-0">
              <thead>
                <tr>
                  <th>ID Ave</th>
                  <th>Código Caravana</th>
                  <th>Raza</th>
                  <th>Peso Registrado</th>
                  <th>Salud</th>
                </tr>
              </thead>
              <tbody>
                {avesDelLote.map(a => (
                  <tr key={a.id_ave}>
                    <td>#{a.id_ave}</td>
                    <td className="text-orange fw-bold">{a.codigo_ave}</td>
                    <td>{a.raza || 'Cobb 500'}</td>
                    <td>{a.peso_kg} kg</td>
                    <td><Badge bg={a.estado_salud === 'Sano' ? 'success' : 'danger'}>{a.estado_salud}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default PanelLotes;
