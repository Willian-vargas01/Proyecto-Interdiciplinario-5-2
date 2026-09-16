delimiter //
	create procedure sp_registrarLote(in p_codigo_lote varchar(50), in p_fecha_ingreso date, in p_cantidad int)
begin
	insert into lote(codigo_lote, fecha_ingro, cantidad_inicial, cantidad_actual, estado)
    
    values(p_codigo_lotes, p_fecha_ingreso, p_cantidad, p_cantidad, "EN_CRECIMIENTO");
end //

delimiter ;