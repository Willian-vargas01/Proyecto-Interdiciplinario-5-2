DELIMITER //

CREATE TRIGGER trg_actualizar_lote_estado_ave
AFTER UPDATE ON ave
FOR EACH ROW
BEGIN

    IF OLD.estado_salud <> 'Muerto'
       AND NEW.estado_salud = 'Muerto' THEN

        UPDATE lote
        SET cantidad_actual = cantidad_actual - 1
        WHERE id_lote = NEW.id_lote;

    END IF;

    IF OLD.estado_salud = 'Muerto'
       AND NEW.estado_salud <> 'Muerto' THEN

        UPDATE lote
        SET cantidad_actual = cantidad_actual + 1
        WHERE id_lote = NEW.id_lote;

    END IF;

END //

DELIMITER ;