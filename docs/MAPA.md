# Mapa de atividades (`/mapa`)

## Tecnologia

**Leaflet + React Leaflet + OpenStreetMap.** Escolhida porque não exige chave de API nem cobra por uso,
atende marcadores, popups, geolocalização e links para o Google Maps, e mantém o bundle pequeno
(o mapa só é carregado ao abrir `/mapa`). Dependências adicionadas: `leaflet`, `react-leaflet` (v4, para React 18) e `@types/leaflet`.
Os marcadores são `divIcon` (HTML), então não há imagens de ícone para configurar.

Atribuição do OpenStreetMap aparece no canto do mapa. Os tiles públicos do OSM servem para **uso leve**
([política](https://operations.osmfoundation.org/policies/tiles/)); com muito acesso, defina `VITE_MAP_TILE_URL`
e `VITE_MAP_TILE_ATTRIBUTION` apontando para um provedor próprio.

## Como funciona

| Peça | Arquivo |
| --- | --- |
| Página | `src/pages/MapPage.tsx` |
| Mapa, balão, lista, filtros | `src/components/ActivityMap.tsx`, `ActivityPopup.tsx`, `NearbyActivitiesList.tsx`, `MapFilters.tsx`, `LocationButton.tsx`, `DistanceSelector.tsx`, `DirectionsButton.tsx` |
| Falha do mapa | `src/components/MapErrorBoundary.tsx` (a lista continua funcionando) |
| Locais (Supabase / demonstração) | `src/services/mapService.ts` |
| Geolocalização do aparelho | `src/services/geolocationService.ts` |
| Busca de endereço (Nominatim) | `src/services/geocodingService.ts` |
| Distância (Haversine), RS, URL do Google Maps | `src/utils/geo.ts` |
| Filtros e ordenação | `src/utils/filtrosMapa.ts` |
| Município de referência | `src/data/referenciasRS.ts` |

### Regras importantes

- **Só vira marcador** um local com coordenadas válidas (dentro do RS) **e** `location_verified_at` preenchido.
  Os demais aparecem na lista, em "Locais sem posição verificada", com "Como chegar" pelo endereço.
- **Nada é inventado**: não há coordenadas aleatórias nem "centro da cidade" usado como se fosse o endereço.
  Os 10 municípios de `referenciasRS.ts` são só pontos de *referência de busca* (centros aproximados).
- **Distância** é sempre "a cerca de X km em linha reta" (estimativa), nunca por ruas.
- **Visão inicial**: o estado inteiro (RS), sem presumir Porto Alegre. A localização só é pedida ao clicar em "Usar minha localização".
- **Programas com vários locais**: cada local é uma linha em `program_locations`.
- **Programas sem local** (online, estaduais) não ganham marcador; a página informa quantos são e leva a `/programas`.

### Privacidade

- A posição do aparelho fica só na memória da página: não vai para o banco nem para logs.
- "Procurar endereço" envia o texto digitado ao Nominatim (OpenStreetMap), apenas ao clicar, no máximo 1 consulta/segundo, com cache em memória.
- "Como chegar" envia a posição de partida ao Google Maps, só quando a pessoa clica (abre em nova aba, `rel="noopener noreferrer"`). Para município escolhido na lista, a origem não é enviada.

## Cadastrar a posição de um local (passo a passo)

Hoje os 6 locais de exemplo (unidades do Sesc, com endereço e fonte) **não têm posição verificada**, então ainda não há marcadores.

1. Gere sugestões (opcional, ~1 s por endereço):
   ```bash
   npm run mapa:sugerir -- scripts/enderecos-pendentes.json sugestoes.json --email voce@exemplo.com
   ```
2. Abra o `conferirNoMapa` de cada sugestão (ou o Google Maps) e **confirme que o ponto é a porta do local**. Desconfie de itens com `provavelCentroDeCidade: true`.
3. Copie latitude e longitude (no Google Maps: clique com o botão direito no ponto e depois no número).
4. Cadastre.

**Com Supabase** (SQL editor):
```sql
insert into public.program_locations
  (program_id, name, address, city, state, latitude, longitude, location_source, location_verified_at)
values
  ('<uuid do programa>', 'Sesc Exemplo', 'Rua Exemplo, 123', 'Cidade', 'RS',
   -30.0000, -51.0000,                                  -- valores fictícios: use os conferidos
   'Endereço no site oficial; posição conferida no Google Maps em 2026-10-19', now());
```
O banco recusa coordenadas fora do RS, latitude sem longitude e "verificado" sem fonte.

Para corrigir um local existente:
```sql
update public.program_locations
   set latitude = -30.0000, longitude = -51.0000,
       location_source = 'Conferido no Google Maps em 2026-10-19',
       location_verified_at = now()
 where id = '<uuid do local>';
```
Pelo código (futura tela de administração): `mapService.definirLocalizacao(localId, { latitude, longitude, fonte })`.

**Modo demonstração**: edite `src/data/mockLocais.ts` e preencha `latitude`, `longitude`, `fonteLocalizacao` e `localizacaoVerificadaEm`.

## Já criei o banco antes do mapa?

Rode no SQL editor (uma vez):
```sql
create table if not exists public.program_locations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text, address text, city text not null, state text not null default 'RS', postal_code text,
  latitude double precision, longitude double precision,
  location_source text, location_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint coordenadas_em_par check ((latitude is null) = (longitude is null)),
  constraint coordenadas_dentro_do_rs check (
    state <> 'RS' or latitude is null
    or (latitude between -33.75 and -27.08 and longitude between -57.65 and -49.69)),
  constraint verificado_exige_coordenadas_e_fonte check (
    location_verified_at is null
    or (latitude is not null and nullif(btrim(location_source), '') is not null))
);
create index if not exists program_locations_program_id_idx on public.program_locations (program_id);
alter table public.program_locations enable row level security;

drop policy if exists "Locais de programas ativos são públicos" on public.program_locations;
create policy "Locais de programas ativos são públicos" on public.program_locations for select
  using (exists (select 1 from public.programs p where p.id = program_id and p.is_active));

drop policy if exists "Admins gerenciam locais de programas" on public.program_locations;
create policy "Admins gerenciam locais de programas" on public.program_locations for all
  using (public.is_admin()) with check (public.is_admin());
```
(Requer a seção de administradores do `schema.sql`, que define `public.is_admin()`.)

## Variáveis de ambiente (todas opcionais)

| Variável | Para quê |
| --- | --- |
| `VITE_MAP_TILE_URL` / `VITE_MAP_TILE_ATTRIBUTION` | Outro provedor de tiles |
| `VITE_NOMINATIM_EMAIL` | E-mail de contato enviado ao Nominatim na busca de endereços |

Nenhuma chave de API é necessária.

## Limitações conhecidas

- **Agrupamento (clustering) de marcadores não foi incluído**: com poucos locais verificados não é necessário. Quando houver dezenas de locais na mesma região, adicione `react-leaflet-cluster`.
- O mapa não foi testado em navegador neste ambiente (sem acesso à rede para instalar dependências): faça o primeiro teste visual com `npm install && npm run dev`.
- Rotas de transporte público dependem da cobertura do Google Maps; a plataforma não garante disponibilidade.
