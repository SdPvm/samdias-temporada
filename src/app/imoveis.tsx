import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Cartao, Segmentado, SeletorMes, Tela, estilos as base } from '@/components/ui';
import { Cores, Espaco, Raio } from '@/constants/cores';
import { comparativo, type LinhaComparativo, type Ordem } from '@/data/calculos';
import type { DadosTemporada } from '@/data/tipos';
import { hoje, mesDe, type Mes } from '@/utils/datas';
import { moeda, moedaCurta, pct, plural } from '@/utils/formato';

const OPCOES: { valor: Ordem; rotulo: string }[] = [
  { valor: 'receita', rotulo: 'Receita' },
  { valor: 'ocupacao', rotulo: 'Ocupação' },
  { valor: 'diaria', rotulo: 'Diária' },
];

function valorDa(linha: LinhaComparativo, ordem: Ordem): number {
  if (ordem === 'receita') return linha.receita;
  if (ordem === 'ocupacao') return linha.ocupacao;
  return linha.diariaMedia;
}

function textoDo(linha: LinhaComparativo, ordem: Ordem): string {
  if (ordem === 'receita') return moedaCurta(linha.receita);
  if (ordem === 'ocupacao') return pct(linha.ocupacao);
  return moeda(linha.diariaMedia);
}

/** As outras duas medidas (a da ordem já aparece em destaque) e as noites vendidas. */
function detalhesDa(linha: LinhaComparativo, ordem: Ordem): string {
  const partes: string[] = [];
  if (ordem !== 'receita') partes.push(`receita ${moedaCurta(linha.receita)}`);
  if (ordem !== 'ocupacao') partes.push(`ocupação ${pct(linha.ocupacao)}`);
  if (ordem !== 'diaria') partes.push(`diária média ${moeda(linha.diariaMedia)}`);
  partes.push(plural(linha.noites, 'noite vendida', 'noites vendidas'));
  const texto = partes.join(' · ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function ImoveisTela() {
  return <Tela titulo="Imóveis">{(dados) => <Conteudo dados={dados} />}</Tela>;
}

function Conteudo({ dados }: { dados: DadosTemporada }) {
  const [mes, setMes] = useState<Mes>(() => mesDe(hoje()));
  const [ordem, setOrdem] = useState<Ordem>('receita');

  const linhas = useMemo(() => comparativo(dados, mes, ordem), [dados, mes, ordem]);
  const maximo = Math.max(0, ...linhas.map((l) => valorDa(l, ordem))) || 1;
  const receitaTotal = linhas.reduce((soma, l) => soma + l.receita, 0);
  const noitesTotal = linhas.reduce((soma, l) => soma + l.noites, 0);

  return (
    <>
      <SeletorMes mes={mes} onMudar={setMes} />
      <Segmentado opcoes={OPCOES} valor={ordem} onMudar={setOrdem} />

      <Cartao>
        {linhas.map((linha, i) => (
          <LinhaImovel
            key={linha.imovel.id}
            posicao={i + 1}
            linha={linha}
            ordem={ordem}
            proporcao={valorDa(linha, ordem) / maximo}
            ultima={i === linhas.length - 1}
          />
        ))}
      </Cartao>

      <Cartao style={estilos.total}>
        <View>
          <Text style={estilos.totalRotulo}>Receita do mês</Text>
          <Text style={estilos.totalValor}>{moeda(receitaTotal)}</Text>
        </View>
        <View style={estilos.totalDireita}>
          <Text style={estilos.totalRotulo}>Noites vendidas</Text>
          <Text style={estilos.totalValor}>{noitesTotal}</Text>
        </View>
      </Cartao>
    </>
  );
}

type LinhaProps = {
  posicao: number;
  linha: LinhaComparativo;
  ordem: Ordem;
  proporcao: number;
  ultima: boolean;
};

function LinhaImovel({ posicao, linha, ordem, proporcao, ultima }: LinhaProps) {
  return (
    <View style={[estilos.linha, !ultima && estilos.divisoria]}>
      <View style={estilos.cabeca}>
        <Text style={[estilos.posicao, posicao === 1 && estilos.posicaoPrimeiro]}>{posicao}</Text>
        <View style={estilos.nome}>
          <Text style={estilos.imovel} numberOfLines={1}>
            {linha.imovel.nome}
          </Text>
          <Text style={base.textoSecundario} numberOfLines={1}>
            {linha.imovel.bairro} · {plural(linha.imovel.quartos, 'quarto', 'quartos')}
          </Text>
        </View>
        <Text style={estilos.valor}>{textoDo(linha, ordem)}</Text>
      </View>

      <View style={estilos.trilho}>
        <View style={[estilos.barra, { width: `${Math.max(2, proporcao * 100)}%` }]} />
      </View>

      <Text style={base.textoSecundario}>{detalhesDa(linha, ordem)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { gap: Espaco.s, paddingVertical: Espaco.s },
  divisoria: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Cores.borda, paddingBottom: Espaco.m },
  cabeca: { flexDirection: 'row', alignItems: 'center', gap: Espaco.m },
  posicao: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '800',
    color: Cores.texto,
    backgroundColor: Cores.livre,
  },
  posicaoPrimeiro: { backgroundColor: Cores.laranja, color: Cores.branco },
  nome: { flex: 1, gap: 2 },
  imovel: { color: Cores.texto, fontSize: 15, fontWeight: '700' },
  valor: { color: Cores.texto, fontSize: 17, fontWeight: '800' },
  trilho: { height: 8, borderRadius: Raio.pilula, backgroundColor: Cores.livre, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: Raio.pilula, backgroundColor: Cores.laranja },
  total: { flexDirection: 'row', justifyContent: 'space-between' },
  totalDireita: { alignItems: 'flex-end' },
  totalRotulo: { color: Cores.textoSecundario, fontSize: 13, fontWeight: '600' },
  totalValor: { color: Cores.texto, fontSize: 20, fontWeight: '800' },
});
