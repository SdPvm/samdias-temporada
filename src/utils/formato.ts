import { deDia, type DiaISO, type Mes } from './datas';

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const SEMANA_CURTA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function milhar(inteiro: string): string {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** R$ 1.234 (ou R$ 1.234,56 com casas = 2) */
export function moeda(valor: number, casas = 0): string {
  const [inteiro, decimal] = Math.abs(valor).toFixed(casas).split('.');
  return `${valor < 0 ? '-' : ''}R$ ${milhar(inteiro)}${decimal ? `,${decimal}` : ''}`;
}

/** R$ 18,4 mil para valores grandes */
export function moedaCurta(valor: number): string {
  if (Math.abs(valor) >= 10_000) {
    return `R$ ${(valor / 1000).toFixed(1).replace('.', ',')} mil`;
  }
  return moeda(valor);
}

/** 0,734 → 73% */
export function pct(fracao: number, casas = 0): string {
  return `${(fracao * 100).toFixed(casas).replace('.', ',')}%`;
}

export function nomeMes(m: Mes): string {
  const nome = MESES[m.mes];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${m.ano}`;
}

/** 12/11 */
export function diaCurto(dia: DiaISO): string {
  const d = deDia(dia);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** qui */
export function semanaCurta(dia: DiaISO): string {
  return SEMANA_CURTA[deDia(dia).getDay()];
}

/** qui, 12 nov */
export function dataMedia(dia: DiaISO): string {
  const d = deDia(dia);
  return `${SEMANA_CURTA[d.getDay()]}, ${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
}

/** 18:05 */
export function hora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}
