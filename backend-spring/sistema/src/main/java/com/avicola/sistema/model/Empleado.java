package com.avicola.sistema.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "usuario")
@Data
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    @JsonProperty("id") // <--- Vincula con emp.id en React
    private Integer idEmpleado;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 150)
    @JsonProperty("email")
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonProperty("password") // <--- Vincula con emp.password en React
    private String passwordHash;

    @Column(nullable = false)
    @JsonProperty("role") // <--- Vincula con emp.role en React
    private String rol;

    private String zona;

    @Column(nullable = false)
    private Integer activo = 1;

    @Column(name = "fecha_creacion", updatable = false)
    @JsonProperty("fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    // Propiedad calculada dinámica para que React use 'name' de forma transparente
    @JsonProperty("name")
    public String getNombreCompleto() {
        return this.nombre + " " + this.apellido;
    }
}
