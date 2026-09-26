DELIMITER //

CREATE TRIGGER trg_validar_inventario
BEFORE INSERT ON inventario
FOR EACH ROW
BEGIN

    IF NEW.cantidad_stock < 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El stock no puede ser negativo';

    END IF;

    IF NEW.stock_minimo < 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El stock mínimo no puede ser negativo';

    END IF;

END //

DELIMITER ;