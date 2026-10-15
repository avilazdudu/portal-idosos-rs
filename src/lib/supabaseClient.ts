import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const forceMock = (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true'

// A aplicacao roda em "modo demonstracao" (dados de exemplo + localStorage) sempre que
// nao houver credenciais reais do Supabase configuradas, ou quando VITE_USE_MOCK=true.
// Isso permite `npm run dev` funcionar imediatamente. Para usar o backend real:
// 1. Crie um projeto em https://supabase.com
// 2. Rode o script supabase/schema.sql no SQL editor do projeto
// 3. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu .env
// 4. Defina VITE_USE_MOCK=false
export const isSupabaseConfigured = Boolean(url && anonKey) && !forceMock

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
