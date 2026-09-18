delimiter //
	create procedure sp_listarInventario()
begin 
	select id_inventario,
			nombre_producto,
            tipo,
            cantidad_stock,
            unidad_medida,
            stock_minimo
            
	from inventario
    order by nombre_producto;
end //

delimiter ;