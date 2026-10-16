-- Tabla de lugares del mapa (PostgreSQL / Supabase).
-- Pegar en el SQL Editor de Supabase. Los valores de "tipo" coinciden con los
-- ids de CATEGORY_CATALOG (src/features/points/domain/Category.ts).

create table if not exists lugares (
  id         bigint generated always as identity primary key,
  nombre     text not null check (char_length(nombre) between 1 and 80),
  tipo       text not null check (tipo in ('robos', 'licor', 'bailes', 'violencia', 'camaras', 'alarmas', 'referencia')),
  lat        double precision not null check (lat between -90 and 90),
  lng        double precision not null check (lng between -180 and 180),
  link_maps  text not null,
  created_at timestamptz not null default now()
);

-- Lectura pública (el mapa es de consulta abierta); escritura solo con el rol del servidor.
alter table lugares enable row level security;
create policy "lectura publica" on lugares for select using (true);

insert into lugares (nombre, tipo, lat, lng, link_maps) values
  ('Asalto / robo 1', 'robos', -0.385152, -78.510945,
   'https://www.google.com/maps?q=-0.385152,-78.510945'),
  ('Asalto / robo 2', 'robos', -0.38690138030862953, -78.50744694998298,
   'https://www.google.com/maps?q=-0.38690138030862953,-78.50744694998298'),
  ('Asalto / robo 3', 'robos', -0.3854215218788336, -78.50829869655665,
   'https://www.google.com/maps?q=-0.3854215218788336,-78.50829869655665');
