CREATE DATABASE IF NOT EXISTS sistema_avicola CHARACTER SET utf8mb4;
USE sistema_avicola;

CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Admin','Supervisor','Empleado') NOT NULL DEFAULT 'Empleado',
    zona ENUM('Lotes','Aves','Vacunacion','Alimentacion','Inventario','Ventas') NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    codigo_lote VARCHAR(50) NOT NULL UNIQUE,
    fecha_ingreso DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_CRECIMIENTO',
    CONSTRAINT chk_lote_cantidad CHECK (cantidad_actual >= 0)
);

CREATE TABLE ave (
    id_ave INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ave VARCHAR(50) NOT NULL UNIQUE,
    raza VARCHAR(50),
    peso_kg DECIMAL(5,2),
    estado_salud VARCHAR(20) NOT NULL DEFAULT 'Sano',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_lote INT NOT NULL,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);

CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    cantidad_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_stock CHECK (cantidad_stock >= 0)
);

CREATE TABLE alimentacion (
    id_alimentacion INT AUTO_INCREMENT PRIMARY KEY,
    id_lote INT NOT NULL,
    id_inventario INT NOT NULL,
    cantidad_kg DECIMAL(10,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
);

CREATE TABLE vacunacion (
    id_vacunacion INT AUTO_INCREMENT PRIMARY KEY,
    id_lote INT NOT NULL,
    id_inventario INT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    dosis_aplicada DECIMAL(8,2) NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente VARCHAR(150) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_lote INT NOT NULL,
    cantidad_aves INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);

CREATE TABLE solicitud (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    accion VARCHAR(50) NOT NULL,
    datos TEXT NOT NULL,
    estado ENUM('Pendiente','Aprobada','Rechazada') NOT NULL DEFAULT 'Pendiente',
    id_solicitante INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_revisor INT NULL,
    fecha_revision TIMESTAMP NULL DEFAULT NULL,
    motivo VARCHAR(255) NULL,
    FOREIGN KEY (id_solicitante) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_revisor) REFERENCES empleado(id_empleado)
);

DROP PROCEDURE IF EXISTS sp_AvesPorLote;
DELIMITER //
CREATE PROCEDURE sp_AvesPorLote(IN p_id_lote INT)
BEGIN
    SELECT
        a.id_ave,
        a.codigo_ave,
        l.codigo_lote,
        a.raza,
        a.peso_kg,
        a.estado_salud,
        a.fecha_registro
    FROM ave a
    INNER JOIN lote l ON l.id_lote = a.id_lote
    WHERE p_id_lote IS NULL OR a.id_lote = p_id_lote
    ORDER BY a.codigo_ave;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_alertasStock;
DELIMITER //
CREATE PROCEDURE sp_alertasStock()
BEGIN
    SELECT 
        id_inventario, 
        nombre_producto, 
        tipo, 
        cantidad_stock, 
        stock_minimo,
        'STOCK_CRITICO' AS tipo_alerta
    FROM inventario
    WHERE cantidad_stock <= stock_minimo;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_cambiarEstadoAve;
DELIMITER //
CREATE PROCEDURE sp_cambiarEstadoAve(IN p_id_ave INT, IN p_estado_salud VARCHAR(20))
BEGIN
    DECLARE v_estado VARCHAR(20);
    DECLARE v_lote INT;
    SELECT estado_salud, id_lote INTO v_estado, v_lote FROM ave WHERE id_ave = p_id_ave;
    UPDATE ave SET estado_salud = p_estado_salud WHERE id_ave = p_id_ave;
    IF p_estado_salud = 'Muerto' AND v_estado <> 'Muerto' THEN
        UPDATE lote SET cantidad_actual = cantidad_actual - 1 WHERE id_lote = v_lote;
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_cambiarEstadoLote;
DELIMITER //

CREATE PROCEDURE sp_cambiarEstadoLote(IN p_id_lote INT,IN p_estado VARCHAR(30))
BEGIN
    UPDATE lote
    SET estado = p_estado
    WHERE id_lote = p_id_lote;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_crearSolicitud;
