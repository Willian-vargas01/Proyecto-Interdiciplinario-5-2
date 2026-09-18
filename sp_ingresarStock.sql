delimiter //
	create procedure sp_ingresarStock(in p_id_inventario int, in p_cantidad decimal(10,2))
begin
	update inventario 
    set cantidad_stock  = cantidad_stock  + p_cantidad
    where id_inventario  = p_id_inventario;
end //

delimiter ;