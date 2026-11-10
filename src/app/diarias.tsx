import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Cartao, Pilula, Tela, TituloSecao, estilos as base, type TipoPilula } from '@/components/ui';
import { Cores, Espaco, Raio } from '@/constants/cores';
import { diariasProximosDias, type DiaDoCalendario, type DiariaDoImovel } from '@/data/calculos';
import type { DadosTemporada } from '@/data/tipos';
import { hoje, somarDias } from '@/utils/datas';
import { diaCurto, moeda, pct, semanaCurta } from '@/utils/formato';

const DIAS = 14;

export default function DiariasTela() {
  return <Tela titulo="Diárias">{(dados) => <Conteudo dados={dados} />}</Tela>;
}

function Conteudo({ dados }: { dados: DadosTemporada }) {
  const dia = hoje();
  const lista = useMemo(() => diariasProximosDias(dados, dia, DIAS), [dados, dia]);

  return (
    <>
      <Text style={estilos.intro}>
        Próximos {DIAS} dias ({diaCurto(dia)} a {diaCurto(somarDias(dia, DIAS - 1))}). A sugestão de
        preço segue a ocupação de cada imóvel nesse período.
      </Text>

      {lista.map((item) => (
        <CartaoDiaria key={item.imovel.id} item={item} />
      ))}

      <Cartao>
        <TituloSecao>Como a sugestão é calculada</TituloSecao>
        <Regra faixa="80% ou mais" acao="subir 10%" />
        <Regra faixa="de 65% a 80%" acao="subir 5%" />
        <Regra faixa="de 40% a 65%" acao="manter" />
        <Regra faixa="abaixo de 40%" acao="baixar 10%" />
        <Text style={base.textoSecundario}>Ocupação dos próximos {DIAS} dias de cada imóvel.</Text>
      </Cartao>
    </>
  );
}

function tipoDoAjuste(percentual: number): TipoPilula {
  if (percentual > 0) return 'sobe';
  if (percentual < 0) return 'desce';
  return 'mantem';
}

function CartaoDiaria({ item }: { item: DiariaDoImovel }) {
  const muda = item.ajuste.percentual !== 0;
  return (
    <Cartao>
      <View style={estilos.topo}>
        <View style={estilos.nome}>
          <Text style={estilos.imovel} numberOfLines={1}>
            {item.imovel.nome}
          </Text>
          <Text style={base.textoSecundario}>
            {item.imovel.bairro} · ocupação {pct(item.ocupacao)}
          </Text>
        </View>
        <Pilula texto={item.ajuste.rotulo} tipo={tipoDoAjuste(item.ajuste.percentual)} />
      </View>

      <View style={estilos.precos}>
        <View>
          <Text style={base.textoSecundario}>Diária atual</Text>
          <Text style={estilos.preco}>{moeda(item.imovel.diariaAtual)}</Text>
        </View>
        <Text style={estilos.flecha}>→</Text>
        <View style={estilos.sugerida}>
          <Text style={base.textoSecundario}>Sugerida</Text>
          <Text style={[estilos.preco, muda && estilos.precoMuda]}>{moeda(item.precoSugerido)}</Text>
        </View>
      </View>

      <Calendario dias={item.dias} />
    </Cartao>
  );
}

function Calendario({ dias }: { dias: DiaDoCalendario[] }) {
  const semanas = [dias.slice(0, 7), dias.slice(7, 14)].filter((s) => s.length > 0);
  return (
    <View style={estilos.calendario}>
      {semanas.map((semana) => (
        <View key={semana[0].dia} style={estilos.semana}>
          {semana.map((d) => (
            <View
              key={d.dia}
              style={[estilos.celula, d.ocupado ? estilos.celulaOcupada : estilos.celulaLivre]}
              accessibilityLabel={`${diaCurto(d.dia)}: ${d.ocupado ? 'ocupado' : 'livre'}`}>
              <Text style={[estilos.celulaSemana, d.ocupado && estilos.textoBranco]}>
                {semanaCurta(d.dia).charAt(0).toUpperCase()}
              </Text>
              <Text style={[estilos.celulaDia, d.ocupado && estilos.textoBranco]}>
                {Number(d.dia.slice(8))}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <View style={estilos.legenda}>
        <View style={[estilos.legendaCor, estilos.celulaOcupada]} />
        <Text style={base.textoSecundario}>ocupado</Text>
        <View style={[estilos.legendaCor, estilos.celulaLivre]} />
        <Text style={base.textoSecundario}>livre</Text>
      </View>
    </View>
  );
}

function Regra({ faixa, acao }: { faixa: string; acao: string }) {
  return (
    <View style={estilos.regra}>
      <Text style={estilos.regraFaixa}>{faixa}</Text>
      <Text style={estilos.regraAcao}>{acao}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  intro: { color: Cores.textoSecundario, fontSize: 14, lineHeight: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: Espaco.m },
  nome: { flex: 1, gap: 2 },
  imovel: { color: Cores.texto, fontSize: 16, fontWeight: '700' },
  precos: { flexDirection: 'row', alignItems: 'flex-end', gap: Espaco.l },
  preco: { color: Cores.texto, fontSize: 22, fontWeight: '800' },
  precoMuda: { color: Cores.laranja },
  flecha: { color: Cores.textoSecundario, fontSize: 20, paddingBottom: 3 },
  sugerida: { flex: 1 },
  calendario: { gap: 6 },
  semana: { flexDirection: 'row', gap: 6 },
  celula: {
    flex: 1,
    height: 46,
    borderRadius: Raio.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: Espaco.xs, marginTop: 2 },
  legendaCor: { width: 10, height: 10, borderRadius: 2, marginLeft: Espaco.xs },
  celulaOcupada: { backgroundColor: Cores.laranja },
  celulaLivre: { backgroundColor: Cores.livre },
  celulaSemana: { fontSize: 10, color: Cores.textoSecundario, fontWeight: '600' },
  celulaDia: { fontSize: 15, color: Cores.texto, fontWeight: '700' },
  textoBranco: { color: Cores.branco },
  regra: { flexDirection: 'row', justifyContent: 'space-between' },
  regraFaixa: { color: Cores.texto, fontSize: 14 },
  regraAcao: { color: Cores.texto, fontSize: 14, fontWeight: '700' },
});
