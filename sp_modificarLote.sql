delimiter //
	create procedure sp_modificarLote(in p_id_lote int, in p_codigo_lote varchar(50), in p_fecha_ingreso date, in p_estado varchar(30))
begin
	update lote
    set codigo_lote = p_codigo_lote,
		fecha_ingreso = p_fecha_ingreso,
        estado = p_estado
	where id_lote = p_id_lote;
end //

delimiter ;