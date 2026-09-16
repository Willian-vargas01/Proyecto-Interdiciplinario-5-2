delimiter //
	create procedure sp_listarLotes()
begin
	select	id_lote ,
			codigo_lote ,
			fecha_ingreso ,
            cantidad_inicial ,
            cantidad_actual ,
            estado 
	from lote
    order by fecha_ingreso desc;
end //
delimiter ;