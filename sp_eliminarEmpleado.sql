delimiter //
	create procedure sp_eliminarEmpleado(in p_id_empleado int)
begin
	delete from empleado
    where id_empleado = p_id_empleado;
end //

delimiter ;