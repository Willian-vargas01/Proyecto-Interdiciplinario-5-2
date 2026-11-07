package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 🔄 1. LISTAR INSUMOS (Evita que se pongan invisibles al tirar F5 en React)
    @GetMapping
    public ResponseEntity<?> listarInventario() {
        try {
            String sql = "SELECT id_inventario, producto, tipo, stock, unidad, minimo FROM inventario";
            List<Map<String, Object>> insumos = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(insumos);
        } catch (Exception e) {
            System.err.println("ERROR AL LISTAR INVENTARIO: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ➕ 2. CREAR INSUMO TOTALMENTE NUEVO
    @PostMapping
    public ResponseEntity<?> guardarNuevoInsumo(@RequestBody Map<String, Object> body) {
        try {
            String sql = "INSERT INTO inventario (producto, tipo, stock, unidad, minimo) VALUES (?, ?, ?, ?, ?)";
            
            jdbcTemplate.update(sql,
                body.get("producto"),
                body.get("tipo"),
                Double.valueOf(body.get("stock").toString()),
                body.get("unidad"),
                Double.valueOf(body.get("minimo").toString())
            );
            
            return ResponseEntity.ok().body(Map.of("status", "OK", "message", "Insumo nuevo creado en MySQL"));
        } catch (Exception e) {
            System.err.println("ERROR EN POST INVENTARIO: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 📦 3. ACTUALIZAR / SUMAR STOCK EXISTENTE (El que evita registros duplicados)
    @PutMapping("/{id}/add-stock")
    public ResponseEntity<?> sumarStockInsumo(@PathVariable("id") Integer id, @RequestBody Map<String, Object> body) {
        try {
            Double cantidadASumar = Double.valueOf(body.get("cantidad").toString());
            
            // Query directo para impactar la suma matemática en caliente sobre la celda física de MySQL
            String sql = "UPDATE inventario SET stock = stock + ? WHERE id_inventario = ?";
            int filasModificadas = jdbcTemplate.update(sql, cantidadASumar, id);
            
            if (filasModificadas > 0) {
                return ResponseEntity.ok().body(Map.of("status", "OK", "message", "Reposición de stock exitosa en MySQL"));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "No se encontró el insumo con ID: " + id));
            }
        } catch (Exception e) {
            System.err.println("ERROR ACTUALIZANDO STOCK DE INSUMO: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
