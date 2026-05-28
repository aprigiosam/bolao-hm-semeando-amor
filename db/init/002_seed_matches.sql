INSERT INTO matches (id, phase, match_date, home_team, away_team, venue, city) VALUES
  (1, 'Grupo A', '2026-06-11', 'México', 'África do Sul', 'Estadio Azteca', 'Cidade do México'),
  (2, 'Grupo A', '2026-06-11', 'Coreia do Sul', 'Tchéquia', 'Estadio Akron', 'Zapopan'),
  (3, 'Grupo B', '2026-06-12', 'Canadá', 'Bósnia e Herzegovina', 'BMO Field', 'Toronto'),
  (4, 'Grupo D', '2026-06-12', 'Estados Unidos', 'Paraguai', 'SoFi Stadium', 'Inglewood'),
  (5, 'Grupo B', '2026-06-13', 'Catar', 'Suíça', 'Levi''s Stadium', 'Santa Clara'),
  (6, 'Grupo C', '2026-06-13', 'Brasil', 'Marrocos', 'Gillette Stadium', 'Foxborough')
ON CONFLICT (id) DO NOTHING;
