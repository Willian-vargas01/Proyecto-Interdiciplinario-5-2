import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Button } from 'react-bootstrap';
import { FaUserTie, FaBoxes, FaAppleAlt, FaStethoscope, FaChartBar, FaMoneyBillWave, FaArrowLeft, FaCheckSquare } from 'react-icons/fa';

import PanelAdmin from './PanelAdmin';
import PanelInventario from './PanelInventario';
import PanelNutricionista from './PanelNutricionista';
import PanelVeterinario from './PanelVeterinario';
import PanelSupervisor from './PanelSupervisor';
import PanelVentas from './PanelVentas';
import PanelLotes from './PanelLotes';
import PanelAprobaciones from './PanelAprobaciones';

function AdminDashboard({ 
  currentUser, 
  usersDB, setUsersDB, 
  inventarioDB, setInventarioDB, 
  alimentacionDB, setAlimentacionDB, 
  vacunacionDB, setVacunacionDB, 
  ventasDB, lotesDB, setLotesDB,
  setCurrentView 
}) {
  
  const obtenerSubVistaInicial = () => {
    const rolActual = currentUser?.role?.toLowerCase() || currentUser?.rol?.toLowerCase();
    if (rolActual === 'admin' || rolActual === 'supervisor') {
      return 'aprobaciones';
    }
    return currentUser?.zona ? currentUser.zona.toLowerCase() : 'lotes';
  };

  const [subVista, setSubVista] = useState(obtenerSubVistaInicial);

  useEffect(() => {
    setSubVista(obtenerSubVistaInicial());
  }, [currentUser]);

  const tieneAcceso = (modulo, zonaRequerida) => {
    const rolActual = currentUser?.role?.toLowerCase() || currentUser?.rol?.toLowerCase();
    
    if (rolActual === 'admin') return true; 
    if (rolActual === 'supervisor') {
      return modulo !== 'personal'; 
    }
    
    if (rolActual === 'empleado') {
      return currentUser?.zona?.toLowerCase() === zonaRequerida?.toLowerCase();
    }
    return false;
  };

  const refrescarTodo = async () => {
    try {
      const resAlim = await fetch('http://localhost:8080/api/alimentacion');
      if (resAlim.ok) setAlimentacionDB(await resAlim.json());
      const resVac = await fetch('http://localhost:8080/api/vacunacion');
      if (resVac.ok) setVacunacionDB(await resVac.json());
      const resInv = await fetch('http://localhost:8080/api/inventario');
      if (resInv.ok) setInventarioDB(await resInv.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Row style={{ minHeight: 'calc(100vh - 80px)' }}>
        
        <Col md={3} lg={2} className="bg-dark text-white p-3 d-flex flex-column justify-content-between shadow">
          <div>
            <div className="text-center mb-4 border-bottom pb-3">
              <h5 className="fw-bold text-orange mb-1">Keke Control</h5>
              <small className="text-muted">Rol: {currentUser?.role || currentUser?.rol}</small>
              {currentUser?.zona && <div className="text-info small fw-bold">Zona: {currentUser.zona}</div>}
            </div>

            <ListGroup variant="flush" className="mb-4">
              
              {(currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'supervisor') && (
                <ListGroup.Item action onClick={() => setSubVista('aprobaciones')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'aprobaciones' ? 'text-orange fw-bold' : ''}`}>
                  <FaCheckSquare className="me-3 text-warning" /> Aprobaciones
                </ListGroup.Item>
              )}

              {tieneAcceso('personal', null) && (
                <ListGroup.Item action onClick={() => setSubVista('personal')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'personal' ? 'text-orange fw-bold' : ''}`}>
                  <FaUserTie className="me-3" /> Personal
                </ListGroup.Item>
              )}

              {tieneAcceso('lotes', 'Lotes') && (
                <ListGroup.Item action onClick={() => setSubVista('lotes')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'lotes' ? 'text-orange fw-bold' : ''}`}>
                  <FaChartBar className="me-3" /> Control Lotes
                </ListGroup.Item>
              )}

              {tieneAcceso('inventario', 'Inventario') && (
                <ListGroup.Item action onClick={() => setSubVista('inventario')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'inventario' ? 'text-orange fw-bold' : ''}`}>
                  <FaBoxes className="me-3" /> Inventario
                </ListGroup.Item>
              )}

              {tieneAcceso('nutricion', 'Alimentacion') && (
                <ListGroup.Item action onClick={() => setSubVista('nutricion')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'nutricion' ? 'text-orange fw-bold' : ''}`}>
                  <FaAppleAlt className="me-3" /> Nutrición
                </ListGroup.Item>
              )}

              {tieneAcceso('sanidad', 'Vacunacion') && (
                <ListGroup.Item action onClick={() => setSubVista('sanidad')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'sanidad' ? 'text-orange fw-bold' : ''}`}>
                  <FaStethoscope className="me-3" /> Sanidad
                </ListGroup.Item>
              )}

              {tieneAcceso('ventas', 'Ventas') && (
                <ListGroup.Item action onClick={() => setSubVista('ventas')}
                  className={`bg-transparent text-white border-0 py-3 d-flex align-items-center ${subVista === 'ventas' ? 'text-orange fw-bold' : ''}`}>
                  <FaMoneyBillWave className="me-3" /> Ventas
                </ListGroup.Item>
              )}

            </ListGroup>
          </div>

          <Button variant="outline-light" className="w-100 fw-bold mt-auto d-flex align-items-center justify-content-center" onClick={() => setCurrentView('home')}>
            <FaArrowLeft className="me-2" /> Salir al Inicio
          </Button>
        </Col>

        <Col md={9} lg={10} className="p-4 bg-light">
          <div className="bg-white p-4 rounded shadow-sm" style={{ minHeight: '100%' }}>
            
            {subVista === 'aprobaciones' && (
              <PanelAprobaciones currentUser={currentUser} actualizarDatosGlobales={refrescarTodo} />
            )}

            {subVista === 'personal' && tieneAcceso('personal', null) && (
              <PanelAdmin usersDB={usersDB} setUsersDB={setUsersDB} />
            )}

            {subVista === 'lotes' && tieneAcceso('lotes', 'Lotes') && (
              <PanelLotes lotesDB={lotesDB} setLotesDB={setLotesDB} currentUser={currentUser} />
            )}

            {subVista === 'inventario' && tieneAcceso('inventario', 'Inventario') && (
              <PanelInventario inventarioDB={inventarioDB} setInventarioDB={setInventarioDB} currentUser={currentUser} />
            )}

            {subVista === 'nutricion' && tieneAcceso('nutricion', 'Alimentacion') && (
              <PanelNutricionista 
                alimentacionDB={alimentacionDB} setAlimentacionDB={setAlimentacionDB} 
                lotesDB={lotesDB} inventarioDB={inventarioDB} setInventarioDB={setInventarioDB} 
                currentUser={currentUser}
              />
            )}

            {subVista === 'sanidad' && tieneAcceso('sanidad', 'Vacunacion') && (
              <PanelVeterinario 
                vacunacionDB={vacunacionDB} setVacunacionDB={setVacunacionDB} 
                lotesDB={lotesDB} inventarioDB={inventarioDB} setInventarioDB={setInventarioDB} 
                currentUser={currentUser}
              />
            )}

            {subVista === 'ventas' && tieneAcceso('ventas', 'Ventas') && (
              <PanelVentas ventasDB={ventasDB} />
            )}

          </div>
        </Col>

      </Row>
    </div>
  );
}

export default AdminDashboard;
