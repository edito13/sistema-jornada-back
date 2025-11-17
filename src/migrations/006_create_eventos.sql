CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  local VARCHAR(100),
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME NOT NULL,
  vagas_totais INT NOT NULL,
  vagas_disponiveis INT NOT NULL,
  id_palestrante INT NOT NULL,
  id_faculdade INT NOT NULL,
  id_edicao INT NOT NULL,
  FOREIGN KEY (id_palestrante) REFERENCES palestrantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_faculdade) REFERENCES faculdades(id) ON DELETE CASCADE,
  FOREIGN KEY (id_edicao) REFERENCES edicoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;