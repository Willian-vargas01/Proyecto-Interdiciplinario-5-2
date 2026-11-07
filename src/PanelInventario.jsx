import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Card, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';

function PanelInventario({ inventarioDB = [], setInventarioDB, currentUser }) {
  // Estados para crear un insumo nuevo de raíz
  const [producto, setProducto] = useState('');
  const [tipo, setTipo] = useState('Alimento');
  const [stock, setStock] = useState('');
  const [unidad, setUnidad] = useState('Kg');
  const [minimo, setMinimo] = useState('');

  // Estados para la actualización manual / Sumar Stock a uno existente
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [stockASumar, setStockASumar] = useState('');

  const esJefe = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'supervisor' || currentUser?.rol?.toLowerCase() === 'admin' || currentUser?.rol?.toLowerCase() === 'supervisor';

  // 🔄 TRAER DE LA BASE DE DATOS: Evita el problema de que las cosas se pongan invisibles al refrescar
  const cargarInventarioDeBaseDeDatos = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/inventario');
      if (res.ok) {
        const datos = await res.json();
        setInventarioDB(datos);
      }
    } catch (err) {
      console.error("Error al traer inventario de MySQL:", err);
    }
  };

  useEffect(() => {
    cargarInventarioDeBaseDeDatos();
  }, []);

  // ➕ ACCIÓN 1: Registrar un producto totalmente nuevo
  const handleGuardarNuevo = async (e) => {
    e.preventDefault();
    const cant = parseFloat(stock);
    const min = parseFloat(minimo);

    if (isNaN(cant) || cant < 0 || isNaN(min) || min < 0) {
      alert("❌ Los valores de stock y alerta mínima deben ser números válidos mayores o iguales a 0.");
      return;
    }

    const payload = {
      producto,
      tipo,
      stock: cant,
      unidad,
      minimo: min
    };

    try {
      const response = await fetch('http://localhost:8080/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("✅ Insumo nuevo registrado en el almacén.");
        setProducto(''); setStock(''); setMinimo('');
        cargarInventarioDeBaseDeDatos(); // Refresca al toque de la BD
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🔄 ACCIÓN 2: Sumar stock a un insumo existente (Evita crear repetidos)
  const handleActualizarStockExistente = async (e) => {
    e.preventDefault();
    const cantidadSumar = parseFloat(stockASumar);

    if (!idSeleccionado) {
      alert("❌ Por favor, selecciona un insumo de la lista para actualizar.");
      return;
    }

    if (isNaN(cantidadSumar) || cantidadSumar <= 0) {
      alert("❌ La cantidad a ingresar debe ser un número mayor a 0.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/inventario/${idSeleccionado}/add-stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: cantidadSumar })
      });

      if (response.ok) {
        alert("📦 ¡Stock actualizado y sincronizado en MySQL!");
        setIdSeleccionado('');
        setStockASumar('');
        cargarInventarioDeBaseDeDatos(); // Refresca al toque de la BD
      } else {
        alert("Error en el servidor al intentar sumar stock.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para pintar las alertas críticas
  const obtenerBadgeEstado = (item) => {
    const actual = item.stock || 0;
    const min = item.minimo || 0;
    if (actual <= min) {
      return <Badge bg="danger" className="px-3 py-2">CRÍTICO</Badge>;
    }
    return <Badge bg="success" className="px-3 py-2">OK</Badge>;
  };

  // Separación limpia por categorías para las pestañas
  const insumosNutricion = inventarioDB.filter(i => i.tipo === 'Alimento');
  const insumosVeterinaria = inventarioDB.filter(i => i.tipo === 'Vacuna' || i.tipo === 'Medicamento');

  const renderTablaInsumos = (lista) => (
    <Table striped bordered hover responsive className="table-dark-custom align-middle mb-0">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre del Producto</th>
          <th>Stock Actual</th>
          <th>Unidad</th>
          <th>Alerta Mínima</th>
          <th>Estado Almacén</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((item) => {
          const idKey = item.id_inventario || item.id;
          return (
            <tr key={idKey}>
              <td>#{idKey}</td>
              <td className="fw-bold text-orange">{item.producto}</td>
              <td className="fw-bold">{item.stock}</td>
              <td><span className="badge bg-secondary">{item.unidad}</span></td>
              <td className="text-muted">{item.minimo} (Mín)</td>
              <td>{obtenerBadgeEstado(item)}</td>
            </tr>
          );
        })}
        {lista.length === 0 && (
          <tr><td colSpan="6" className="text-center text-muted py-3">No hay registros cargados para esta categoría.</td></tr>
        )}
      </tbody>
    </Table>
  );

  return (
    <div>
      <h2 className="fw-bold text-warning mb-4">Control de Inventario Centralizado</h2>

      {esJefe && (
        <Row className="mb-4">
          {/* REGISTRAR NUEVO DESDE CERO */}
          <Col md={7}>
            <Card className="shadow-sm bg-dark text-white border-secondary h-100">
              <Card.Header className="bg-warning text-dark fw-bold">Ingresar Insumo Totalmente Nuevo</Card.Header>
              <Card.Body>
                <Form onSubmit={handleGuardarNuevo} className="row g-3">
                  <Form.Group className="col-md-4">
                    <Form.Label>Producto</Form.Label>
                    <Form.Control type="text" required value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej: Maíz" />
                  </Form.Group>
                  <Form.Group className="col-md-4">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select value={tipo} onChange={e => { setTipo(e.target.value); setUnidad(e.target.value === 'Alimento' ? 'Kg' : 'ml'); }}>
                      <option value="Alimento">Alimento (Nutrición)</option>
                      <option value="Vacuna">Vacuna (Veterinaria)</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="col-md-4">
                    <Form.Label>Unidad</Form.Label>
                    <Form.Control type="text" required value={unidad} onChange={e => setUnidad(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="col-md-4">
                    <Form.Label>Stock Inicial</Form.Label>
                    <Form.Control type="number" required value={stock} onChange={e => setStock(e.target.value)} placeholder="100" />
                  </Form.Group>
                  <Form.Group className="col-md-4">
                    <Form.Label>Alerta Mínima</Form.Label>
                    <Form.Control type="number" required value={minimo} onChange={e => setMinimo(e.target.value)} placeholder="10" />
                  </Form.Group>
                  <div className="col-md-4 d-flex align-items-end">
                    <Button variant="warning" type="submit" className="w-100 fw-bold text-dark">Guardar Nuevo</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* REPOSICIÓN DE STOCK EXISTENTE */}
          <Col md={5}>
            <Card className="shadow-sm bg-dark text-white border-secondary h-100">
              <Card.Header className="bg-primary text-white fw-bold">Reposición de Mercadería (Suma Stock)</Card.Header>
              <Card.Body className="d-flex flex-column justify-content-center">
                <Form onSubmit={handleActualizarStockExistente} className="row g-3">
                  <Form.Group className="col-12">
                    <Form.Label>Seleccionar Producto a Reponer</Form.Label>
                    <Form.Select required value={idSeleccionado} onChange={e => setIdSeleccionado(e.target.value)}>
                      <option value="">Elegir de la lista...</option>
                      {inventarioDB.map(i => {
                        const idx = i.id_inventario || i.id;
                        return <option key={idx} value={idx}>{i.producto} (Actual: {i.stock} {i.unidad})</option>
                      })}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="col-md-7">
                    <Form.Label>Cantidad de Ingreso</Form.Label>
                    <Form.Control type="number" required value={stockASumar} onChange={e => setStockASumar(e.target.value)} placeholder="Ej: +50" />
                  </Form.Group>
                  <div className="col-md-5 d-flex align-items-end">
                    <Button variant="primary" type="submit" className="w-100 fw-bold">Cargar Stock</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* PESTAÑAS DIVIDIDAS POR ÁREA */}
      <Tabs defaultActiveKey="nutricion" id="tab-inventario" className="mb-3 custom-tabs-style bg-dark p-2 rounded">
        <Tab eventKey="nutricion" title="🌾 Almacén Nutrición (Alimentos)">
          <div className="bg-white p-2 rounded shadow-sm">
            {renderTablaInsumos(insumosNutricion)}
          </div>
        </Tab>
        <Tab eventKey="veterinaria" title="🩺 Depósito Veterinaria (Vacunas)">
          <div className="bg-white p-2 rounded shadow-sm">
            {renderTablaInsumos(insumosVeterinaria)}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default PanelInventario;
