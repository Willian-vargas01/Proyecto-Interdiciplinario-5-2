DELIMITER //
CREATE PROCEDURE sp_obtener_alertas_stock()
BEGIN
    SELECT 
        id_inventario, 
        nombre_producto, 
        tipo, 
        cantidad_stock, 
        stock_minimo,
        'STOCK_CRITICO' AS tipo_alerta
    FROM inventario
    WHERE cantidad_stock <= stock_minimo;
END //
DELIMITER ;
