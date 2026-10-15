# Desativar um programa, marcar como indisponível ou com inscrições fechadas

Cada programa tem dois controles independentes:

| Quero... | Campo | O que o usuário vê |
| --- | --- | --- |
| **Esconder** o programa de todo o site | `is_active = false` | Some das listas, da busca, das recomendações e dos favoritos. A página direta mostra "Programa não encontrado". |
| **Avisar** que as inscrições fecharam | `availability = 'inscricoes_fechadas'` | Programa visível com o selo "Inscrições fechadas", sem botão de inscrição, com o seu aviso e a previsão de reabertura |
| **Avisar** que está fora do ar por um tempo | `availability = 'indisponivel'` | Selo "Temporariamente indisponível", sem botão de inscrição, com aviso e previsão de retorno |
| Voltar ao normal | `availability = 'aberto'` | Sem aviso, botão de inscrição de volta |

Campos opcionais: `availability_note` (texto de até 300 caracteres exibido ao usuário) e
`availability_until` (data prevista, `AAAA-MM-DD`). Se a data passar, o site **não reabre sozinho**:
passa a dizer "A data prevista já passou. Confirme a situação com a instituição."

> Prefira `is_active = false` a **excluir** a linha. Excluir apaga também os favoritos
> dos usuários (`on delete cascade`) e o histórico de verificação. Desativado, o programa pode voltar depois.

## Com Supabase (SQL editor)

```sql
-- Inscrições fechadas, com previsão de reabertura
update public.programs
   set availability = 'inscricoes_fechadas',
       availability_note = 'Novas turmas apenas no próximo semestre.',
       availability_until = '2027-03-01'
 where slug = 'sesc-maturidade-ativa';

-- Temporariamente indisponível
update public.programs
   set availability = 'indisponivel',
       availability_note = 'Atendimento suspenso para reforma do local.'
 where slug = 'centro-dia-do-idoso';

-- Voltar ao normal (limpe também o aviso e a data)
update public.programs
   set availability = 'aberto', availability_note = null, availability_until = null
 where slug = 'sesc-maturidade-ativa';

-- Desativar (esconder) e reativar
update public.programs set is_active = false where slug = 'sanii';
update public.programs set is_active = true  where slug = 'sanii';
```

Programas desativados continuam visíveis para administradores (tabela `admins`).

## Já criei o banco antes desta versão?

Rode uma vez no SQL editor:

```sql
alter table public.programs
  add column if not exists is_active boolean not null default true,
  add column if not exists availability text not null default 'aberto'
    check (availability in ('aberto', 'inscricoes_fechadas', 'indisponivel')),
  add column if not exists availability_note text,
  add column if not exists availability_until date;

drop policy if exists "Programas são públicos" on public.programs;
create policy "Programas ativos são públicos"
  on public.programs for select
  using (is_active);
```

## Pelo código (futura tela de administração)

```ts
await programService.alterarSituacao(programa.id, {
  situacao: 'inscricoes_fechadas',
  observacao: 'Novas turmas apenas no próximo semestre.',
  ate: '2027-03-01',
})

await programService.alterarSituacao(programa.id, { ativo: false }) // esconder
const todos = await programService.listarTodos()                    // inclui os desativados
```

## Modo demonstração (sem Supabase)

Edite o programa em `src/data/mockPrograms.ts`:

```ts
situacao: 'inscricoes_fechadas',
situacaoObservacao: 'Novas turmas apenas no próximo semestre.',
situacaoAte: '2027-03-01',
// ou, para esconder:
ativo: false,
```
