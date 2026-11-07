package com.avicola.sistema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.avicola.sistema.model.Inventario;

public interface InventarioRepository extends JpaRepository<Inventario, Integer> {
}
