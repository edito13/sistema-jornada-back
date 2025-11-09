INSERT INTO users (nome, email, senha, role)
VALUES ('Administrador', 'admin@sistema.com', '$2b$10$0CwQhbjGqtnUxDYvK2lf0.0Ayz6M5yx1B6fKyzrk6bM1H4D9pbni.', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);
