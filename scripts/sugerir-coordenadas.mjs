#!/usr/bin/env node
// Sugere coordenadas para uma lista de endereços, para REVISÃO HUMANA.
// Nada é gravado no banco: o resultado é um arquivo JSON com sugestões e um link do
// OpenStreetMap para você conferir cada ponto antes de cadastrar (veja docs/MAPA.md).
//
// Uso:
//   node scripts/sugerir-coordenadas.mjs scripts/enderecos-pendentes.json sugestoes.json --email voce@exemplo.com
//
// Respeita a política do Nominatim (https://operations.osmfoundation.org/policies/nominatim/):
// no máximo 1 consulta por segundo, User-Agent identificado com seu e-mail e sem repetir consultas.
// Use para poucos endereços; para listas grandes, contrate um serviço de geocodificação.

import { readFileSync, writeFileSync } from 'node:fs'

const argumentos = process.argv.slice(2)
const posicionais = argumentos.filter((a, i) => !a.startsWith('--') && argumentos[i - 1] !== '--email')
const indiceEmail = argumentos.indexOf('--email')
const email = indiceEmail >= 0 ? argumentos[indiceEmail + 1] : undefined
const [arquivoEntrada, arquivoSaida] = posicionais

if (!arquivoEntrada || !arquivoSaida || !email) {
  console.error('Uso: node scripts/sugerir-coordenadas.mjs <entrada.json> <saida.json> --email <seu-email>')
  process.exit(1)
}

const LIMITES_RS = { sul: -33.75, norte: -27.08, oeste: -57.65, leste: -49.69 }
const TIPOS_GENERICOS = ['city', 'town', 'village', 'municipality', 'suburb', 'neighbourhood', 'state', 'county']
const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

const itens = JSON.parse(readFileSync(arquivoEntrada, 'utf8'))
const resultados = []

for (const item of itens) {
  const consulta = [item.endereco, item.municipio, 'Rio Grande do Sul', 'Brasil'].filter(Boolean).join(', ')
  const parametros = new URLSearchParams({
    q: consulta,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'br',
    'accept-language': 'pt-BR',
    viewbox: `${LIMITES_RS.oeste},${LIMITES_RS.norte},${LIMITES_RS.leste},${LIMITES_RS.sul}`,
    bounded: '1',
    email,
  })

  try {
    const resposta = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`, {
      headers: { 'User-Agent': `viver-bem-rs-geocodificacao/0.1 (${email})`, Accept: 'application/json' },
    })
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    const [melhor] = await resposta.json()

    if (!melhor) {
      resultados.push({ ...item, sugestao: null, observacao: 'Nada encontrado. Procure o ponto manualmente no mapa.' })
    } else {
      const latitude = Number(melhor.lat)
      const longitude = Number(melhor.lon)
      resultados.push({
        ...item,
        sugestao: {
          latitude,
          longitude,
          descricaoEncontrada: melhor.display_name,
          tipo: melhor.addresstype ?? melhor.type,
          conferirNoMapa: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
        },
        provavelCentroDeCidade: TIPOS_GENERICOS.includes(melhor.addresstype ?? melhor.type),
        observacao:
          'REVISAR: abra o link, confirme que o ponto é mesmo o local de atendimento e só então cadastre.',
      })
    }
  } catch (erro) {
    resultados.push({ ...item, sugestao: null, observacao: `Falha na consulta: ${erro.message}` })
  }

  console.log(`${resultados.length}/${itens.length} — ${item.nome ?? item.endereco}`)
  await pausa(1100)
}

writeFileSync(arquivoSaida, JSON.stringify(resultados, null, 2) + '\n', 'utf8')
console.log(`Pronto. Revise ${arquivoSaida} antes de cadastrar qualquer coordenada.`)
