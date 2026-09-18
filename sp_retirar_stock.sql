DELIMITER //

CREATE PROCEDURE sp_retirar_stock(
    IN p_id_inventario INT,
    IN p_cantidad DECIMAL(10,2)
)
BEGIN
    DECLARE v_stock DECIMAL(10,2);

    SELECT cantidad_stock
    INTO v_stock
    FROM inventario
    WHERE id_inventario = p_id_inventario;

    IF v_stock < p_cantidad THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente';

    ELSE

        UPDATE inventario
        SET cantidad_stock = cantidad_stock - p_cantidad
        WHERE id_inventario = p_id_inventario;

    END IF;
END //

DELIMITER ;