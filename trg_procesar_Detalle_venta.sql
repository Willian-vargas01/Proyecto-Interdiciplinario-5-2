DELIMITER //
CREATE TRIGGER trg_procesar_detalle_venta BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    -- 1. Calcular subtotal automáticamente
    SET NEW.subtotal = NEW.cantidad_aves * NEW.precio_unitario;
    
    -- 2. Restar aves disponibles del lote original 
    UPDATE lote 
    SET cantidad_actual = cantidad_actual - NEW.cantidad_aves
    WHERE id_lote = NEW.id_lote;
END //
DELIMITER ;
