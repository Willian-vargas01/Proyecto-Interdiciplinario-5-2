delimiter //
	create procedure sp_modificarAve(in p_id_ave int, in p_raza varchar(50), in p_peso_kg decimal(5,2), in estado_salud varchar(20))
begin
	update ave
    set raza = p_raza,
		peso_kg = p_pesp_kg,
        estado_salud = p_estado_salud
	where id_ave = p_id_ave;
end //

delimiter ;