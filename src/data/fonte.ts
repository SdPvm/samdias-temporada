// Fonte dos dados do app.
//
// Hoje: dados de exemplo gerados no próprio aparelho (selo "Dados de exemplo" nas telas).
// Próximo passo: ligar à API da Sam Dias no Azure, que junta o dashboard de temporada e o ApresentaMe.
// O token do ApresentaMe fica no servidor, nunca dentro do iPhone. Só este arquivo muda; as telas continuam iguais.
//
// Para usar a API, defina EXPO_PUBLIC_API_TEMPORADA (endereço que devolve um DadosTemporada em JSON)
// no ambiente do build da EAS ou num arquivo .env.
import { gerarExemplo } from './exemplo';
import type { DadosTemporada } from './tipos';

const URL_API = process.env.EXPO_PUBLIC_API_TEMPORADA;

export async function carregarDados(): Promise<DadosTemporada> {
  if (URL_API) {
    const resposta = await fetch(URL_API, { headers: { Accept: 'application/json' } });
    if (!resposta.ok) {
      throw new Error(`O servidor respondeu ${resposta.status}. Tente de novo em instantes.`);
    }
    const dados = (await resposta.json()) as DadosTemporada;
    return { ...dados, atualizadoEm: dados.atualizadoEm ?? new Date().toISOString(), exemplo: false };
  }

  await new Promise((resolver) => setTimeout(resolver, 350));
  return gerarExemplo();
}
