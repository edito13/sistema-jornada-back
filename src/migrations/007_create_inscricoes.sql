CREATE TABLE IF NOT EXISTS inscricoes (
  id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
  id_participante INT NOT NULL,
  id_evento INT NOT NULL,
  id_edicao INT NOT NULL,
  data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
  presenca BOOLEAN DEFAULT FALSE,
  UNIQUE (id_participante, id_evento, id_edicao),
  FOREIGN KEY (id_participante) REFERENCES participantes(id_participante) ON DELETE CASCADE,
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_edicao) REFERENCES edicoes(id_edicao) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;