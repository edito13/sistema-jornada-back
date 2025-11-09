INSERT INTO faculdades (nome) VALUES
('Faculdade de Engenharias'),
('Faculdade de Ciências da Saúde'),
('Faculdade de Humanas e Ciências Sociais')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
