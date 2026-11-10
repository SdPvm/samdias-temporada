// Dados de exemplo, gerados no próprio aparelho. Nenhum dado real da Sam Dias.
// Os números ficam iguais durante o mês (mesma semente), para a tela não mudar a cada atualização.
import {
  deDia,
  diasEntre,
  hoje,
  mesDe,
  primeiroDia,
  somarDias,
  somarMeses,
  type DiaISO,
} from '../utils/datas';
import type { Canal, DadosTemporada, Imovel, Reserva } from './tipos';

const IMOVEIS: Imovel[] = [
  { id: 'im-01', nome: 'Studio Brás 01', bairro: 'Brás', quartos: 1, diariaAtual: 189 },
  { id: 'im-02', nome: 'Apto Vila Maria 02', bairro: 'Vila Maria', quartos: 2, diariaAtual: 259 },
  { id: 'im-03', nome: 'Loft Pari 03', bairro: 'Pari', quartos: 1, diariaAtual: 209 },
  { id: 'im-04', nome: 'Studio Belém 04', bairro: 'Belém', quartos: 1, diariaAtual: 179 },
  { id: 'im-05', nome: 'Apto Tatuapé 05', bairro: 'Tatuapé', quartos: 2, diariaAtual: 289 },
  { id: 'im-06', nome: 'Kitnet Canindé 06', bairro: 'Canindé', quartos: 1, diariaAtual: 149 },
];

/** Ocupação média que cada imóvel de exemplo tende a ter. */
const PROCURA: Record<string, number> = {
  'im-01': 0.78,
  'im-02': 0.68,
  'im-03': 0.6,
  'im-04': 0.52,
  'im-05': 0.86,
  'im-06': 0.38,
};

const NOMES = [
  'Mariana',
  'Carlos',
  'Fernanda',
  'Rafael',
  'Juliana',
  'Bruno',
  'Patrícia',
  'Diego',
  'Camila',
  'Thiago',
  'Larissa',
  'Gustavo',
  'Aline',
  'Felipe',
  'Renata',
  'Lucas',
];
const INICIAIS = 'ABCDEFGLMNOPRST';
const NOITES_MEDIAS = 4;

function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gerador pseudoaleatório (mulberry32): mesma semente, mesma sequência. */
function sorteador(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gerarExemplo(referencia: DiaISO = hoje()): DadosTemporada {
  const mesRef = mesDe(referencia);
  const inicio = primeiroDia(somarMeses(mesRef, -4));
  const fim = primeiroDia(somarMeses(mesRef, 4));
  const reservas: Reserva[] = [];

  for (const imovel of IMOVEIS) {
    const sorteio = sorteador(semente(`${imovel.id}|${inicio}`));
    const procura = PROCURA[imovel.id] ?? 0.6;
    // Chance de uma reserva começar num dia livre, para chegar perto da ocupação desejada.
    const chanceBase = 1 / (1 + (NOITES_MEDIAS * (1 - procura)) / procura);
    let dia = inicio;
    let numero = 0;

    while (dia < fim) {
      const semana = deDia(dia).getDay();
      const fimDeSemana = semana === 4 || semana === 5; // entradas de quinta e sexta
      // Quanto mais longe no futuro, menos reservas já feitas.
      const distancia = Math.max(0, diasEntre(referencia, dia));
      const antecedencia = Math.max(0.25, 1 - distancia / 90);
      const chance = Math.min(0.95, chanceBase * (fimDeSemana ? 1.3 : 0.88) * antecedencia);

      if (sorteio() < chance) {
        const noites = sorteio() < 0.1 ? 7 + Math.floor(sorteio() * 4) : 2 + Math.floor(sorteio() * 4);
        const checkout = somarDias(dia, noites);
        const canal: Canal = sorteio() < 0.6 ? 'Airbnb' : sorteio() < 0.6 ? 'Booking' : 'Direto';
        const nome = NOMES[Math.floor(sorteio() * NOMES.length)];
        const inicial = INICIAIS[Math.floor(sorteio() * INICIAIS.length)];
        numero += 1;
        reservas.push({
          id: `${imovel.id}-${numero}`,
          imovelId: imovel.id,
          hospede: `${nome} ${inicial}.`,
          checkin: dia,
          checkout,
          valorTotal: Math.round(noites * imovel.diariaAtual * (0.9 + sorteio() * 0.3)),
          canal,
        });
        dia = checkout;
      } else {
        dia = somarDias(dia, 1);
      }
    }
  }

  reservas.sort((a, b) => (a.checkin < b.checkin ? -1 : a.checkin > b.checkin ? 1 : 0));
  return { imoveis: IMOVEIS, reservas, atualizadoEm: new Date().toISOString(), exemplo: true };
}