DELIMITER //
CREATE PROCEDURE sp_crearSolicitud(IN p_accion VARCHAR(50), IN p_datos TEXT, IN p_id_solicitante INT)
BEGIN
    INSERT INTO solicitud (accion, datos, id_solicitante) VALUES (p_accion, p_datos, p_id_solicitante);
    SELECT LAST_INSERT_ID() AS id_solicitud;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_detalleVenta;
delimiter //
    create procedure sp_detalleVenta(in p_id_venta int)
begin
    select  v.id_venta,
            v.fecha_venta,
            v.cliente,
            l.codigo_lote,
            d.cantidad_aves,
            d.precio_unitario,
            d.subtotal
    FROM venta v
    INNER JOIN detalle_venta d
        ON v.id_venta = d.id_venta
    INNER JOIN lote l
        ON d.id_lote = l.id_lote
    WHERE v.id_venta = p_id_venta;
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_eliminarEmpleado;
DELIMITER //
CREATE PROCEDURE sp_eliminarEmpleado(IN p_id_empleado INT)
BEGIN
    UPDATE empleado SET activo = 0 WHERE id_empleado = p_id_empleado;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ingresarStock;
DELIMITER //
CREATE PROCEDURE sp_ingresarStock(IN p_id_inventario INT, IN p_cantidad DECIMAL(10,2))
BEGIN
    UPDATE inventario SET cantidad_stock = cantidad_stock + p_cantidad WHERE id_inventario = p_id_inventario AND p_cantidad > 0;
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto inexistente o cantidad inválida';
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_listarAlimentacion;
DELIMITER //

CREATE PROCEDURE sp_listarAlimentacion()
BEGIN
    SELECT
        a.id_alimentacion,
        l.codigo_lote,
        i.nombre_producto AS alimento,
        a.cantidad_kg,
        a.fecha_registro
    FROM alimentacion a
    INNER JOIN lote l
        ON a.id_lote = l.id_lote
    INNER JOIN inventario i
        ON a.id_inventario = i.id_inventario
    ORDER BY a.fecha_registro DESC;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_listarEmpleados;
DELIMITER //
CREATE PROCEDURE sp_listarEmpleados()
BEGIN
    SELECT id_empleado, nombre, apellido, email, rol, zona, fecha_creacion
    FROM empleado
    WHERE activo = 1
    ORDER BY nombre, apellido;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_listarInventario;
delimiter //
	create procedure sp_listarInventario()
begin 
	select id_inventario,
			nombre_producto,
            tipo,
            cantidad_stock,
            unidad_medida,
            stock_minimo
            
	from inventario
    order by nombre_producto;
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_listarLotes;
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

DROP PROCEDURE IF EXISTS sp_listarSolicitudes;
DELIMITER //
CREATE PROCEDURE sp_listarSolicitudes(IN p_estado VARCHAR(20), IN p_id_solicitante INT)
BEGIN
    SELECT
        s.id_solicitud,
        s.accion,
        s.datos,
        s.estado,
        s.fecha_solicitud,
        s.fecha_revision,
        s.motivo,
        CONCAT(e.nombre, ' ', e.apellido) AS solicitante,
        e.zona,
        CONCAT(r.nombre, ' ', r.apellido) AS revisor
    FROM solicitud s
    INNER JOIN empleado e ON e.id_empleado = s.id_solicitante
    LEFT JOIN empleado r ON r.id_empleado = s.id_revisor
    WHERE (p_estado IS NULL OR (p_estado = 'Historial' AND s.estado <> 'Pendiente') OR s.estado = p_estado)
      AND (p_id_solicitante IS NULL OR s.id_solicitante = p_id_solicitante)
    ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_listarVacunacion;
