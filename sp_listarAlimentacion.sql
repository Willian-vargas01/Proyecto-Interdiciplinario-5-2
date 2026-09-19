DELIMITER //

CREATE PROCEDURE sp_listarAlimentacion()
BEGIN
    SELECT
        a.id_alimentacion,
        l.codigo_lote,
        i.nombre_producto AS alimento,
        a.cantidad_kg,
        a.fecha_registro
    FROM alimentacion a
    INNER JOIN lote l
        ON a.id_lote = l.id_lote
    INNER JOIN inventario i
        ON a.id_inventario = i.id_inventario
    ORDER BY a.fecha_registro DESC;
END //

DELIMITER ;