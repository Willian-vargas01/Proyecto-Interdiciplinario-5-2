package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.avicola.sistema.model.Lote;
import com.avicola.sistema.repository.LoteRepository;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*")
public class LoteController {

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Lote> listarLotes() {
        return loteRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardarLote(@RequestBody Lote lote) {
        try {
            // 👈 CORREGIDO: En lugar de un INSERT plano, llamamos al Procedure transaccional masivo.
            // Esto inserta el Lote y genera automáticamente el bucle de N aves vinculadas físicamente en MySQL.
            String sql = "CALL sp_registrarLoteTransaccional(?, CURDATE(), ?, ?)";
            
            double precioBase = lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : 2500.0;
            
            jdbcTemplate.update(sql, 
                lote.getCodigoLote(),
                lote.getCantidadInicial(),
                precioBase
            );
            
            return ResponseEntity.ok("{\"status\": \"OK\", \"message\": \"Lote y aves sincronizados en MySQL\"}");
        } catch (Exception e) {
            System.err.println("ERROR EN POST LOTES PROCESANDO AVES: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // 👈 AGREGADO: Endpoint transaccional para leer la trazabilidad real de aves de este lote
    // Invoca tu Stored Procedure sp_AvesPorLote de la base de datos
    @GetMapping("/{id}/aves")
    public ResponseEntity<?> listarAvesDelLote(@PathVariable("id") Integer idLote) {
        try {
            String sql = "CALL sp_AvesPorLote(?)";
            List<Map<String, Object>> aves = jdbcTemplate.queryForList(sql, idLote);
            return ResponseEntity.ok(aves);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lote> actualizarLote(@PathVariable("id") Integer id, @RequestBody Lote loteDetalles) {
        Optional<Lote> loteOptional = loteRepository.findById(id);
        if (loteOptional.isPresent()) {
            Lote loteExistente = loteOptional.get();
            if (loteDetalles.getCantidadActual() != null) {
                loteExistente.setCantidadActual(loteDetalles.getCantidadActual());
            }
            if (loteDetalles.getEstado() != null) {
                loteExistente.setEstado(loteDetalles.getEstado());
            }
            if (loteDetalles.getPrecioUnitario() != null) {
                loteExistente.setPrecioUnitario(loteDetalles.getPrecioUnitario());
            }
            return ResponseEntity.ok(loteRepository.save(loteExistente));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