DELIMITER //
CREATE PROCEDURE sp_listarVacunacion()
BEGIN
    SELECT
        v.id_vacunacion,
        l.codigo_lote,
        i.nombre_producto AS vacuna,
        v.dosis_aplicada,
        v.fecha_aplicacion,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado
    FROM vacunacion v
    INNER JOIN lote l ON l.id_lote = v.id_lote
    INNER JOIN inventario i ON i.id_inventario = v.id_inventario
    INNER JOIN empleado e ON e.id_empleado = v.id_empleado
    ORDER BY v.fecha_aplicacion DESC, v.id_vacunacion DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_listarVentas;
DELIMITER //
CREATE PROCEDURE sp_listarVentas()
BEGIN
    SELECT
        v.id_venta,
        v.fecha_venta,
        v.cliente,
        l.codigo_lote,
        d.cantidad_aves,
        d.precio_unitario,
        v.total,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado
    FROM venta v
    INNER JOIN detalle_venta d ON d.id_venta = v.id_venta
    INNER JOIN lote l ON l.id_lote = d.id_lote
    INNER JOIN empleado e ON e.id_empleado = v.id_empleado
    ORDER BY v.fecha_venta DESC, v.id_venta DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_loginEmpleado;
DELIMITER //
CREATE PROCEDURE sp_loginEmpleado(IN p_email VARCHAR(150))
BEGIN
    SELECT id_empleado, nombre, apellido, rol, zona, password_hash FROM empleado WHERE email = p_email AND activo = 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_modificarAve;
delimiter //
	create procedure sp_modificarAve(in p_id_ave int, in p_raza varchar(50), in p_peso_kg decimal(5,2), in p_estado_salud varchar(20))
begin
	update ave
    set raza = p_raza,
		peso_kg = p_peso_kg,
        estado_salud = p_estado_salud
	where id_ave = p_id_ave;
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_modificarEmpleado;
DELIMITER //
CREATE PROCEDURE sp_modificarEmpleado(IN p_id_empleado INT, IN p_nombre VARCHAR(100), IN p_apellido VARCHAR(100), IN p_email VARCHAR(150), IN p_rol VARCHAR(20), IN p_zona VARCHAR(20))
BEGIN
    IF p_rol = 'Empleado' AND p_zona IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un empleado debe tener una zona asignada';
    END IF;
    UPDATE empleado
    SET nombre = p_nombre,
        apellido = p_apellido,
        email = p_email,
        rol = p_rol,
        zona = IF(p_rol = 'Empleado', p_zona, NULL)
    WHERE id_empleado = p_id_empleado;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_modificarLote;
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

DROP PROCEDURE IF EXISTS sp_modificarProducto;
delimiter //
	create procedure sp_modificarProducto(in p_id_inventario int, in p_nombre_producto varchar(100), in p_tipo varchar(20), in p_unidad varchar(20), in p_stock_minimo decimal(10,2))
begin
	update inventario
    set nombre_producto = p_nombre_producto,
		tipo = p_tipo,
        unidad_medida = p_unidad,
        stock_minimo = p_stock_minimo
        
        where id_inventario = p_id_inventario;
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_obtenerSolicitud;
DELIMITER //
CREATE PROCEDURE sp_obtenerSolicitud(IN p_id_solicitud INT)
BEGIN
    SELECT id_solicitud, accion, datos, estado, id_solicitante FROM solicitud WHERE id_solicitud = p_id_solicitud;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_reabrirSolicitud;
DELIMITER //
CREATE PROCEDURE sp_reabrirSolicitud(IN p_id_solicitud INT)
BEGIN
    UPDATE solicitud
    SET estado = 'Pendiente', id_revisor = NULL, fecha_revision = NULL, motivo = NULL
    WHERE id_solicitud = p_id_solicitud AND estado = 'Aprobada';
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrarAlimentacion;
DELIMITER //
CREATE PROCEDURE sp_registrarAlimentacion(IN p_id_lote INT, IN p_id_inventario INT, IN p_cantidad_kg DECIMAL(10,2))
BEGIN
    DECLARE v_stock DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT cantidad_stock INTO v_stock FROM inventario WHERE id_inventario = p_id_inventario FOR UPDATE;
    IF v_stock IS NULL OR p_cantidad_kg <= 0 OR v_stock < p_cantidad_kg THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
    INSERT INTO alimentacion (id_lote, id_inventario, cantidad_kg) VALUES (p_id_lote, p_id_inventario, p_cantidad_kg);
    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrarAve;
