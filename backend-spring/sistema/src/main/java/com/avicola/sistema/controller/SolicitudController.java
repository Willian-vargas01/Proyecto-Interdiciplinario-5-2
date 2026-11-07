package com.avicola.sistema.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class SolicitudController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 👈 AGREGADO: Endpoint para recibir y registrar las solicitudes transaccionales de los empleados
    @PostMapping
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> crearSolicitud(@RequestBody Map<String, Object> payload) {
        try {
            String sql = "INSERT INTO solicitud (accion, datos, estado, id_solicitante) VALUES (?, ?, 'Pendiente', ?)";
            
            jdbcTemplate.update(sql, 
                payload.get("accion"),
                payload.get("datos"),
                payload.get("id_solicitante")
            );
            
            return ResponseEntity.ok().body(Map.of("status", "OK", "message", "Solicitud registrada en MySQL"));
        } catch (Exception e) {
            System.err.println("ERROR EN POST SOLICITUDES: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // 👈 AGREGADO: Endpoint para que el Supervisor consulte la lista de pendientes reales de la BD
    @GetMapping("/pendientes")
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> listarPendientes() {
        try {
            String sql = "SELECT s.id_solicitud, s.accion, s.datos, s.estado, s.id_solicitante, " +
                         "CONCAT(u.nombre, ' ', u.apellido) AS nombre_solicitante " +
                         "FROM solicitud s INNER JOIN usuario u ON s.id_solicitante = u.id_empleado " +
                         "WHERE s.estado = 'Pendiente'";
            List<Map<String, Object>> pendientes = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/resolver")
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> resolverSolicitud(@PathVariable("id") Integer id, @RequestBody Map<String, Object> body) {
        try {
            String estado = (String) body.get("estado");
            Integer idRevisor = (Integer) body.get("id_revisor");
            String motivo = (String) body.get("motivo");

            String sql = "CALL sp_resolverSolicitud(?, ?, ?, ?)";
            jdbcTemplate.update(sql, id, estado, idRevisor, motivo);
            
            return ResponseEntity.ok().body(Map.of("message", "Solicitud procesada en la BD con éxito"));
        } catch (Exception e) {
            System.err.println("ERROR EN RESOLVER SOLICITUD: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
