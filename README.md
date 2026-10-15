# Viver Bem RS

Hub de integração para idosos: programas de esporte, saúde, assistência, educação,
inclusão digital e convivência social no Rio Grande do Sul, reunidos em um só lugar.
A plataforma centraliza e facilita o acesso. Ela não substitui os canais oficiais
de inscrição das instituições responsáveis.

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + React Router + Supabase + lucide-react.
Toda comunicação com o backend fica isolada em `src/services`.

## Rodando o projeto

```bash
npm install
npm run dev
```

Por padrão a aplicação roda em **modo demonstração**: os dados de exemplo (13 programas
e 7 conteúdos de boas práticas) ficam em `src/data`, e cadastro, login, favoritos e preferências
são guardados no `localStorage` do navegador. Isso permite testar o fluxo completo sem
nenhuma configuração.

## Ligando ao Supabase real

1. Crie um projeto em https://supabase.com.
2. Abra o SQL editor do projeto e rode o conteúdo de `supabase/schema.sql`
   (cria as tabelas `profiles`, `programs`, `categories`, `good_practices`,
   `preferences`, `favorites` e `admins`, todas com Row Level Security).
3. Copie `.env.example` para `.env` e preencha:
   ```
   VITE_USE_MOCK=false
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Popule a tabela `programs` com os programas reais. Nenhum dado de contato foi
   inventado nos dados de exemplo, então um administrador precisa preencher links,
   endereços e telefones a partir das fontes oficiais.
5. `npm run dev` novamente: os services detectam as credenciais e passam a usar
   o Supabase automaticamente.

## Verificação dos programas

O selo 🟢 / 🟡 / 🔴 de cada programa é calculado a partir da fonte oficial, da data da
última verificação e do status. Veja as regras, o checklist e exemplos em
[`docs/VERIFICACAO.md`](docs/VERIFICACAO.md).

## Situação dos programas

Para desativar um programa ou avisar que está indisponível ou com inscrições fechadas, veja
[`docs/SITUACAO.md`](docs/SITUACAO.md).

## Estrutura

```
src/
  components/   componentes reutilizáveis de UI
  pages/        uma página por rota
  services/     única camada que fala com o Supabase (ou com o modo demonstração)
  contexts/     autenticação e preferências de acessibilidade
  data/         dados de exemplo (programas e boas práticas)
  utils/        formatação, busca sem acentos, regras de verificação
  types/        tipos compartilhados, espelham supabase/schema.sql
supabase/
  schema.sql    schema completo com RLS, administradores e função de verificação
docs/
  VERIFICACAO.md
  SITUACAO.md
```

## O que já funciona

- Home com ações rápidas, categorias, destaques e recomendações
- `/programas` com busca (ignora acentos) e filtros (categoria, região, faixa etária,
  modalidade, gratuidade, acessibilidade) e página de detalhes
- `/boas-praticas` com artigos completos (passo a passo, dicas, alertas, fontes)
- Cadastro, login, preferências, favoritos e "minha conta"
- Recomendações por regras a partir das preferências (sem IA no MVP)
- Controles de acessibilidade globais: tamanho de texto, alto contraste e redução de animações
- Estados de carregamento, vazio e erro em toda a aplicação
- Selo de verificação calculado, com motivo explicado ao usuário

## Próximos passos

- Painel administrativo (a arquitetura em `services/` e o schema já estão prontos; falta a tela)
- Geolocalização e raio de distância real (hoje o filtro de região é por lista)
- Popular `programs` e `good_practices` no Supabase com conteúdo revisado
