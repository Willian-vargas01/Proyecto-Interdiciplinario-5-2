import React from 'react';
import { Table, Card } from 'react-bootstrap';
import { FaMoneyBillWave } from 'react-icons/fa';

function PanelVentas({ ventasDB = [] }) {
  // Calculamos el total de dinero recaudado dinámicamente sumando los totales de la BD
  const recaudacionTotal = (ventasDB || []).reduce((acc, venta) => acc + (venta.total || 0), 0);

  return (
    <div>
      <h2 className="fw-bold text-success mb-4">
        <FaMoneyBillWave className="me-2"/> Control de Ventas
      </h2>
      
      <Card className="mb-4 border-0 shadow-sm bg-light">
        <Card.Body className="text-center">
          <h5 className="text-muted text-uppercase mb-2">Recaudación Total (Histórica)</h5>
          <h2 className="display-5 fw-bold text-success mb-0">
            ${recaudacionTotal.toLocaleString()} ARS
          </h2>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="bg-secondary text-white">
          <tr>
            <th>ID Venta</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Lote Origen</th>
            <th>Aves Vendidas</th>
            <th>Método Pago</th>
            <th>Envío</th>
            <th>Total Cobrado</th>
          </tr>
        </thead>
        <tbody>
          {(ventasDB || []).map((venta) => {
            // Mapeo seguro y tolerante para evitar celdas vacías entre MySQL y React
            const idVentaReal = venta.id_venta || venta.id;
            const fechaReal = venta.fecha ? venta.fecha.split('T')[0] : '-';
            const loteReal = venta.codigo_lote || venta.lote || "General";
            const metodoReal = venta.metodo_pago || venta.metodo || "Mercado Pago";
            const envioReal = venta.costo_envio !== undefined ? venta.costo_envio : (venta.envio || 4000);

            return (
              <tr key={idVentaReal} className="align-middle">
                <td>#{idVentaReal}</td>
                <td>{fechaReal}</td>
                <td className="fw-bold">{venta.cliente || "Cliente Web"}</td>
                <td className="text-orange fw-bold">{loteReal}</td>
                <td>{venta.cantidad || 0} un.</td>
                <td>
                  <span className={`badge ${metodoReal === 'Efectivo' ? 'bg-success' : 'bg-info'} px-3 py-2`}>
                    {metodoReal}
                  </span>
                </td>
                <td>${Number(envioReal).toLocaleString()}</td>
                <td className="fw-bold text-success">${(venta.total || 0).toLocaleString()}</td>
              </tr>
            );
          })}
          {(ventasDB || []).length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-4 text-muted">
                No hay ventas registradas aún en el sistema.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default PanelVentas;