DELIMITER //

CREATE PROCEDURE sp_registrarAve(IN p_codigo VARCHAR(50), IN p_raza VARCHAR(50), IN p_peso DECIMAL(5,2), IN p_estado_salud VARCHAR(20), IN p_id_lote INT)
BEGIN
    INSERT INTO ave (codigo_ave, raza, peso_kg, estado_salud, id_lote)
    
    VALUES (p_codigo, p_raza ,p_peso, p_estado_salud, p_id_lote);

    IF p_estado_salud = 'Muerto' THEN
        UPDATE lote
        SET cantidad_actual = cantidad_actual - 1
        WHERE id_lote = p_id_lote;
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrarEmpleado;
DELIMITER //
CREATE PROCEDURE sp_registrarEmpleado(IN p_nombre VARCHAR(100), IN p_apellido VARCHAR(100), IN p_email VARCHAR(150), IN p_password_hash VARCHAR(255), IN p_rol VARCHAR(20), IN p_zona VARCHAR(20))
BEGIN
    IF p_rol = 'Empleado' AND p_zona IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un empleado debe tener una zona asignada';
    END IF;
    INSERT INTO empleado (nombre, apellido, email, password_hash, rol, zona)
    VALUES (p_nombre, p_apellido, p_email, p_password_hash, p_rol, IF(p_rol = 'Empleado', p_zona, NULL));
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrarLote;
delimiter //
	create procedure sp_registrarLote(in p_codigo_lote varchar(50), in p_fecha_ingreso date, in p_cantidad int)
begin
	insert into lote(codigo_lote, fecha_ingreso, cantidad_inicial, cantidad_actual, estado)
    
    values(p_codigo_lote, p_fecha_ingreso, p_cantidad, p_cantidad, "EN_CRECIMIENTO");
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_registrarProducto;
delimiter //
	create procedure sp_registrarProducto(in p_nombre varchar(100), in p_tipo varchar(20), in p_cantidad_stock decimal(10,2), in p_unidad_medida varchar(20), in p_stock_minimo decimal(10,2))
begin 
	insert into inventario(nombre_producto, tipo, cantidad_stock, unidad_medida, stock_minimo)
    
    values(p_nombre, p_tipo, p_cantidad_stock, p_unidad_medida, p_stock_minimo);
end //

delimiter ;

DROP PROCEDURE IF EXISTS sp_registrarVacunacion;
DELIMITER //
CREATE PROCEDURE sp_registrarVacunacion(IN p_id_lote INT, IN p_id_inventario INT, IN p_fecha DATE, IN p_dosis DECIMAL(8,2), IN p_id_empleado INT)
BEGIN
    DECLARE v_stock DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT cantidad_stock INTO v_stock FROM inventario WHERE id_inventario = p_id_inventario FOR UPDATE;
    IF v_stock IS NULL OR p_dosis <= 0 OR v_stock < p_dosis THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
    INSERT INTO vacunacion (id_lote, id_inventario, fecha_aplicacion, dosis_aplicada, id_empleado) VALUES (p_id_lote, p_id_inventario, p_fecha, p_dosis, p_id_empleado);
    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_registrarVenta;
DELIMITER //
CREATE PROCEDURE sp_registrarVenta(IN p_cliente VARCHAR(150), IN p_id_empleado INT, IN p_id_lote INT, IN p_cantidad INT, IN p_precio_unitario DECIMAL(10,2))
BEGIN
    DECLARE v_disponibles INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    START TRANSACTION;
    SELECT cantidad_actual INTO v_disponibles FROM lote WHERE id_lote = p_id_lote FOR UPDATE;
    IF v_disponibles IS NULL OR p_cantidad <= 0 OR v_disponibles < p_cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Aves insuficientes en el lote';
    END IF;
    INSERT INTO venta (cliente, total, id_empleado) VALUES (p_cliente, p_cantidad * p_precio_unitario, p_id_empleado);
    INSERT INTO detalle_venta (id_venta, id_lote, cantidad_aves, precio_unitario) VALUES (LAST_INSERT_ID(), p_id_lote, p_cantidad, p_precio_unitario);
    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_reporteLotes;
