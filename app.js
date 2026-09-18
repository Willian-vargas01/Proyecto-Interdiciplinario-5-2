const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const btnLogout = document.getElementById('btn-logout');
const welcomeMessage = document.getElementById('welcome-message');
const dashboardWidgets = document.getElementById('dashboard-widgets');

const roleConfig = {
    dueno: {
        title: 'Panel de Gerencia General',
        widgets: [
            'Reportes Financieros y Trazabilidad',
            'Control de Managers y Zonas',
            'Configuración Global del Sistema',
            'Auditoría de Calidad'
        ]
    },
    admin: {
        title: 'Panel de Administración de Zona',
        widgets: [
            'Gestión de Inventario (Alimento y Vacunas)',
            'Gestión de Usuarios y Empleados',
            'Alerta de Stock Mínimo',
            'Asignación de Tareas'
        ]
    },
    empleado: {
        title: 'Panel Operativo',
        widgets: [
            'Registro Pecuario (Aves y Lotes)',
            'Registro de Alimentación',
            'Control de Vacunación',
            'Consultar Tareas Pendientes'
        ]
    },
    cliente: {
        title: 'Portal de Clientes',
        widgets: [
            'Catálogo de Lotes Disponibles',
            'Mis Compras y Facturas',
            'Seguimiento de Envíos',
            'Certificados de Calidad'
        ]
    }
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.getElementById('role-simulator').value;
    loadDashboard(role);
});

btnLogout.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    btnLogout.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
});

function loadDashboard(role) {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    btnLogout.classList.remove('hidden');

    const config = roleConfig[role];
    welcomeMessage.textContent = config.title;
    
    dashboardWidgets.innerHTML = '';
    
    config.widgets.forEach(widgetText => {
        const widget = document.createElement('div');
        widget.className = 'widget';
        widget.innerHTML = `<h3>${widgetText}</h3><p>Acceder al módulo...</p>`;
        dashboardWidgets.appendChild(widget);
    });
}
