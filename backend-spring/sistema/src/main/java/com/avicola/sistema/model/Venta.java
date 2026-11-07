package com.avicola.sistema.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "venta")
@Data
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    @JsonProperty("id")
    private Integer idVenta;

    @Column(name = "fecha_venta", updatable = false)
    @JsonProperty("fecha")
    private LocalDateTime fechaVenta = LocalDateTime.now();

    private String cliente;
    private Double total;

    @Column(name = "id_empleado")
    @JsonProperty("id_empleado")
    private Integer idEmpleado = 1; // ID de Juan Pérez asignado por defecto
}
