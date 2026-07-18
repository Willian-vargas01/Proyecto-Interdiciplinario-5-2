DELIMITER $$

CREATE PROCEDURE sp_agregar_usuario(
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_contrasena VARCHAR(255),
    IN p_qr VARCHAR(255),
    IN p_id_rol INT
)
BEGIN
    INSERT INTO usuario(nombre, apellido, correo, contraseña, qr, id_rol)
    VALUES(p_nombre, p_apellido, p_correo, p_contrasena, p_qr, p_id_rol);
END$$

CREATE PROCEDURE sp_agregar_ave(
    IN p_codigo VARCHAR(50),
    IN p_raza VARCHAR(100),
    IN p_fecha DATE,
    IN p_peso DECIMAL(6,2),
    IN p_estado VARCHAR(100),
    IN p_lote INT
)
BEGIN
    INSERT INTO ave(codigo, raza, fecha_ingreso, peso, estado_salud, id_lote)
    VALUES(p_codigo, p_raza, p_fecha, p_peso, p_estado, p_lote);
END$$

CREATE PROCEDURE sp_agregar_producto(
    IN p_nombre VARCHAR(100),
    IN p_tipo VARCHAR(50),
    IN p_stock INT,
    IN p_stock_minimo INT,
    IN p_unidad VARCHAR(30)
)
BEGIN
    INSERT INTO inventario(nombre, tipo, stock, stock_minimo, unidad)
    VALUES(p_nombre, p_tipo, p_stock, p_stock_minimo, p_unidad);
END$$

CREATE PROCEDURE sp_registrar_venta(
    IN p_fecha DATE,
    IN p_cliente VARCHAR(100),
    IN p_total DECIMAL(10,2)
)
BEGIN
    INSERT INTO venta(fecha, cliente, total)
    VALUES(p_fecha, p_cliente, p_total);
END$$

CREATE PROCEDURE sp_registrar_gasto(
    IN p_concepto VARCHAR(100),
    IN p_monto DECIMAL(10,2),
    IN p_fecha DATE
)
BEGIN
    INSERT INTO gasto(concepto, monto, fecha)
    VALUES(p_concepto, p_monto, p_fecha);
END$$

CREATE PROCEDURE sp_actualizar_stock(
    IN p_id_producto INT,
    IN p_cantidad INT
)
BEGIN
    UPDATE inventario
    SET stock = stock + p_cantidad
    WHERE id_producto = p_id_producto;
END$$

CREATE PROCEDURE sp_listar_aves()
BEGIN
    SELECT * FROM ave;
END$$

CREATE PROCEDURE sp_listar_inventario()
BEGIN
    SELECT * FROM inventario;
END$$

DELIMITER ;
