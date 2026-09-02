DELIMITER //
CREATE PROCEDURE sp_registrar_venta(
    IN p_cliente VARCHAR(150),
    IN p_id_empleado INT,
    IN p_id_lote INT,
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(10,2)
)
BEGIN
    DECLARE v_id_venta INT;
    DECLARE v_total DECIMAL(10,2);
    
    START TRANSACTION;
    
    SET v_total = p_cantidad * p_precio_unitario;
    
    -- Insertar Cabecera de Venta
    INSERT INTO venta (cliente, total, id_empleado)
    VALUES (p_cliente, v_total, p_id_empleado);
    
    SET v_id_venta = LAST_INSERT_ID();
    
    -- Insertar Detalle (Dispara el trigger de descuento de lote)
    INSERT INTO detalle_venta (id_venta, id_lote, cantidad_aves, precio_unitario)
    VALUES (v_id_venta, p_id_lote, p_cantidad, p_precio_unitario);
    
    COMMIT;
END //
DELIMITER ;
