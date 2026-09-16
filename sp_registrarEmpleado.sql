delimiter //
	create procedure sp_registrarEmpleado(in p_nombre varchar(100), in p_apellido varchar(100), in p_email varchar(150), in p_password_hash varchar(255), in p_rol varchar(20))
begin
	insert	into empleado (nombre, apellido, email, password_hash, rol)
    
    values(p_nombre, p_apellido, p_email, p_password_hash, p_rol);
end //

delimiter ;