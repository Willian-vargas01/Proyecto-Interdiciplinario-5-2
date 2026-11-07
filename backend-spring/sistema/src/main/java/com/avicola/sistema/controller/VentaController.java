package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Map<String, Object>> listarVentas() {
        try {
            String sql = "SELECT id_venta AS id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, cliente, " +
                         "codigo_lote AS lote, cantidad, metodo_pago AS metodo, costo_envio AS envio, total FROM venta";
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            return java.util.Collections.emptyList();
        }
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> body) {
        try {
            String sql = "INSERT INTO venta (cliente, total, codigo_lote, cantidad, metodo_pago, costo_envio, fecha) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            jdbcTemplate.update(sql, 
                body.get("cliente") != null ? body.get("cliente").toString() : "Cliente Web",
                Double.parseDouble(body.get("total").toString()),
                body.get("lote") != null ? body.get("lote").toString() : "LOTE-GENERAL",
                Integer.parseInt(body.get("cantidad").toString()),
                body.get("metodo") != null ? body.get("metodo").toString() : "Efectivo",
                Double.parseDouble(body.get("envio").toString())
            );
            return ResponseEntity.ok("{\"status\": \"OK\", \"message\": \"Venta guardada en MySQL\"}");
        } catch (Exception e) {
            System.err.println("ERROR EN POST VENTAS REAL: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
