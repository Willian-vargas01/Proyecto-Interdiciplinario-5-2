DELIMITER //
CREATE PROCEDURE sp_listar_ventas()
BEGIN
    SELECT
        v.id_venta,
        v.fecha_venta,
        v.cliente,
        v.total,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado
    FROM venta v
    INNER JOIN empleado e
        ON v.id_empleado = e.id_empleado
    ORDER BY v.fecha_venta DESC;
END //

DELIMITER ;