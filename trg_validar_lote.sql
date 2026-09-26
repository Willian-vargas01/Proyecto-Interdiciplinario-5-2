DELIMITER //

CREATE TRIGGER trg_validar_lote
BEFORE INSERT ON lote
FOR EACH ROW
BEGIN

    IF NEW.cantidad_inicial <= 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad inicial del lote debe ser mayor a cero';

    END IF;

    IF NEW.cantidad_actual < 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad actual no puede ser negativa';

    END IF;

END //

DELIMITER ;