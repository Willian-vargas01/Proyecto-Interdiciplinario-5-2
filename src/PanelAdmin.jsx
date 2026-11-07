import React, { useState } from 'react';
import { Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { FaTrash, FaUserPlus, FaUserTie } from 'react-icons/fa';

function PanelAdmin({ usersDB = [], setUsersDB }) {
  const [showAdd, setShowAdd] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', apellido: '', email: '', clave: '', rol: 'Empleado', zona: 'Lotes' });

  // FILTRO SEGURO: Excluye terminantemente a los usuarios que tengan el rol 'cliente' o 'Cliente'
  const empleados = (usersDB || []).filter(u => 
    u.role !== 'Admin' && 
    u.role !== 'admin' && 
    u.role !== 'cliente' && 
    u.role !== 'Cliente'
  );

  const handleRegistrar = async (e) => {
    e.preventDefault();
    
    const empleadoPayload = {
      nombre: nuevo.nombre,
      apellido: nuevo.apellido,
      email: nuevo.email,
      password: nuevo.clave, 
      role: nuevo.rol,       
      zona: nuevo.rol === 'Empleado' ? nuevo.zona : null
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoPayload)
      });

      if (response.ok) {
        alert("Guardado real en MySQL");
        const resActualizada = await fetch('http://localhost:8080/api/usuarios');
        if (resActualizada.ok) {
          const datosVivos = await resActualizada.json();
          setUsersDB(datosVivos);
        }
        setShowAdd(false);
        setNuevo({ nombre: '', apellido: '', email: '', clave: '', rol: 'Empleado', zona: 'Lotes' });
      } else {
        const errorData = await response.json();
        alert("Error de MySQL: " + errorData.message);
      }
    } catch (err) {
      alert("Error de conexión con el servidor backend.");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary d-flex align-items-center">
          <FaUserTie className="me-3" /> Gestión de Personal
        </h2>
        <Button variant="primary" className="fw-bold" onClick={() => setShowAdd(true)}>
          <FaUserPlus className="me-2" /> Agregar Empleado
        </Button>
      </div>

      <Table striped bordered hover responsive className="shadow-sm rounded">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.id} className="align-middle">
              <td className="fw-bold">{emp.name || `${emp.nombre} ${emp.apellido}`}</td>
              <td>{emp.email}</td>
              <td>
                <Badge bg={emp.role === 'Supervisor' ? 'warning' : 'info'} className="text-white px-3 py-2">
                  {emp.role}
                </Badge>
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => setUsersDB(usersDB.filter(u => u.id !== emp.id))}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
          {empleados.length === 0 && (
            <tr><td colSpan="4" className="text-center text-muted py-3">No hay empleados registrados en el sistema.</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-primary">Registrar Nuevo Personal</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegistrar}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" required value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" required value={nuevo.apellido} onChange={e => setNuevo({...nuevo, apellido: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3"><Form.Label>Correo Electrónico</Form.Label><Form.Control type="email" required value={nuevo.email} onChange={e => setNuevo({...nuevo, email: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Contraseña Inicial</Form.Label><Form.Control type="password" required value={nuevo.clave} onChange={e => setNuevo({...nuevo, clave: e.target.value})} /></Form.Group>
            
            <Form.Group className="mb-3"><Form.Label>Rol del Sistema</Form.Label>
              <Form.Select value={nuevo.role} onChange={e => setNuevo({...nuevo, rol: e.target.value})}>
                <option value="Empleado">Empleado</option>
                <option value="Supervisor">Supervisor</option>
              </Form.Select>
            </Form.Group>

            {nuevo.rol === 'Empleado' && (
              <Form.Group className="mb-4"><Form.Label>Zona Asignada</Form.Label>
                <Form.Select value={nuevo.zona} onChange={e => setNuevo({...nuevo, zona: e.target.value})}>
                  <option value="Lotes">Lotes</option>
                  <option value="Aves">Aves</option>
                  <option value="Vacunacion">Vacunación</option>
                  <option value="Alimentacion">Alimentación</option>
                  <option value="Inventario">Inventario</option>
                  <option value="Ventas">Ventas</option>
                </Form.Select>
              </Form.Group>
            )}

            <Button variant="primary" type="submit" className="w-100 fw-bold py-2">Guardar en Sistema</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PanelAdmin;
