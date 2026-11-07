package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alimentacion")
@CrossOrigin(origins = "*")
public class AlimentacionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Map<String, Object>> listarTodo() {
        String sql = "SELECT a.id_alimentacion AS id, l.codigo_lote AS lote, i.producto AS alimento, " +
                     "a.cantidad_kg AS cantidad, DATE_FORMAT(a.fecha_registro, '%Y-%m-%d') AS fecha " +
                     "FROM alimentacion a " +
                     "INNER JOIN lote l ON a.id_lote = l.id_lote " +
                     "INNER JOIN inventario i ON a.id_inventario = i.id_inventario " +
                     "ORDER BY a.fecha_registro DESC";
        return jdbcTemplate.queryForList(sql);
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<?> registrarAlimentacion(@RequestBody java.util.Map<String, Object> body) {
        try {
            String sql = "INSERT INTO alimentacion (id_lote, id_inventario, cantidad_kg) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, 
                Integer.parseInt(body.get("id_lote").toString()), 
                Integer.parseInt(body.get("id_inventario").toString()), 
                Double.parseDouble(body.get("cantidad_kg").toString())
            );
            return org.springframework.http.ResponseEntity.ok("{\"status\": \"OK\", \"message\": \"Alimentación guardada\"}");
        } catch (Exception e) {
            System.err.println("ERROR EN NUTRICION: " + e.getMessage());
            return org.springframework.http.ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
