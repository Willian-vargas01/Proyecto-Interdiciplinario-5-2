import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaUserCircle, FaUserPlus, FaSignOutAlt, FaShoppingCart, FaCrown, FaCog, FaUserTie, FaSun, FaMoon } from 'react-icons/fa';
import logo from './assets/logo.png';

function NavBar({ usersDB, setUsersDB, currentUser, setCurrentUser, setCurrentView, darkMode, setDarkMode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();


    const partesNombre = regName.split(" ");
    const nombreDefecto = partesNombre[0];
    const apellidoDefecto = partesNombre.slice(1).join(" ") || "Web";

    const clientePayload = {
      nombre: nombreDefecto,
      apellido: apellidoDefecto,
      email: regEmail,
      password: regPassword, 
      role: 'cliente'
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientePayload)
      });

      if (response.ok) {
        alert("✅ ¡Cuenta creada con éxito y guardada en MySQL!");
        
        // Volvemos a sincronizar la lista completa de usuarios para que el Login lo reconozca al instante
        const resActualizada = await fetch('http://localhost:8080/api/usuarios');
        if (resActualizada.ok) {
          const datosVivos = await resActualizada.json();
          setUsersDB(datosVivos);
          
          // Buscamos el usuario recién creado en la lista viva para loguearlo de inmediato
          const usuarioCreado = datosVivos.find(u => u.email === regEmail);
          if (usuarioCreado) {
            setCurrentUser(usuarioCreado);
            localStorage.setItem('usuario_keke', JSON.stringify(usuarioCreado));
          }
        }

        // Limpiar inputs y cerrar modal
        setRegName(''); setRegEmail(''); setRegPassword(''); setErrorMsg('');
        setShowRegister(false);
      } else {
        const errorData = await response.json();
        setErrorMsg('Error al guardar en base de datos: ' + errorData.message);
      }
    } catch (err) {
      setErrorMsg('No se pudo conectar con el servidor de Spring Boot.');
    }
  };


  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDB.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('usuario_keke', JSON.stringify(user)); // 👈 GUARDAR AL ENTRAR
      setLoginEmail('');
      setLoginPassword('');
      setErrorMsg('');
      setShowLogin(false);
    } else {
      setErrorMsg('Correo o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('usuario_keke'); // 👈 BORRAR AL SALIR
    setCurrentView('home');
  };


  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
        <Container>
          <Navbar.Brand className="d-flex align-items-center" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Logo Keke" height="50" className="me-2" />
            <span className="fw-bold fs-3 text-primary">Keke Company</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              
              {/* Botón interactivo de Modo Claro / Modo Oscuro */}
              <Button 
                variant={darkMode ? "outline-warning" : "outline-dark"} 
                className="me-3 border-0 rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={() => setDarkMode(!darkMode)}
                style={{ width: '40px', height: '40px' }}
                title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                {darkMode ? <FaSun className="text-warning fs-5" /> : <FaMoon className="fs-5" />}
              </Button>

              {currentUser ? (
                <>
                  <span className="fw-bold me-4 text-primary d-flex align-items-center">
                    ¡Hola, {currentUser.name}!
                    {/* Actualizado para mapear con las mayúsculas de los ENUM de tu MySQL */}
                    {currentUser.role === 'Admin' ? (
                      <Badge bg="danger" className="ms-2 d-flex align-items-center"><FaCrown className="me-1" /> Admin Supremo</Badge>
                    ) : currentUser.role === 'cliente' ? (
                      <FaShoppingCart className="ms-2 text-orange fs-5" />
                    ) : (
                      <Badge bg="info" className="ms-2 d-flex align-items-center text-white"><FaUserTie className="me-1" /> {currentUser.role}</Badge>
                    )}
                  </span>
                  
                  {/* Habilita el acceso a administración para cualquier rol que no sea cliente de la tienda */}
                  {currentUser.role !== 'cliente' && (
                    <Button variant="primary" className="me-3 fw-bold d-flex align-items-center" onClick={() => setCurrentView('admin')}>
                      <FaCog className="me-2" /> Administrar
                    </Button>
                  )}
                  <Button variant="outline-danger" onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline-primary" className="me-3 fw-bold" onClick={() => { setShowLogin(true); setErrorMsg(''); }}>
                    <FaUserCircle className="me-2 fs-5" /> Iniciar Sesión
                  </Button>
                  <Button className="btn-orange fw-bold" onClick={() => { setShowRegister(true); setErrorMsg(''); }}>
                    <FaUserPlus className="me-2 fs-5" /> Registrarse
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal de Login */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-primary">Iniciar Sesión</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3"><Form.Label>Correo</Form.Label><Form.Control type="email" required onChange={(e) => setLoginEmail(e.target.value)} /></Form.Group>
            <Form.Group className="mb-4"><Form.Label>Contraseña</Form.Label><Form.Control type="password" required onChange={(e) => setLoginPassword(e.target.value)} /></Form.Group>
            <Button variant="primary" type="submit" className="w-100 fw-bold">Entrar</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Registro */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-orange">Crear Cuenta</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" required onChange={(e) => setRegName(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Correo</Form.Label><Form.Control type="email" required onChange={(e) => setRegEmail(e.target.value)} /></Form.Group>
            <Form.Group className="mb-4"><Form.Label>Contraseña</Form.Label><Form.Control type="password" required minLength={6} onChange={(e) => setRegPassword(e.target.value)} /></Form.Group>
            <Button variant="warning" type="submit" className="w-100 fw-bold text-white btn-orange">Registrarse</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NavBar;
