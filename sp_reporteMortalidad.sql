DELIMITER //

CREATE PROCEDURE sp_reporteMortalidad()
BEGIN
    SELECT
        l.codigo_lote,
        COUNT(a.id_ave) AS total_muertas
    FROM ave a
    INNER JOIN lote l
        ON a.id_lote = l.id_lote
    WHERE a.estado_salud = 'Muerto'
    GROUP BY
        l.id_lote,
        l.codigo_lote
    ORDER BY total_muertas DESC;
END //

DELIMITER ;