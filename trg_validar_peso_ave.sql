DELIMITER //

CREATE TRIGGER trg_validar_peso_ave
BEFORE INSERT ON ave
FOR EACH ROW
BEGIN

    IF NEW.peso_kg <= 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El peso del ave debe ser mayor a cero';

    END IF;

END //

DELIMITER ;