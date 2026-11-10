// Datas como texto AAAA-MM-DD (dia local), para não depender de fuso horário.
// Textos nesse formato podem ser comparados direto (a < b).
export type DiaISO = string;

/** Mês com `mes` de 0 (janeiro) a 11 (dezembro). */
export type Mes = { ano: number; mes: number };

export function paraDia(d: Date): DiaISO {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function deDia(dia: DiaISO): Date {
  const [ano, mes, d] = dia.split('-').map(Number);
  return new Date(ano, mes - 1, d);
}

export function hoje(): DiaISO {
  return paraDia(new Date());
}

export function somarDias(dia: DiaISO, n: number): DiaISO {
  const d = deDia(dia);
  d.setDate(d.getDate() + n);
  return paraDia(d);
}

/** Noites entre duas datas (a segunda não conta). */
export function diasEntre(inicio: DiaISO, fim: DiaISO): number {
  return Math.round((deDia(fim).getTime() - deDia(inicio).getTime()) / 86_400_000);
}

export function mesDe(dia: DiaISO): Mes {
  const d = deDia(dia);
  return { ano: d.getFullYear(), mes: d.getMonth() };
}

export function somarMeses(m: Mes, n: number): Mes {
  const d = new Date(m.ano, m.mes + n, 1);
  return { ano: d.getFullYear(), mes: d.getMonth() };
}

export function primeiroDia(m: Mes): DiaISO {
  return paraDia(new Date(m.ano, m.mes, 1));
}

export function diasDoMes(m: Mes): DiaISO[] {
  const total = new Date(m.ano, m.mes + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => paraDia(new Date(m.ano, m.mes, i + 1)));
}

export function mesmoMes(a: Mes, b: Mes): boolean {
  return a.ano === b.ano && a.mes === b.mes;
}

/** 0 = domingo … 6 = sábado */
export function diaDaSemana(dia: DiaISO): number {
  return deDia(dia).getDay();
}
