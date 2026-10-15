// Remove acentos e padroniza caixa. Usado em buscas e comparações para que
// "volei" encontre "Vôlei" e "saude" encontre "Saúde".
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
