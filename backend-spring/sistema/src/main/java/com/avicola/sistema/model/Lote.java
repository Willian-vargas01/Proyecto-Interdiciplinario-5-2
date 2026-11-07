package com.avicola.sistema.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "lote")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    @JsonProperty("id_lote") // <--- Empareja con l.id_lote en tu React
    private Integer idLote;

    @Column(name = "codigo_lote", nullable = false, unique = true, length = 50)
    @JsonProperty("codigo_lote") // <--- Empareja con l.codigo_lote
    private String codigoLote;

    @Column(name = "fecha_ingreso", nullable = false)
    @JsonProperty("fecha_ingreso") // <--- Empareja con l.fecha_ingreso
    private LocalDate fechaIngreso = LocalDate.now(); // Se asigna la fecha de hoy automáticamente

    @Column(name = "cantidad_inicial", nullable = false)
    @JsonProperty("cantidad_inicial") // <--- Empareja con l.cantidad_inicial
    private Integer cantidadInicial;

    @Column(name = "cantidad_actual", nullable = false)
    @JsonProperty("cantidad_actual") // <--- Empareja con l.cantidad_actual
    private Integer cantidadActual;

    @Column(name = "estado", nullable = false, length = 30)
    @JsonProperty("estado") // <--- Empareja con l.estado
    private String estado = "EN_CRECIMIENTO";

    // Adentro de tu clase Lote.java, agregá esta variable:
    @Column(name = "precio_unitario")
    private Double precioUnitario;

}
