package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vacunacion")
@CrossOrigin(origins = "*")
public class VacunacionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Map<String, Object>> listarTodo() {
        String sql = "SELECT v.id_vacunacion AS id, l.codigo_lote AS lote, i.producto AS vacuna, " +
                     "v.dosis_aplicada AS dosis, DATE_FORMAT(v.fecha_aplicacion, '%Y-%m-%d') AS fecha " +
                     "FROM vacunacion v " +
                     "INNER JOIN lote l ON v.id_lote = l.id_lote " +
                     "INNER JOIN inventario i ON v.id_inventario = i.id_inventario " +
                     "ORDER BY v.fecha_aplicacion DESC";
        return jdbcTemplate.queryForList(sql);
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> registrarVacunacion(@RequestBody java.util.Map<String, Object> body) {
        try {
            String sql = "INSERT INTO vacunacion (id_lote, id_inventario, fecha_aplicacion, dosis_aplicada, id_empleado) VALUES (?, ?, CURDATE(), ?, ?)";
            jdbcTemplate.update(sql, 
                Integer.parseInt(body.get("id_lote").toString()), 
                Integer.parseInt(body.get("id_inventario").toString()), 
                Double.parseDouble(body.get("dosis_aplicada").toString()), 
                Integer.parseInt(body.get("id_empleado").toString())
            );
            return org.springframework.http.ResponseEntity.ok("{\"status\": \"OK\", \"message\": \"Vacunación guardada\"}");
        } catch (Exception e) {
            System.err.println("ERROR EN SANIDAD: " + e.getMessage());
            return org.springframework.http.ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
