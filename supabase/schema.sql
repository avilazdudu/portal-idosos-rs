-- ============================================================================
-- Viver Bem RS — schema inicial do Supabase
-- Rode este script no SQL editor do seu projeto Supabase (supabase.com).
-- Depois, preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu .env
-- e defina VITE_USE_MOCK=false.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: dados públicos do usuário, 1:1 com auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  birth_date date,
  city text not null,
  state text default 'RS',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem editar o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem criar o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text
);

alter table public.categories enable row level security;

create policy "Categorias são públicas"
  on public.categories for select
  using (true);

-- ----------------------------------------------------------------------------
-- programs: catálogo de programas/serviços para idosos
-- ----------------------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  description_full text,
  objective text,
  organization text not null,
  category text not null references public.categories(slug),
  subcategory text,
  city text not null,
  region text not null,
  address text,
  phone text,
  email text,
  website_url text,
  registration_url text,
  modality text not null check (modality in ('presencial', 'online', 'hibrido')),
  age_range text not null check (age_range in ('60+', '65+', '70+', 'todas')),
  is_free text not null check (is_free in ('gratuito', 'pago', 'gratuito_ou_pago')),
  accessibility_information jsonb default '{}'::jsonb,
  schedule text,
  target_audience text,
  image_url text,
  tags text[] default '{}',
  source text,
  verification_status text not null default 'revisar' check (verification_status in ('verificado', 'revisar', 'desatualizado')),
  last_verified_at timestamptz,
  -- Situação do programa: is_active = false esconde o programa de todas as listas;
  -- availability controla os avisos "inscrições fechadas" e "temporariamente indisponível".
  is_active boolean not null default true,
  availability text not null default 'aberto' check (availability in ('aberto', 'inscricoes_fechadas', 'indisponivel')),
  availability_note text,
  availability_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Regra de verificação: um programa só pode ser "verificado" se tiver fonte oficial e data.
  constraint verificado_exige_fonte_e_data check (
    verification_status <> 'verificado'
    or (nullif(btrim(source), '') is not null and last_verified_at is not null)
  )
);

alter table public.programs enable row level security;

create policy "Programas ativos são públicos"
  on public.programs for select
  using (is_active);

-- Escrita em programs: somente administradores (ver seção "Administradores" no final deste arquivo).

-- ----------------------------------------------------------------------------
-- program_locations: locais físicos de atendimento (um programa pode ter vários)
-- Alimenta o mapa (/mapa). Um local só vira marcador quando tem coordenadas E
-- location_verified_at preenchido (alguém conferiu a posição). Nunca preencha
-- coordenadas "de cabeça" nem use o centro da cidade como se fosse o endereço.
-- ----------------------------------------------------------------------------
create table if not exists public.program_locations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text,
  address text,
  city text not null,
  state text not null default 'RS',
  postal_code text,
  latitude double precision,
  longitude double precision,
  location_source text,
  location_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coordenadas_em_par check ((latitude is null) = (longitude is null)),
  -- No RS, latitude/longitude fora desta caixa quase sempre indicam valores trocados ou digitados errado.
  constraint coordenadas_dentro_do_rs check (
    state <> 'RS'
    or latitude is null
    or (latitude between -33.75 and -27.08 and longitude between -57.65 and -49.69)
  ),
  constraint verificado_exige_coordenadas_e_fonte check (
    location_verified_at is null
    or (latitude is not null and nullif(btrim(location_source), '') is not null)
  )
);

create index if not exists program_locations_program_id_idx on public.program_locations (program_id);

alter table public.program_locations enable row level security;

create policy "Locais de programas ativos são públicos"
  on public.program_locations for select
  using (exists (select 1 from public.programs p where p.id = program_id and p.is_active));

-- (a policy de escrita para administradores fica na seção "Administradores", no final do arquivo)

-- ----------------------------------------------------------------------------
-- good_practices: conteúdos educativos
-- ----------------------------------------------------------------------------
create table if not exists public.good_practices (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('saude', 'atividade-fisica', 'alimentacao', 'saude-mental', 'seguranca-digital', 'autonomia')),
  summary text not null,
  content text not null,
  step_by_step text[],
  tips text[],
  alerts text[],
  sources text[],
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.good_practices enable row level security;

