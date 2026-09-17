delimiter //
	create procedure sp_cambiarEstadoAve(in p_id_ave int, p_estado_salud varchar(20))
begin
	update ave 
    set estado_salud = p_estado_salud
    where id_ave = p_id_ave;
end //

delimiter ;