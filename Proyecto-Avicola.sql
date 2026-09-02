CREATE DATABASE IF NOT EXISTS sistema_avicola;
USE sistema_avicola;

-- 1. Tabla de Empleados / Usuarios
CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR', 'VETERINARIO', 'EMPLEADO') DEFAULT 'EMPLEADO',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Lotes de Aves
CREATE TABLE lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    fecha_ingreso DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    estado ENUM('EN_CRECIMIENTO', 'FINALIZADO', 'CUARENTENA') DEFAULT 'EN_CRECIMIENTO'
);

-- 3. Tabla de Aves 
CREATE TABLE ave (
    id_ave INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ave VARCHAR(50) UNIQUE NOT NULL,
    raza VARCHAR(50) NOT NULL,
    peso_kg DECIMAL(5,2) NOT NULL,
    estado_salud ENUM('Saludable', 'En tratamiento', 'Muerto') DEFAULT 'Saludable',
    id_lote INT NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote) ON DELETE CASCADE
);

-- 4. Tabla de Inventario 
CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    tipo ENUM('ALIMENTO', 'MEDICAMENTO', 'EQUIPO', 'OTRO') NOT NULL,
    cantidad_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unidad_medida VARCHAR(20) NOT NULL, -- kg, litros, unidades
    stock_minimo DECIMAL(10,2) NOT NULL DEFAULT 10.00
);

-- 5. Control de Vacunación 
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

CREATE TABLE alimentacion (
    id_alimentacion INT AUTO_INCREMENT PRIMARY KEY,
    id_lote INT NOT NULL,
    id_inventario INT NOT NULL, 
    cantidad_kg DECIMAL(8,2) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
);


CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    cliente VARCHAR(150) NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- 8. Detalle de Ventas 
CREATE TABLE detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_lote INT NOT NULL, 
    cantidad_aves INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);
