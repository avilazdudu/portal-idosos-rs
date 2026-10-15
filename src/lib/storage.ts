// Camada minima de persistencia local usada pelos services quando o Supabase
// nao esta configurado (modo demonstracao). Nunca importar diretamente nos componentes.

const NAMESPACE = 'viverbem-rs'

function key(name: string) {
  return `${NAMESPACE}:${name}`
}

export function readLocal<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeLocal<T>(name: string, value: T): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value))
  } catch {
    // localStorage indisponivel (modo privado, etc). Falha silenciosa e aceitavel aqui.
  }
}

export function removeLocal(name: string): void {
  try {
    localStorage.removeItem(key(name))
  } catch {
    // ignore
  }
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
