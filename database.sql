CREATE TABLE IF NOT EXISTS flores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  temporada VARCHAR(50) NOT NULL,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  descripcion TEXT NOT NULL DEFAULT '',
  UNIQUE (nombre)
);

INSERT INTO flores (nombre, color, temporada, precio, stock, descripcion) VALUES
('Rosa', 'Rojo', 'Primavera', 25.00, 40, 'Clásica y aromática'),
('Tulipán', 'Amarillo', 'Primavera', 32.50, 25, 'Flor elegante de tallo largo'),
('Girasol', 'Amarillo', 'Verano', 28.00, 30, 'Flor grande que sigue la luz'),
('Lirio', 'Blanco', 'Verano', 45.00, 18, 'Fragante y ornamental'),
('Orquídea', 'Morado', 'Todo el año', 120.00, 12, 'Planta tropical de larga floración'),
('Clavel', 'Rosa', 'Primavera', 20.00, 50, 'Resistente y colorido'),
('Margarita', 'Blanco', 'Primavera', 18.00, 35, 'Sencilla con centro amarillo'),
('Hortensia', 'Azul', 'Verano', 65.00, 15, 'Ramillete de flores pequeñas'),
('Dalia', 'Naranja', 'Otoño', 38.00, 22, 'Flor mexicana de pétalos abundantes'),
('Gardenia', 'Blanco', 'Verano', 55.00, 10, 'Flor blanca de aroma intenso'),
('Lavanda', 'Morado', 'Verano', 30.00, 28, 'Aromática y apreciada por sus flores'),
('Peonía', 'Rosa', 'Primavera', 95.00, 8, 'Flor ornamental de pétalos suaves')
ON CONFLICT (nombre) DO NOTHING;
