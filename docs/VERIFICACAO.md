# Como verificar (validar) um programa

O selo que o usuário vê em cada programa (🟢 / 🟡 / 🔴) é **calculado** por
`src/utils/verification.ts` a partir de três dados do programa. Assim, uma informação
verificada "envelhece" sozinha e nunca fica verde para sempre.

| Selo | Quando aparece |
| --- | --- |
| 🟢 Verificado recentemente | Tem fonte oficial, está marcado como `verificado` e a última verificação foi há **90 dias ou menos** |
| 🟡 Verificação necessária | Falta fonte oficial ou data; ou ainda não foi marcado como verificado; ou a verificação tem de **91 a 180 dias** |
| 🔴 Informação desatualizada | Foi marcado como `desatualizado` por um administrador (ex.: link quebrado), ou a verificação tem **mais de 180 dias** |

Os limites ficam em `DIAS_VERIFICACAO_VALIDA` (90) e `DIAS_LIMITE_DESATUALIZADO` (180).
Cada selo mostra também o **motivo** em linguagem simples (na página de detalhes e como dica no card).

## Checklist de quem verifica

1. Abra o site **oficial** da instituição (não um blog nem um agregador).
2. Confirme que o programa ainda existe e que o público-alvo continua sendo pessoas idosas.
3. Copie o **link de inscrição** direto da página oficial e teste se ele abre.
4. Confira telefone, e-mail, endereço e horários. Se não estiverem publicados, deixe o campo vazio
   (a plataforma mostra "Informação não cadastrada"). **Nunca preencha de memória.**
5. Anote a **fonte**: o nome do órgão e o endereço da página consultada.
6. Marque como verificado (abaixo). A data é registrada automaticamente.

## Exemplo: verificar um programa

Os dados abaixo são **fictícios**, apenas para mostrar o formato. Substitua pelo que você conferiu no site oficial.

### Modo demonstração (`src/data/mockPrograms.ts`)

```ts
{
  // ...demais campos do programa
  registrationUrl: 'https://exemplo.gov.br/inscricao',                    // link conferido e testado
  fonteOficial: 'Prefeitura (exemplo) — https://exemplo.gov.br/programa', // quem publicou e onde
  statusVerificacao: 'verificado',
  ultimaVerificacaoEm: '2026-10-14',                                      // data em que você conferiu
}
```

Resultado: 🟢 por 90 dias; depois 🟡; depois de 180 dias, 🔴.

### Com Supabase (SQL editor)

Pré-requisito (uma vez): cadastre-se como administrador.

```sql
insert into public.admins (user_id) values ('<seu uuid em auth.users>');
```

Para verificar um programa pelo SQL editor, o que atualiza fonte, status e data juntos:

```sql
update public.programs
   set source = 'Prefeitura (exemplo) — https://exemplo.gov.br/programa',
       registration_url = 'https://exemplo.gov.br/inscricao',
       verification_status = 'verificado',
       last_verified_at = now()
 where slug = 'programa-visao-60-porto-alegre';
```

O banco recusa `verification_status = 'verificado'` sem fonte e sem data
(constraint `verificado_exige_fonte_e_data`).

### Pelo código (para uma futura tela de administração)

```ts
await programService.marcarComoVerificado(programa.id, {
  fonteOficial: 'Prefeitura (exemplo) — https://exemplo.gov.br/programa',
  registrationUrl: 'https://exemplo.gov.br/inscricao',
})
```

Isso valida os dados (fonte obrigatória, links `http(s)` válidos) e chama a função
`verificar_programa` do banco, que confere se o usuário é administrador e grava a data de agora.

## Marcar como desatualizado

Se o link quebrou ou o programa mudou, não espere os 180 dias:

```sql
update public.programs set verification_status = 'desatualizado' where slug = '...';
```
