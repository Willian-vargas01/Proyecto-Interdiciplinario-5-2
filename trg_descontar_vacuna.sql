DELIMITER //
CREATE TRIGGER trg_descontar_vacuna AFTER INSERT ON vacunacion
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_stock = cantidad_stock - NEW.dosis_aplicada
    WHERE id_inventario = NEW.id_inventario;
END //
DELIMITER ;
