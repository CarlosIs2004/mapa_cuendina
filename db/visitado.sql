-- Agrega la columna "visitado" a lugares (false = pendiente, true = visitado).
-- Pegar en el SQL Editor de Supabase. Los puntos existentes quedan como no visitados.

alter table lugares
  add column if not exists visitado boolean not null default false;

-- Cualquiera puede cambiar SOLO el estado "visitado" (no se abre update sobre la tabla).
create or replace function marcar_visitado(p_id bigint, p_visitado boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update lugares set visitado = p_visitado where id = p_id;
$$;

revoke all on function marcar_visitado(bigint, boolean) from public;
grant execute on function marcar_visitado(bigint, boolean) to anon, authenticated;
