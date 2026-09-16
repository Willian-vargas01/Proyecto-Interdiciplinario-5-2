delimiter //
	create procedure sp_listarEmpleados()
begin 
	select id_empleado, nombre, apellido, email, rol, fecha_creacion
    FROM empleados
    order by nombre, apellido;
end //

delimiter ;