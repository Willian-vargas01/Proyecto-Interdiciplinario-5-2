package com.avicola.sistema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.avicola.sistema.model.Lote;

public interface LoteRepository extends JpaRepository<Lote, Integer> {
}
