DELIMITER //

CREATE PROCEDURE sp_reporteVentasEmpleados()
BEGIN
    SELECT
        e.id_empleado,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado,
        COUNT(v.id_venta) AS cantidad_ventas,
        COALESCE(SUM(v.total), 0) AS dinero_generado
    FROM empleado e
    LEFT JOIN venta v
        ON e.id_empleado = v.id_empleado
    GROUP BY
        e.id_empleado,
        e.nombre,
        e.apellido
    ORDER BY dinero_generado DESC;
END //

DELIMITER ;