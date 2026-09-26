DELIMITER //

CREATE TRIGGER trg_validar_aves_venta
BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN

    DECLARE v_cantidad_actual INT;

    SELECT cantidad_actual
    INTO v_cantidad_actual
    FROM lote
    WHERE id_lote = NEW.id_lote;

    IF v_cantidad_actual < NEW.cantidad_aves THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay suficientes aves disponibles en el lote';

    END IF;

END //

DELIMITER ;