package com.avicola.sistema.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate; // Inyección para usar tu SP nativo
import org.springframework.web.bind.annotation.*;
import com.avicola.sistema.model.Empleado;
import com.avicola.sistema.repository.EmpleadoRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class EmpleadoController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate; // Permite ejecutar el script de tu SP nativo

    @GetMapping
    public List<Empleado> listarUsuarios() {
        return empleadoRepository.findAll();
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> registrarNuevoEmpleado(@RequestBody Empleado emp) {
        try {
            // Si el rol es cliente, hacemos un INSERT directo a la nueva tabla general 'usuario'
            if ("cliente".equalsIgnoreCase(emp.getRol())) {
                String sqlCliente = "INSERT INTO usuario (nombre, apellido, email, password_hash, rol, zona, activo) VALUES (?, ?, ?, ?, ?, ?, ?)";
                jdbcTemplate.update(sqlCliente, 
                    emp.getNombre(), 
                    emp.getApellido(),
                    emp.getEmail(), 
                    emp.getPasswordHash(), 
                    "cliente", // Rol para React
                    null,      // Sin zona de granja
                    1          // Activo
                );
                return org.springframework.http.ResponseEntity.ok("{\"status\": \"OK\", \"message\": \"Cliente registrado en MySQL\"}");
            }

            // Si es personal de la granja (Admin, Supervisor, Empleado), sigue usando tu Procedure nativo
            String sql = "CALL sp_registrarEmpleado(?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, 
                emp.getNombre(), 
                emp.getApellido(), 
                emp.getEmail(), 
                emp.getPasswordHash(), 
                emp.getRol(), 
                emp.getZona()
            );
            return org.springframework.http.ResponseEntity.ok("{\"status\": \"OK\"}");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
