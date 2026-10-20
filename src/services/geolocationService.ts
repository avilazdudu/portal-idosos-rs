import type { Coordenadas } from '@/types'

// Geolocalização do aparelho. As coordenadas ficam somente na memória da página:
// nunca são enviadas ao nosso banco de dados nem gravadas em logs.

export type CodigoErroGeolocalizacao = 'nao_suportado' | 'negada' | 'indisponivel' | 'tempo_esgotado'

export class ErroGeolocalizacao extends Error {
  codigo: CodigoErroGeolocalizacao

  constructor(codigo: CodigoErroGeolocalizacao, mensagem: string) {
    super(mensagem)
    this.name = 'ErroGeolocalizacao'
    this.codigo = codigo
  }
}

export interface PosicaoUsuario extends Coordenadas {
  precisaoMetros?: number
}

const MENSAGENS: Record<CodigoErroGeolocalizacao, string> = {
  nao_suportado:
    'Este aparelho ou navegador não permite descobrir a localização. Escolha um município na lista ou pesquise um endereço.',
  negada:
    'Você não permitiu o acesso à localização, e tudo bem. Escolha um município na lista ou pesquise um endereço. Se quiser permitir depois, toque no cadeado ao lado do endereço do site e ative a localização.',
  indisponivel:
    'Não conseguimos descobrir onde você está agora. Verifique se o GPS ou a internet estão ligados, ou escolha um município na lista.',
  tempo_esgotado:
    'A localização demorou demais para responder. Tente de novo, ou escolha um município na lista.',
}

export function obterPosicaoAtual(): Promise<PosicaoUsuario> {
  return new Promise((resolver, rejeitar) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      rejeitar(new ErroGeolocalizacao('nao_suportado', MENSAGENS.nao_suportado))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) =>
        resolver({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
          precisaoMetros: posicao.coords.accuracy,
        }),
      (erro) => {
        // 1 = permissão negada, 2 = posição indisponível, 3 = tempo esgotado
        const codigo: CodigoErroGeolocalizacao =
          erro.code === 1 ? 'negada' : erro.code === 3 ? 'tempo_esgotado' : 'indisponivel'
        rejeitar(new ErroGeolocalizacao(codigo, MENSAGENS[codigo]))
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    )
  })
}
