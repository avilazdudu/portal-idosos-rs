import type { LocalAtendimento } from '@/types'

// Locais de atendimento do modo demonstração.
//
// Os endereços abaixo foram lidos em notícias oficiais do Sesc RS sobre inscrições no
// Programa Maturidade Ativa (a fonte de cada um está em fonteLocalizacao). Não há COORDENADAS
// verificadas, então estes locais aparecem na lista e permitem "Como chegar" pelo endereço,
// mas NÃO aparecem como marcador no mapa até alguém conferir a posição (veja docs/MAPA.md).
//
// Os endereços vêm de notícias dos anos de 2025 e 2026: confirme-os antes de publicar.

const PROGRAMA = 'prog-sesc-maturidade-ativa'
const SESC = 'https://www.sesc-rs.com.br/noticias/'

function local(dados: Omit<LocalAtendimento, 'programaId' | 'estado'>): LocalAtendimento {
  return { programaId: PROGRAMA, estado: 'RS', ...dados }
}

export const mockLocais: LocalAtendimento[] = [
  local({
    id: 'loc-sesc-taquara',
    nome: 'Sesc Taquara',
    endereco: 'Rua Júlio de Castilhos, 2843',
    municipio: 'Taquara',
    fonteLocalizacao: `Endereço: ${SESC}sesc-taquara-abre-inscricoes-para-programa-maturidade-ativa/ (coordenadas não verificadas)`,
  }),
  local({
    id: 'loc-sesc-sao-leopoldo',
    nome: 'Sesc São Leopoldo',
    endereco: 'Rua Marquês do Herval, 827',
    municipio: 'São Leopoldo',
    fonteLocalizacao: `Endereço: ${SESC}programa-sesc-maturidade-ativa-abre-inscricoes-em-sao-leopoldo-para-pessoas-idosas-com-mais-de-60-anos/ (coordenadas não verificadas)`,
  }),
  local({
    id: 'loc-sesc-camaqua',
    nome: 'Sesc Camaquã',
    endereco: 'Rua Marcírio Dias Longaray, 01',
    municipio: 'Camaquã',
    fonteLocalizacao: `Endereço: ${SESC}inscricoes-abertas-para-o-programa-maturidade-ativa-do-sesc-camaqua/ (coordenadas não verificadas)`,
  }),
  local({
    id: 'loc-sesc-vacaria',
    nome: 'Sesc Vacaria',
    endereco: 'Av. Moreira Paz, 264',
    municipio: 'Vacaria',
    fonteLocalizacao: `Endereço: ${SESC}sesc-vacaria-abre-inscricoes-para-o-projeto-maturidade-ativa-em-2026/ (coordenadas não verificadas)`,
  }),
  local({
    id: 'loc-sesc-protasio-alves',
    nome: 'Sesc Protásio Alves',
    endereco: 'Av. Protásio Alves, 6220',
    municipio: 'Porto Alegre',
    fonteLocalizacao: `Endereço: ${SESC}programa-maturidade-ativa-tem-inscricoes-abertas-em-porto-alegre/ (coordenadas não verificadas)`,
  }),
  local({
    id: 'loc-sesc-senac-sobradinho',
    nome: 'Unidade Sesc/Senac Sobradinho',
    endereco: 'Rua Lino Lazzari, 91',
    municipio: 'Sobradinho',
    fonteLocalizacao: `Endereço: ${SESC}sesc-maturidade-ativa-de-sobradinho-esta-com-inscricoes-abertas/ (coordenadas não verificadas)`,
  }),
]
