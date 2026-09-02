document.addEventListener('DOMContentLoaded', () => {
    const formAve = document.getElementById('form-ave');
    const tablaAvesBody = document.getElementById('tabla-aves-body');
    const totalAvesEl = document.getElementById('total-aves');
    const btnQr = document.getElementById('btn-qr');

    let contadorAves = 1250;

    // Manejar el envio del formulario (Agregar nueva ave dinamicamente)
    formAve.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const codigo = document.getElementById('codigo').value;
        const raza = document.getElementById('raza').value;
        const peso = parseFloat(document.getElementById('peso').value).toFixed(2);
        const fechaIngreso = new Date().toISOString().split('T')[0];

        // Crear nueva fila para la tabla
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${codigo}</td>
            <td>${raza}</td>
            <td>${fechaIngreso}</td>
            <td>${peso}</td>
            <td><span class="badge badge-success">Saludable</span></td>
        `;

        // Insertar la fila al inicio de la tabla
        tablaAvesBody.prepend(tr);

        // Actualizar el contador de aves
        contadorAves++;
        totalAvesEl.textContent = contadorAves.toLocaleString();

        // Limpiar el formulario
        formAve.reset();
    });

    // Evento para simular la accion de escanear un QR
    btnQr.addEventListener('click', () => {
        alert('Iniciando camara para lectura de codigo QR...');
    });
});