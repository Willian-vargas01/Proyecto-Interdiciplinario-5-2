CREATE DATABASE sistema_avicola;
USE sistema_avicola;

CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    qr VARCHAR(255),
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    telefono VARCHAR(20),
    horario VARCHAR(100),
    estado VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50)
);

CREATE TABLE ave (
    id_ave INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50),
    raza VARCHAR(100),
    fecha_ingreso DATE,
    peso DECIMAL(6,2),
    estado_salud VARCHAR(100),
    id_lote INT,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);

CREATE TABLE alimentacion (
    id_alimentacion INT AUTO_INCREMENT PRIMARY KEY,
    id_ave INT,
    alimento VARCHAR(100),
    cantidad DECIMAL(6,2),
    fecha DATE,
    FOREIGN KEY (id_ave) REFERENCES ave(id_ave)
);

CREATE TABLE vacunacion (
    id_vacunacion INT AUTO_INCREMENT PRIMARY KEY,
    id_ave INT,
    vacuna VARCHAR(100),
    fecha DATE,
    proxima_vacuna DATE,
    FOREIGN KEY (id_ave) REFERENCES ave(id_ave)
);

CREATE TABLE inventario (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    tipo VARCHAR(50),
    stock INT,
    stock_minimo INT,
    unidad VARCHAR(30)
);

CREATE TABLE movimiento_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    tipo ENUM('Entrada','Salida'),
    cantidad INT,
    fecha DATE,
    FOREIGN KEY (id_producto) REFERENCES inventario(id_producto)
);

CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    cliente VARCHAR(100),
    total DECIMAL(10,2)
);

CREATE TABLE detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_producto INT,
    cantidad INT,
    precio DECIMAL(10,2),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES inventario(id_producto)
);

CREATE TABLE gasto (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(100),
    monto DECIMAL(10,2),
    fecha DATE
);

CREATE TABLE reporte (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100),
    fecha DATE,
    descripcion TEXT
);

CREATE TABLE alerta (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100),
    mensaje TEXT,
    fecha DATE,
    estado VARCHAR(50)
);
