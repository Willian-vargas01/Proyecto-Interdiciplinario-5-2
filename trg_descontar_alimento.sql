DELIMITER //
CREATE TRIGGER trg_descontar_alimento AFTER INSERT ON alimentacion
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_stock = cantidad_stock - NEW.cantidad_kg
    WHERE id_inventario = NEW.id_inventario;
END //
DELIMITER ;
