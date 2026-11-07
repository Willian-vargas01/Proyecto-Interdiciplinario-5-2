package com.avicola.sistema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.avicola.sistema.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Integer> {
}
