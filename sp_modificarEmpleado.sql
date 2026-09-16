delimiter //
	create procedure sp_modificarEmpleado(in p_id_empleado int, in p_nombre varchar(100), in p_apellido varchar(100), in p_email varchar(150), in p_rol varchar(20))
begin
	update empleados 
    set nombre = p_nombre,
		apellido = p_apellido,
        email = p_email,
        rol = p_rol
        
	where id_empleado = p_id_empleado;
end //

delimiter ;