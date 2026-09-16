DELIMITER //

CREATE PROCEDURE sp_cambiarEstadoLote(IN p_id_lote INT,IN p_estado VARCHAR(30))
BEGIN
    UPDATE lote
    SET estado = p_estado
    WHERE id_lote = p_id_lote;
END //

DELIMITER ;
