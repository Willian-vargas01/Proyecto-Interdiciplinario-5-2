delimiter //
	create procedure sp_AvesPorLote(in p_id_lote int)
begin 
	select	id_ave ,
			codigo_ave ,
			raza ,
            peso_kg ,
            estado_salud ,
            fecha_registro
    from ave
    order by codigo_ave;
	
end // 

delimiter ;