import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { FaFeatherAlt, FaInstagram, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import NavBar from './NavBar';
import AdminDashboard from './AdminDashboard';
import TiendaCliente from './TiendaCliente';
import './App.css';
import gallinasImg from './assets/gallinas.png';

function App() {

  const [currentView, setCurrentView] = useState('home'); 
  const [currentUser, setCurrentUser] = useState(() => {
    const guardado = localStorage.getItem('usuario_keke');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [usersDB, setUsersDB] = useState([]);
  const [lotesDB, setLotesDB] = useState([]);
  const [inventarioDB, setInventarioDB] = useState([]);
  const [alimentacionDB, setAlimentacionDB] = useState([]);
  const [vacunacionDB, setVacunacionDB] = useState([]);
  const [ventasDB, setVentasDB] = useState([]);



    const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('theme_keke') === 'dark';
    });
  
    
    useEffect(() => {
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme_keke', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme_keke', 'light');
      }
    }, [darkMode]);
  

  
  useEffect(() => {
    const cargarDatosDelBackend = async () => {
      try {
        const resLotes = await fetch('http://localhost:8080/api/lotes');
        if (resLotes.ok) {
          const dataLotes = await resLotes.json();
          setLotesDB(dataLotes);
        }
        
        const resUsuarios = await fetch('http://localhost:8080/api/usuarios');
        if (resUsuarios.ok) {
          const dataUsuarios = await resUsuarios.json();
          setUsersDB(dataUsuarios);
        }
        
        const resVentas = await fetch('http://localhost:8080/api/ventas');
        if (resVentas.ok) {
          const dataVentas = await resVentas.json();
            setVentasDB(dataVentas); 
        }

      } catch (err) {
        console.error('Error sincronizando datos con Spring Boot:', err);
      }
    };

    cargarDatosDelBackend();
  }, [currentView]);

  return (
    <>
      <NavBar 
        usersDB={usersDB} setUsersDB={setUsersDB} 
        currentUser={currentUser} setCurrentUser={setCurrentUser}
        setCurrentView={setCurrentView}
        darkMode={darkMode} setDarkMode={setDarkMode} 
      />


      {currentView === 'home' && (
        <>
          <div className="marquee-container shadow-sm">
            <div className="marquee-content">
              <FaFeatherAlt className="me-2"/> ¡Bienvenidos a Keke Company! • Huevos 100% orgánicos y de gallinas libres • Envíos a domicilio en pedidos mayores a $5000 • Nuestras gallinas estan 100% sanas! Vacunas al día, bien nutridas y sobretodo cuidadas con amor!!!!!!!! jejejecoñete • <FaFeatherAlt className="ms-2"/>
            </div>
          </div>

          <div className="hero-section d-flex align-items-center justify-content-center text-center px-3">
            <Container>
              <h1 className="display-3 fw-bold mb-4">
                De Chascomus a tu casa, <span className="text-orange">siempre con aura</span>
              </h1>
              <p className="lead mb-5 fs-4 mx-auto" style={{ maxWidth: '800px' }}>
                En <strong>Keke Company</strong> nos dedicamos a llevarte los mejores productos avícolas.
                Disfruta de la mejor calidad en huevos and pollos criados con los más altos estándares.
              </p>
              
              <Button className="btn-orange btn-lg fw-bold px-5 py-3 shadow me-3" onClick={() => setCurrentView('tienda')}>
                <FaShoppingCart className="me-2" /> Ver Productos
              </Button>
              
              <a href="/manual-de-usuario.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button 
                variant="outline-light" 
                className="fw-bold px-4 py-2" 
                style={{ borderRadius: '8px', borderWidth: '1.5px' }}
              >
              ¿Como usar nuestra pagina?
              </Button>
              </a>
            </Container>
          </div>

          <Container className="py-5 my-5">
            <Row className="align-items-center">
              <Col md={6} className="mb-4 mb-md-0">
                <img src={gallinasImg} alt="Nuestras gallinas" className="img-fluid rounded shadow-lg" />
              </Col>
              <Col md={6} className="px-md-5">
                <h2 className="display-5 fw-bold text-primary mb-3">Cuidado y Calidad Superior</h2>
                <p className="fs-5 text-secondary">
                  Nuestras aves son criadas en un entorno libre y saludable, garantizando productos
                  con un sabor y calidad inigualables. Seleccionamos cuidadosamente cada huevo y
                  ave para que a tu mesa solo llegue lo mejor de Keke Company.
                </p>
                <ul className="list-unstyled fs-5 mt-4">
                  <li className="mb-2"><FaFeatherAlt className="text-orange me-2"/> 100% Orgánicos y Naturales</li>
                  <li className="mb-2"><FaFeatherAlt className="text-orange me-2"/> Alimentación balanceada sin conservantes</li>
                  <li className="mb-2"><FaFeatherAlt className="text-orange me-2"/> Compromiso con el bienestar animal</li>
                </ul>
              </Col>
            </Row>
          </Container>

          <div className="bg-light py-5">
            <Container>
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary"><FaMapMarkerAlt className="text-orange me-2"/>Encontranos aquí</h2>
                <p className="">Vení a visitarnos y conocé nuestras instalaciones.</p>
              </div>
              <Row className="justify-content-center">
                <Col md={10}>
                  <div className="shadow-lg rounded overflow-hidden" style={{ height: '400px' }}>
                    <iframe 
      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1929.9224903703966!2d-58.02280293296285!3d-35.560374606113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sar!4v1794007365793!5m2!1ses-419!2sar" 
      width="100%" 
      height="100%" 
      style={{ border: 0 }} 
      allowFullScreen={true} 
      loading="lazy" 
      referrerPolicy="strict-origin-when-cross-origin"
    ></iframe>
                  </div>
                  <div className="text-center mt-4">
                    <a href="https://youtube.com_" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary fw-bold">
                      Abrir enlace en Google Maps
                    </a>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>

          <footer className="bg-dark text-white py-5 text-center">
            <Container>
              <h3 className="fw-bold text-orange mb-3">Keke Company</h3>
              <p className="mb-4">Calidad avícola con demasiada aura padre. Seguinos en nuestras redes</p>
              <div className="d-flex justify-content-center mb-4">
                <a href="https://instagram.com/laawtyy" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram /></a>
                <a href="https://youtube.com/@laawtyy" target="_blank" rel="noopener noreferrer" className="social-icon"><FaYoutube /></a>
                <a href="https://wa.me/5411278123" target="_blank" rel="noopener noreferrer" className="social-icon"><FaWhatsapp /></a>
              </div>
              <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} Keke Company. Todos los derechos reservados.</p>
            </Container>
          </footer>
        </>
      )}

 {currentView === 'tienda' && (
        <TiendaCliente 
          lotesDB={lotesDB} setLotesDB={setLotesDB}
          ventasDB={ventasDB} setVentasDB={setVentasDB}
          currentUser={currentUser} setCurrentView={setCurrentView}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard 
          currentUser={currentUser} 
          setCurrentView={setCurrentView} 
          usersDB={usersDB} setUsersDB={setUsersDB}
          lotesDB={lotesDB} setLotesDB={setLotesDB} 
          inventarioDB={inventarioDB} setInventarioDB={setInventarioDB}
          alimentacionDB={alimentacionDB} setAlimentacionDB={setAlimentacionDB}
          vacunacionDB={vacunacionDB} setVacunacionDB={setVacunacionDB}
          ventasDB={ventasDB} setVentasDB={setVentasDB}
        />
      )}
    </>
  );
}

export default App;