DELIMITER //

CREATE PROCEDURE sp_reporteLotes()
BEGIN
    SELECT
        l.id_lote,
        l.codigo_lote,
        l.fecha_ingreso,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.estado,
        COUNT(a.id_ave) AS aves_registradas,
        SUM(
            CASE
                WHEN a.estado_salud = 'Muerto' THEN 1
                ELSE 0
            END
        ) AS aves_muertas
    FROM lote l
    LEFT JOIN ave a
        ON l.id_lote = a.id_lote
    GROUP BY
        l.id_lote,
        l.codigo_lote,
        l.fecha_ingreso,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.estado
    ORDER BY l.fecha_ingreso DESC;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_reporteMortalidad;
DELIMITER //

CREATE PROCEDURE sp_reporteMortalidad()
BEGIN
    SELECT
        l.codigo_lote,
        COUNT(a.id_ave) AS total_muertas
    FROM ave a
    INNER JOIN lote l
        ON a.id_lote = l.id_lote
    WHERE a.estado_salud = 'Muerto'
    GROUP BY
        l.id_lote,
        l.codigo_lote
    ORDER BY total_muertas DESC;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_reporteVentasEmpleados;
DELIMITER //

CREATE PROCEDURE sp_reporteVentasEmpleados()
BEGIN
    SELECT
        e.id_empleado,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado,
        COUNT(v.id_venta) AS cantidad_ventas,
        COALESCE(SUM(v.total), 0) AS dinero_generado
    FROM empleado e
    LEFT JOIN venta v
        ON e.id_empleado = v.id_empleado
    GROUP BY
        e.id_empleado,
        e.nombre,
        e.apellido
    ORDER BY dinero_generado DESC;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_resolverSolicitud;
DELIMITER //
CREATE PROCEDURE sp_resolverSolicitud(IN p_id_solicitud INT, IN p_estado VARCHAR(20), IN p_id_revisor INT, IN p_motivo VARCHAR(255))
BEGIN
    UPDATE solicitud
    SET estado = p_estado, id_revisor = p_id_revisor, fecha_revision = NOW(), motivo = p_motivo
    WHERE id_solicitud = p_id_solicitud AND estado = 'Pendiente';
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La solicitud no existe o ya fue resuelta';
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_retirarStock;
DELIMITER //
CREATE PROCEDURE sp_retirarStock(IN p_id_inventario INT, IN p_cantidad DECIMAL(10,2))
BEGIN
    UPDATE inventario SET cantidad_stock = cantidad_stock - p_cantidad WHERE id_inventario = p_id_inventario AND p_cantidad > 0 AND cantidad_stock >= p_cantidad;
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_descontar_alimento;
DELIMITER //
CREATE TRIGGER trg_descontar_alimento AFTER INSERT ON alimentacion
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_stock = cantidad_stock - NEW.cantidad_kg
    WHERE id_inventario = NEW.id_inventario;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_descontar_vacuna;
DELIMITER //
CREATE TRIGGER trg_descontar_vacuna AFTER INSERT ON vacunacion
FOR EACH ROW
BEGIN
    UPDATE inventario 
    SET cantidad_stock = cantidad_stock - NEW.dosis_aplicada
    WHERE id_inventario = NEW.id_inventario;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_procesar_detalle_venta;
DELIMITER //
CREATE TRIGGER trg_procesar_detalle_venta BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.cantidad_aves * NEW.precio_unitario;
    UPDATE lote 
    SET cantidad_actual = cantidad_actual - NEW.cantidad_aves
    WHERE id_lote = NEW.id_lote;
END //
DELIMITER ;

