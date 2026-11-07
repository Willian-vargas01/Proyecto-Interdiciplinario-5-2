package com.avicola.sistema.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "inventario") // 👈 Tu tabla física en MySQL Workbench
@Data
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String producto;

    @Column(nullable = false, length = 50)
    private String tipo; // "Alimento" o "Vacuna"

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 20)
    private String unidad;

    @Column(nullable = false)
    private Integer minimo;
}
