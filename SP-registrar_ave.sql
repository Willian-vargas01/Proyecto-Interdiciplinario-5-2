DELIMITER //
CREATE PROCEDURE sp_registrar_ave(
    IN p_codigo VARCHAR(50),
    IN p_raza VARCHAR(50),
    IN p_peso DECIMAL(5,2),
    IN p_estado_salud VARCHAR(20),
    IN p_id_lote INT
)
BEGIN
    INSERT INTO ave (codigo_ave, raza, peso_kg, estado_salud, id_lote)
    VALUES (p_codigo, p_raza, p_peso, p_estado_salud, p_id_lote);
    
    -- Si el estado es muerta o descarte en el registro inicial, ajustar lote si corresponde
    IF p_estado_salud = 'Muerto' THEN
        UPDATE lote SET cantidad_actual = cantidad_actual - 1 WHERE id_lote = p_id_lote;
    END IF;
END //
DELIMITER ;
