import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Cartao,
  GradeKpis,
  GraficoBarras,
  Kpi,
  SeletorMes,
  Tela,
  TituloSecao,
  estilos as base,
} from '@/components/ui';
import { Cores, Espaco, Raio } from '@/constants/cores';
import { proximosCheckins, resumoDoMes, type ProximoCheckin } from '@/data/calculos';
import type { DadosTemporada } from '@/data/tipos';
import { deDia, hoje, mesDe, type DiaISO, type Mes } from '@/utils/datas';
import { moeda, moedaCurta, pct, plural, semanaCurta } from '@/utils/formato';

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export default function OcupacaoTela() {
  return <Tela titulo="Ocupação">{(dados) => <Conteudo dados={dados} />}</Tela>;
}

function Conteudo({ dados }: { dados: DadosTemporada }) {
  const dia = hoje();
  const [mes, setMes] = useState<Mes>(() => mesDe(dia));
  const [selecionado, setSelecionado] = useState<DiaISO | null>(null);

  const resumo = useMemo(() => resumoDoMes(dados, mes), [dados, mes]);
  const checkins = useMemo(() => proximosCheckins(dados, dia, 6), [dados, dia]);

  return (
    <>
      <SeletorMes
        mes={mes}
        onMudar={(novo) => {
          setMes(novo);
          setSelecionado(null);
        }}
      />

      <GradeKpis>
        <Kpi
          rotulo="Taxa de ocupação"
          valor={pct(resumo.ocupacao)}
          detalhe={`${resumo.noitesOcupadas} de ${resumo.noitesDisponiveis} noites`}
          destaque
        />
        <Kpi rotulo="Receita" valor={moedaCurta(resumo.receita)} detalhe="noites do mês" />
        <Kpi rotulo="Diária média" valor={moeda(resumo.diariaMedia)} detalhe="por noite ocupada" />
        <Kpi rotulo="RevPAR" valor={moeda(resumo.revpar)} detalhe="por noite disponível" />
      </GradeKpis>

      <Cartao>
        <TituloSecao detalhe={plural(dados.imoveis.length, 'imóvel', 'imóveis')}>
          Ocupação dia a dia
        </TituloSecao>
        <GraficoBarras
          dias={resumo.porDia}
          hoje={dia}
          selecionado={selecionado}
          onSelecionar={setSelecionado}
        />
      </Cartao>

      <Cartao>
        <TituloSecao>Próximos check-ins</TituloSecao>
        {checkins.length === 0 ? (
          <Text style={base.textoSecundario}>Nenhum check-in previsto.</Text>
        ) : (
          checkins.map((item, i) => (
            <LinhaCheckin key={item.reserva.id} item={item} ultima={i === checkins.length - 1} />
          ))
        )}
      </Cartao>
    </>
  );
}

function LinhaCheckin({ item, ultima }: { item: ProximoCheckin; ultima: boolean }) {
  const data = deDia(item.reserva.checkin);
  return (
    <View style={[estilos.linha, !ultima && estilos.linhaDivisoria]}>
      <View style={estilos.data}>
        <Text style={estilos.dataDia}>{data.getDate()}</Text>
        <Text style={estilos.dataMes}>
          {MESES_CURTOS[data.getMonth()]} · {semanaCurta(item.reserva.checkin)}
        </Text>
      </View>
      <View style={estilos.meio}>
        <Text style={estilos.imovel} numberOfLines={1}>
          {item.imovel.nome}
        </Text>
        <Text style={base.textoSecundario} numberOfLines={1}>
          {item.reserva.hospede} · {plural(item.noites, 'noite', 'noites')} · {item.reserva.canal}
        </Text>
      </View>
      <Text style={estilos.valor}>{moeda(item.reserva.valorTotal)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: Espaco.m, paddingVertical: Espaco.s },
  linhaDivisoria: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Cores.borda },
  data: {
    width: 58,
    alignItems: 'center',
    backgroundColor: Cores.laranjaFundo,
    borderRadius: Raio.m,
    paddingVertical: Espaco.xs,
  },
  dataDia: { color: Cores.laranja, fontSize: 20, fontWeight: '800' },
  dataMes: { color: Cores.texto, fontSize: 11, fontWeight: '600' },
  meio: { flex: 1, gap: 2 },
  imovel: { color: Cores.texto, fontSize: 15, fontWeight: '700' },
  valor: { color: Cores.texto, fontSize: 15, fontWeight: '700' },
});
