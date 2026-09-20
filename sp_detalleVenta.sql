delimiter //
    create procedure sp_detalleVenta(in p_id_venta int)
begin
    select  v.id_venta,
            v.fecha_venta,
            v.cliente,
            l.codigo_lote,
            d.cantidad_aves,
            d.precio_unitario,
            d.subtotal
    FROM venta v
    INNER JOIN detalle_venta d
        ON v.id_venta = d.id_venta
    INNER JOIN lote l
        ON d.id_lote = l.id_lote
    WHERE v.id_venta = p_id_venta;
end //

dleimiter ;