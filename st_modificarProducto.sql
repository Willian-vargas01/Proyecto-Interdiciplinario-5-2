delimiter //
	create procedure st_modificarProducto(in p_id_inventario int, in p_nombre_producto varchar(100), in p_tipo varchar(20), in p_unidad varchar(20), in p_stock_minimo decimal(10,2))
begin
	update inventario
    set nombre_producto = p_nombre_producto,
		tipo = p_tipo,
        unidad_medida = p_unidad,
        stock_minimo = p_stock_minimo
        
        where id_inventario = p_id_inventario;
end //

delimiter ;