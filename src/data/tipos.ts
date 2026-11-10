import type { DiaISO } from '../utils/datas';

export type Canal = 'Airbnb' | 'Booking' | 'Direto';

export type Imovel = {
  id: string;
  nome: string;
  bairro: string;
  quartos: number;
  /** Diária cobrada hoje, em reais. */
  diariaAtual: number;
};

export type Reserva = {
  id: string;
  imovelId: string;
  hospede: string;
  /** Dia da entrada. */
  checkin: DiaISO;
  /** Dia da saída (a noite desse dia não conta). */
  checkout: DiaISO;
  /** Valor total da estadia, em reais. */
  valorTotal: number;
  canal: Canal;
};

export type DadosTemporada = {
  imoveis: Imovel[];
  reservas: Reserva[];
  /** Data e hora (ISO) em que os dados foram carregados. */
  atualizadoEm: string;
  /** true enquanto o app usa dados de exemplo. */
  exemplo: boolean;
};
