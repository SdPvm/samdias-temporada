import {
  diasDoMes,
  diasEntre,
  primeiroDia,
  somarDias,
  somarMeses,
  type DiaISO,
  type Mes,
} from '../utils/datas';
import type { DadosTemporada, Imovel, Reserva } from './tipos';

export function ocupadoNoDia(reserva: Reserva, dia: DiaISO): boolean {
  return reserva.checkin <= dia && dia < reserva.checkout;
}

function noitesNoPeriodo(reserva: Reserva, inicio: DiaISO, fim: DiaISO): number {
  const de = reserva.checkin > inicio ? reserva.checkin : inicio;
  const ate = reserva.checkout < fim ? reserva.checkout : fim;
  return de < ate ? diasEntre(de, ate) : 0;
}

function valorPorNoite(reserva: Reserva): number {
  const noites = diasEntre(reserva.checkin, reserva.checkout);
  return noites > 0 ? reserva.valorTotal / noites : 0;
}

// ---------- Ocupação do mês ----------

export type OcupacaoDia = { dia: DiaISO; ocupados: number; total: number; taxa: number };

export type ResumoMes = {
  /** Noites ocupadas ÷ noites disponíveis. */
  ocupacao: number;
  /** Receita das noites que caem no mês. */
  receita: number;
  /** Receita ÷ noites ocupadas. */
  diariaMedia: number;
  /** Receita ÷ noites disponíveis. */
  revpar: number;
  noitesOcupadas: number;
  noitesDisponiveis: number;
  porDia: OcupacaoDia[];
};

export function resumoDoMes(dados: DadosTemporada, mes: Mes): ResumoMes {
  const inicio = primeiroDia(mes);
  const fim = primeiroDia(somarMeses(mes, 1));
  const dias = diasDoMes(mes);
  const total = dados.imoveis.length;

  let noitesOcupadas = 0;
  let receita = 0;
  for (const reserva of dados.reservas) {
    const noites = noitesNoPeriodo(reserva, inicio, fim);
    if (noites > 0) {
      noitesOcupadas += noites;
      receita += noites * valorPorNoite(reserva);
    }
  }

  const porDia = dias.map((dia) => {
    const ocupados = new Set(
      dados.reservas.filter((r) => ocupadoNoDia(r, dia)).map((r) => r.imovelId),
    ).size;
    return { dia, ocupados, total, taxa: total > 0 ? ocupados / total : 0 };
  });

  const noitesDisponiveis = total * dias.length;
  return {
    ocupacao: noitesDisponiveis > 0 ? noitesOcupadas / noitesDisponiveis : 0,
    receita,
    diariaMedia: noitesOcupadas > 0 ? receita / noitesOcupadas : 0,
    revpar: noitesDisponiveis > 0 ? receita / noitesDisponiveis : 0,
    noitesOcupadas,
    noitesDisponiveis,
    porDia,
  };
}

// ---------- Próximos check-ins ----------

export type ProximoCheckin = { reserva: Reserva; imovel: Imovel; noites: number };

export function proximosCheckins(
  dados: DadosTemporada,
  aPartirDe: DiaISO,
  limite = 6,
): ProximoCheckin[] {
  const porId = new Map(dados.imoveis.map((i) => [i.id, i]));
  return dados.reservas
    .filter((r) => r.checkin >= aPartirDe && porId.has(r.imovelId))
    .sort((a, b) => (a.checkin < b.checkin ? -1 : a.checkin > b.checkin ? 1 : 0))
    .slice(0, limite)
    .map((reserva) => ({
      reserva,
      imovel: porId.get(reserva.imovelId) as Imovel,
      noites: diasEntre(reserva.checkin, reserva.checkout),
    }));
}

// ---------- Diárias: sugestão de ajuste ----------

export type Ajuste = { percentual: number; rotulo: string };

/**
 * Regra da sugestão de diária, pela ocupação dos próximos 14 dias:
 * 80% ou mais: subir 10% · de 65% a 80%: subir 5% · de 40% a 65%: manter · abaixo de 40%: baixar 10%.
 */
export function sugestaoDeAjuste(ocupacao: number): Ajuste {
  if (ocupacao >= 0.8) return { percentual: 0.1, rotulo: 'Subir 10%' };
  if (ocupacao >= 0.65) return { percentual: 0.05, rotulo: 'Subir 5%' };
  if (ocupacao >= 0.4) return { percentual: 0, rotulo: 'Manter' };
  return { percentual: -0.1, rotulo: 'Baixar 10%' };
}

export type DiaDoCalendario = { dia: DiaISO; ocupado: boolean };

export type DiariaDoImovel = {
  imovel: Imovel;
  dias: DiaDoCalendario[];
  ocupacao: number;
  ajuste: Ajuste;
  precoSugerido: number;
};

export function diariasProximosDias(
  dados: DadosTemporada,
  aPartirDe: DiaISO,
  quantidade = 14,
): DiariaDoImovel[] {
  const dias = Array.from({ length: quantidade }, (_, i) => somarDias(aPartirDe, i));
  return dados.imoveis.map((imovel) => {
    const reservas = dados.reservas.filter((r) => r.imovelId === imovel.id);
    const calendario = dias.map((dia) => ({
      dia,
      ocupado: reservas.some((r) => ocupadoNoDia(r, dia)),
    }));
    const ocupacao = calendario.filter((d) => d.ocupado).length / quantidade;
    const ajuste = sugestaoDeAjuste(ocupacao);
    return {
      imovel,
      dias: calendario,
      ocupacao,
      ajuste,
      precoSugerido: Math.round(imovel.diariaAtual * (1 + ajuste.percentual)),
    };
  });
}

// ---------- Comparativo entre imóveis ----------

export type Ordem = 'receita' | 'ocupacao' | 'diaria';

export type LinhaComparativo = {
  imovel: Imovel;
  receita: number;
  ocupacao: number;
  diariaMedia: number;
  noites: number;
};

export function comparativo(dados: DadosTemporada, mes: Mes, ordem: Ordem): LinhaComparativo[] {
  const inicio = primeiroDia(mes);
  const fim = primeiroDia(somarMeses(mes, 1));
  const diasNoMes = diasEntre(inicio, fim);

  const linhas = dados.imoveis.map((imovel) => {
    let noites = 0;
    let receita = 0;
    for (const reserva of dados.reservas) {
      if (reserva.imovelId !== imovel.id) continue;
      const n = noitesNoPeriodo(reserva, inicio, fim);
      if (n > 0) {
        noites += n;
        receita += n * valorPorNoite(reserva);
      }
    }
    return {
      imovel,
      receita,
      noites,
      ocupacao: diasNoMes > 0 ? noites / diasNoMes : 0,
      diariaMedia: noites > 0 ? receita / noites : 0,
    };
  });

  const chave: Record<Ordem, (l: LinhaComparativo) => number> = {
    receita: (l) => l.receita,
    ocupacao: (l) => l.ocupacao,
    diaria: (l) => l.diariaMedia,
  };
  return linhas.sort((a, b) => chave[ordem](b) - chave[ordem](a));
}
