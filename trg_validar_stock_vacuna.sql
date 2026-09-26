DELIMITER //

CREATE TRIGGER trg_validar_stock_vacuna
BEFORE INSERT ON vacunacion
FOR EACH ROW
BEGIN

    DECLARE v_stock DECIMAL(10,2);

    SELECT cantidad_stock
    INTO v_stock
    FROM inventario
    WHERE id_inventario = NEW.id_inventario;

    IF v_stock < NEW.dosis_aplicada THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente de vacuna';

    END IF;

END //

DELIMITER ;