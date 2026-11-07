import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

function TiendaCliente({ lotesDB = [], setLotesDB, ventasDB = [], setVentasDB, currentUser, setCurrentView }) {
  const [showModal, setShowModal] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(10);
  const [metodoPago, setMetodoPago] = useState('Mercado Pago');

  // 👈 CORREGIDO: El precio unitario base ahora es dinámico según el lote elegido, usando 2500 como fallback
  const precioPorGallina = loteSeleccionado 
    ? (loteSeleccionado.precioUnitario || loteSeleccionado.precio_unitario || 2500) 
    : 2500;

  const costoEnvio = 4000;
  const total = (Number(cantidad) || 0) * precioPorGallina + costoEnvio;

  const lotesDisponibles = (lotesDB || []).filter(l => l.cantidad_actual > 0);

  const abrirCompra = (lote) => {
    if (!currentUser) {
      alert("Tienes que iniciar sesión o registrarte para comprar.");
      return;
    }
    setLoteSeleccionado(lote);
    setCantidad(10);
    setShowModal(true);
  };

  const confirmarCompra = async (e) => {
    e.preventDefault();
    if (cantidad < 10) {
      alert("La compra mínima es de 10 gallinas.");
      return;
    }
    if (cantidad > loteSeleccionado.cantidad_actual) {
      alert(`No hay suficiente stock. Máximo disponible: ${loteSeleccionado.cantidad_actual}`);
      return;
    }

    const idLoteReal = loteSeleccionado.id_lote || loteSeleccionado.idLote || loteSeleccionado.id;

    if (!idLoteReal) {
      alert("Error: No se pudo identificar el ID único del lote.");
      return;
    }

    try {
      const loteActualizadoPayload = {
        ...loteSeleccionado,
        cantidad_actual: loteSeleccionado.cantidad_actual - Math.floor(cantidad)
      };

      // 1. Modificación de stock real en backend
      const responseLote = await fetch(`http://localhost:8080/api/lotes/${idLoteReal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loteActualizadoPayload)
      });

      // 2. Registro histórico de la transacción (Sincronizado letra por letra con el endpoint nativo)
      const ventaPayload = {
        cliente: currentUser.nombre || currentUser.name || "Cliente Web",
        lote: loteSeleccionado.codigo_lote,
        cantidad: Math.floor(cantidad),
        metodo_pago: metodoPago, // 👈 CORREGIDO: Machea exacto con tu tabla y backend
        metodo: metodoPago,
        costo_envio: costoEnvio,  // 👈 CORREGIDO: Machea exacto con tu tabla y backend
        envio: costoEnvio,
        total: total,
        fecha: new Date().toISOString().split('T')[0]
      };

      const responseVenta = await fetch('http://localhost:8080/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaPayload)
      });

      if (responseLote.ok && responseVenta.ok) {
        setLotesDB(lotesDB.map(l => {
          const currentId = l.id_lote || l.idLote || l.id;
          return currentId === idLoteReal ? { ...l, cantidad_actual: l.cantidad_actual - cantidad } : l;
        }));
        
        const resVentasActualizadas = await fetch('http://localhost:8080/api/ventas');
        if (resVentasActualizadas.ok) {
          const dataVentas = await resVentasActualizadas.json();
          setVentasDB(dataVentas);
        }

        setShowModal(false);
        alert("✅ Compra realizada con éxito y guardada en MySQL.");
      } else {
        console.warn("Falla en la respuesta de endpoints. Aplicando fallback interactivo local.");
        
        setLotesDB(lotesDB.map(l => {
          const currentId = l.id_lote || l.idLote || l.id;
          return currentId === idLoteReal ? { ...l, cantidad_actual: l.cantidad_actual - cantidad } : l;
        }));
        
        setVentasDB([...ventasDB, {
          id: ventasDB.length + 1,
          ...ventaPayload
        }]);

        setShowModal(false);
        alert("Pedido procesado localmente.");
      }
    } catch (error) {
      console.error("Error transaccional de red, aplicando simulación:", error);
      
      setLotesDB(lotesDB.map(l => {
        const currentId = l.id_lote || l.idLote || l.id;
        return currentId === idLoteReal ? { ...l, cantidad_actual: l.cantidad_actual - cantidad } : l;
      }));

      setVentasDB([...ventasDB, {
        id: ventasDB.length + 1,
        ...ventaPayload
      }]);

      setShowModal(false);
      alert("Pedido procesado (Modo offline activo).");
    }
  };

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" className="mb-4 d-flex align-items-center" onClick={() => setCurrentView('home')}>
        <FaArrowLeft className="me-2"/> Volver al inicio
      </Button>

      <h2 className="fw-bold text-primary mb-4">Nuestras Gallinas Disponibles</h2>
      <p className="text-muted fs-5 mb-5">Selecciona el lote del que deseas adquirir tus aves. Venta mínima: 10 unidades.</p>

      <Row>
        {lotesDisponibles.map(lote => {
          const idKey = lote.id_lote || lote.idLote || lote.id;
          // 👈 Trae el precio real del lote de la BD para mostrarlo en la tarjeta de la tienda
          const precioTarjeta = lote.precioUnitario || lote.precio_unitario || 2500;
          
          return (
            <Col md={4} key={idKey} className="mb-4">
              <Card className="shadow-sm h-100 border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="fw-bold fs-4 text-orange">{lote.codigo_lote}</Card.Title>
                    <Badge bg="success">Stock: {lote.cantidad_actual}</Badge>
                  </div>
                  <Card.Text>
                    <strong>Precio unitario:</strong> ${precioTarjeta} ARS<br/>
                    <strong>Estado:</strong> {lote.estado}
                  </Card.Text>
                  <Button className="btn-orange w-100 fw-bold" onClick={() => abrirCompra(lote)}>
                    Comprar de este lote
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {lotesDisponibles.length === 0 && (
          <Col><Alert variant="warning">No hay gallinas disponibles en este momento.</Alert></Col>
        )}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary"><FaShoppingCart className="me-2"/> Finalizar Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={confirmarCompra}>
            <Alert variant="info" className="fw-bold">
              Costo de envío fijo: $4000 ARS
            </Alert>
            
            <Form.Group className="mb-3">
              <Form.Label>Cantidad de gallinas (Mínimo 10)</Form.Label>
              <Form.Control 
                type="number" 
                min="10" 
                max={loteSeleccionado ? loteSeleccionado.cantidad_actual : 10} 
                required 
                value={cantidad} 
                onChange={(e) => setCantidad(parseInt(e.target.value) || '')} 
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Método de Pago aceptado</Form.Label>
              <Form.Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo (Contra entrega)</option>
              </Form.Select>
            </Form.Group>

            <div className="p-3 rounded mb-4 text-center border">
              <h5 className="mb-0">Total a pagar:</h5>
              <h3 className="fw-bold text-orange mb-0">${total.toLocaleString()} ARS</h3>
              <small className="text-muted">(A razón de ${precioPorGallina} c/u + envío)</small>
            </div>

            <Button variant="primary" type="submit" className="w-100 fw-bold btn-lg">
              Confirmar Pago
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TiendaCliente;
