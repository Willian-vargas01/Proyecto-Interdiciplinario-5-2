DELIMITER //

CREATE TRIGGER trg_validar_stock_alimento
BEFORE INSERT ON alimentacion
FOR EACH ROW
BEGIN

    DECLARE v_stock DECIMAL(10,2);

    SELECT cantidad_stock
    INTO v_stock
    FROM inventario
    WHERE id_inventario = NEW.id_inventario;

    IF v_stock < NEW.cantidad_kg THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente de alimento';

    END IF;

END //

DELIMITER ;