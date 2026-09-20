DELIMITER //

CREATE PROCEDURE sp_reporteLotes()
BEGIN
    SELECT
        l.id_lote,
        l.codigo_lote,
        l.fecha_ingreso,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.estado,
        COUNT(a.id_ave) AS aves_registradas,
        SUM(
            CASE
                WHEN a.estado_salud = 'Muerto' THEN 1
                ELSE 0
            END
        ) AS aves_muertas
    FROM lote l
    LEFT JOIN ave a
        ON l.id_lote = a.id_lote
    GROUP BY
        l.id_lote,
        l.codigo_lote,
        l.fecha_ingreso,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.estado
    ORDER BY l.fecha_ingreso DESC;
END //

DELIMITER ;