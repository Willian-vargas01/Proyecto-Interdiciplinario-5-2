delimiter //
	create procedure sp_registrarProducto(in p_nombre varchar(100), in p_tipo varchar(20), in p_cantidad_stock decimal(10,2), in p_unidad_medida varchar(20), in p_stock_minimo decimal(10,2))
begin 
	insert into inventario(nombre, tipo, cantida_stock, unidad_medida, stock_minimo)
    
    values(p_nombre, p_tipo, p_cantidad_stock, p_unidad_medida, p_stock_minimo);
end //

delimiter ;