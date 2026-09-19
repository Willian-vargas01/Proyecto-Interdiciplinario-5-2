DELIMITER //

CREATE PROCEDURE sp_registrarVacunacion(
    IN p_id_lote INT,
    IN p_id_inventario INT,
    IN p_fecha DATE,
    IN p_dosis DECIMAL(8,2),
    IN p_id_empleado INT
)
BEGIN
    DECLARE v_stock DECIMAL(10,2);

    START TRANSACTION;

    SELECT cantidad_stock
    INTO v_stock
    FROM inventario
    WHERE id_inventario = p_id_inventario;

    IF v_stock < p_dosis THEN

        ROLLBACK;

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay suficiente medicamento en stock';

    ELSE

        INSERT INTO vacunacion (
            id_lote,
            id_inventario,
            fecha_aplicacion,
            dosis_aplicada,
            id_empleado
        )
        VALUES (
            p_id_lote,
            p_id_inventario,
            p_fecha,
            p_dosis,
            p_id_empleado
        );

        UPDATE inventario
        SET cantidad_stock = cantidad_stock - p_dosis
        WHERE id_inventario = p_id_inventario;

        COMMIT;

    END IF;
END //

DELIMITER ;