create policy "Boas práticas são publicas"
  on public.good_practices for select
  using (true);

-- ----------------------------------------------------------------------------
-- preferences: 1:1 com o usuário
-- ----------------------------------------------------------------------------
create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interests text[] default '{}',
  what_they_seek text[] default '{}',
  preferred_categories text[] default '{}',
  preferred_modality text default 'tanto_faz' check (preferred_modality in ('presencial', 'online', 'hibrido', 'tanto_faz')),
  preferred_distance text default 'qualquer' check (preferred_distance in ('5km', '10km', '25km', 'qualquer')),
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

create policy "Usuários veem as próprias preferências"
  on public.preferences for select
  using (auth.uid() = user_id);

create policy "Usuários gerenciam as próprias preferências"
  on public.preferences for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam as próprias preferências"
  on public.preferences for update
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, program_id)
);

alter table public.favorites enable row level security;

create policy "Usuários veem os próprios favoritos"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Usuários adicionam os próprios favoritos"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Usuários removem os próprios favoritos"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- categorias iniciais
-- ----------------------------------------------------------------------------
insert into public.categories (slug, name, description, icon) values
  ('esporte', 'Esporte e movimento', 'Atividades físicas adaptadas, caminhadas e modalidades esportivas.', 'Activity'),
  ('saude', 'Saúde e bem-estar', 'Consultas, prevenção, cuidados com visão, audição e medicamentos.', 'HeartPulse'),
  ('convivencia', 'Convivência e socialização', 'Grupos, encontros e atividades para fazer novos amigos.', 'Users'),
  ('educacao', 'Educação', 'Cursos, universidades abertas e formação continuada.', 'GraduationCap'),
  ('inclusao-digital', 'Inclusão digital', 'Aprender a usar celular, computador e internet com segurança.', 'Smartphone'),
  ('cultura-lazer', 'Cultura e lazer', 'Passeios, turismo, artes e entretenimento.', 'Drama'),
  ('assistencia', 'Assistência', 'Cuidado diário, apoio social e serviços de assistência.', 'HandHeart'),
  ('intergeracional', 'Intergeracional', 'Projetos que aproximam gerações diferentes.', 'UsersRound')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Administradores e verificação de programas
-- ----------------------------------------------------------------------------
-- Tabela separada de profiles de propósito: o usuário pode editar o próprio perfil,
-- e não pode ter como se promover a administrador.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;
-- Sem policies: ninguém acessa esta tabela pela API. Cadastre administradores no SQL editor:
--   insert into public.admins (user_id) values ('<uuid do usuário em auth.users>');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create policy "Admins gerenciam programas"
  on public.programs for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins gerenciam locais de programas"
  on public.program_locations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins gerenciam boas práticas"
  on public.good_practices for all
  using (public.is_admin())
  with check (public.is_admin());

-- Marca um programa como verificado: exige administrador e fonte oficial, grava a data
-- de agora e (opcionalmente) os links conferidos. Chamada pelo app via programService.marcarComoVerificado.
create or replace function public.verificar_programa(
  p_program_id uuid,
  p_fonte text,
  p_registration_url text default null,
  p_website_url text default null
)
returns public.programs
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado public.programs;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem verificar programas.' using errcode = '42501';
  end if;
  if p_fonte is null or btrim(p_fonte) = '' then
    raise exception 'Informe a fonte oficial da verificação.';
  end if;

  update public.programs
     set source = btrim(p_fonte),
         registration_url = coalesce(p_registration_url, registration_url),
         website_url = coalesce(p_website_url, website_url),
         verification_status = 'verificado',
         last_verified_at = now(),
         updated_at = now()
   where id = p_program_id
   returning * into resultado;

  if not found then
    raise exception 'Programa não encontrado.';
  end if;
  return resultado;
end;
$$;

revoke all on function public.verificar_programa(uuid, text, text, text) from public;
grant execute on function public.verificar_programa(uuid, text, text, text) to authenticated;
