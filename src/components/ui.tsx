import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cores, Espaco, Raio } from '@/constants/cores';
import type { OcupacaoDia } from '@/data/calculos';
import type { DadosTemporada } from '@/data/tipos';
import { useDados } from '@/data/use-dados';
import { somarMeses, type DiaISO, type Mes } from '@/utils/datas';
import { diaCurto, hora, nomeMes, pct, semanaCurta } from '@/utils/formato';

// ---------- Tela ----------

type TelaProps = {
  titulo: string;
  /** Conteúdo da tela; só aparece depois que os dados carregam. */
  children: (dados: DadosTemporada) => ReactNode;
};

/** Moldura comum das abas: cabeçalho, selo de exemplo, puxar para atualizar, carregando e erro. */
export function Tela({ titulo, children }: TelaProps) {
  const { dados, erro, atualizando, atualizar } = useDados();
  const insets = useSafeAreaInsets();
  // No iPhone o próprio sistema afasta o conteúdo da barra de status e da barra de abas.
  const topo = Platform.OS === 'ios' ? Espaco.s : insets.top + Espaco.l;

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={[estilos.conteudo, { paddingTop: topo }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={atualizar}
          tintColor={Cores.laranja}
          colors={[Cores.laranja]}
        />
      }>
      <View style={estilos.cabecalho}>
        <Text style={estilos.marca}>SAM DIAS · TEMPORADA</Text>
        <Text style={estilos.titulo} accessibilityRole="header">
          {titulo}
        </Text>
        {dados ? (
          <View style={estilos.linhaSelo}>
            {dados.exemplo ? <SeloExemplo /> : null}
            <Text style={estilos.atualizado}>Atualizado às {hora(dados.atualizadoEm)}</Text>
          </View>
        ) : null}
      </View>

      {erro ? <Aviso texto={erro} /> : null}
      {dados ? children(dados) : erro ? null : <Carregando />}
    </ScrollView>
  );
}

export function SeloExemplo() {
  return (
    <View style={estilos.selo}>
      <Text style={estilos.seloTexto}>Dados de exemplo</Text>
    </View>
  );
}

function Carregando() {
  return (
    <View style={estilos.carregando}>
      <ActivityIndicator color={Cores.laranja} />
      <Text style={estilos.textoSecundario}>Carregando…</Text>
    </View>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <Cartao style={estilos.aviso}>
      <Text style={estilos.avisoTitulo}>Não foi possível atualizar</Text>
      <Text style={estilos.textoSecundario}>{texto} Puxe a tela para baixo para tentar de novo.</Text>
    </Cartao>
  );
}

// ---------- Blocos ----------

export function Cartao({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.cartao, style]}>{children}</View>;
}

export function TituloSecao({ children, detalhe }: { children: string; detalhe?: string }) {
  return (
    <View style={estilos.tituloSecao}>
      <Text style={estilos.tituloSecaoTexto}>{children}</Text>
      {detalhe ? <Text style={estilos.textoSecundario}>{detalhe}</Text> : null}
    </View>
  );
}

export function GradeKpis({ children }: { children: ReactNode }) {
  return <View style={estilos.grade}>{children}</View>;
}

type KpiProps = { rotulo: string; valor: string; detalhe?: string; destaque?: boolean };

export function Kpi({ rotulo, valor, detalhe, destaque }: KpiProps) {
  return (
    <View style={[estilos.kpi, destaque && estilos.kpiDestaque]}>
      <Text style={[estilos.kpiRotulo, destaque && estilos.textoBranco]}>{rotulo}</Text>
      <Text
        style={[estilos.kpiValor, destaque && estilos.textoBranco]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {valor}
      </Text>
      {detalhe ? (
        <Text style={[estilos.kpiDetalhe, destaque && estilos.textoBrancoSuave]}>{detalhe}</Text>
      ) : null}
    </View>
  );
}

export type TipoPilula = 'sobe' | 'mantem' | 'desce';

const FUNDO_PILULA: Record<TipoPilula, string> = {
  sobe: Cores.laranja,
  mantem: Cores.livre,
  desce: Cores.preto,
};
const TEXTO_PILULA: Record<TipoPilula, string> = {
  sobe: Cores.branco,
  mantem: Cores.texto,
  desce: Cores.branco,
};

export function Pilula({ texto, tipo }: { texto: string; tipo: TipoPilula }) {
  return (
    <View style={[estilos.pilula, { backgroundColor: FUNDO_PILULA[tipo] }]}>
      <Text style={[estilos.pilulaTexto, { color: TEXTO_PILULA[tipo] }]}>{texto}</Text>
    </View>
  );
}

// ---------- Seletores ----------

export function SeletorMes({ mes, onMudar }: { mes: Mes; onMudar: (m: Mes) => void }) {
  return (
    <View style={estilos.seletor}>
      <BotaoSeta rotulo="Mês anterior" simbolo="‹" onPress={() => onMudar(somarMeses(mes, -1))} />
      <Text style={estilos.seletorTexto}>{nomeMes(mes)}</Text>
      <BotaoSeta rotulo="Próximo mês" simbolo="›" onPress={() => onMudar(somarMeses(mes, 1))} />
    </View>
  );
}

function BotaoSeta({ rotulo, simbolo, onPress }: { rotulo: string; simbolo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [estilos.seta, pressed && estilos.pressionado]}>
      <Text style={estilos.setaTexto}>{simbolo}</Text>
    </Pressable>
  );
}

type Opcao<T extends string> = { valor: T; rotulo: string };

export function Segmentado<T extends string>({
  opcoes,
  valor,
  onMudar,
}: {
  opcoes: Opcao<T>[];
  valor: T;
  onMudar: (v: T) => void;
}) {
  return (
    <View style={estilos.segmentado} accessibilityRole="tablist">
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => onMudar(opcao.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[estilos.segmento, ativo && estilos.segmentoAtivo]}>
            <Text style={[estilos.segmentoTexto, ativo && estilos.segmentoTextoAtivo]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Gráfico de ocupação ----------

const ALTURA_GRAFICO = 128;

type GraficoProps = {
  dias: OcupacaoDia[];
  hoje: DiaISO;
  selecionado: DiaISO | null;
  onSelecionar: (dia: DiaISO | null) => void;
};

export function GraficoBarras({ dias, hoje, selecionado, onSelecionar }: GraficoProps) {
  const escolhido = dias.find((d) => d.dia === selecionado);
  const marcas = new Set([0, 9, 19, dias.length - 1]);

  return (
    <View>
      <Text style={estilos.graficoInfo}>
        {escolhido
          ? `${semanaCurta(escolhido.dia)}, ${diaCurto(escolhido.dia)}: ${escolhido.ocupados} de ${escolhido.total} imóveis ocupados (${pct(escolhido.taxa)})`
          : 'Toque numa barra para ver o dia.'}
      </Text>

      <View style={[estilos.grafico, { height: ALTURA_GRAFICO }]}>
        <View style={[estilos.guia, { top: 0 }]} />
        <View style={[estilos.guia, { top: ALTURA_GRAFICO / 2 }]} />
        <Text style={[estilos.guiaTexto, { top: -7 }]}>100%</Text>
        <Text style={[estilos.guiaTexto, { top: ALTURA_GRAFICO / 2 - 7 }]}>50%</Text>
        {dias.map((d) => {
          const ativo = d.dia === selecionado;
          const futuro = d.dia > hoje;
          return (
            <Pressable
              key={d.dia}
              style={estilos.colunaBarra}
              onPress={() => onSelecionar(ativo ? null : d.dia)}
              accessibilityRole="button"
              accessibilityLabel={`${diaCurto(d.dia)}: ${pct(d.taxa)} ocupado`}>
              <View
                style={[
                  estilos.barra,
                  {
                    height: Math.max(3, d.taxa * ALTURA_GRAFICO),
                    backgroundColor: ativo ? Cores.preto : futuro ? Cores.laranjaClaro : Cores.laranja,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={estilos.eixo}>
        {dias.map((d, i) => (
          <View key={d.dia} style={estilos.colunaEixo}>
            {marcas.has(i) ? <Text style={estilos.eixoTexto}>{Number(d.dia.slice(8))}</Text> : null}
          </View>
        ))}
      </View>

      <View style={estilos.legenda}>
        <Legenda cor={Cores.laranja} texto="Até hoje" />
        <Legenda cor={Cores.laranjaClaro} texto="Já reservado (futuro)" />
      </View>
    </View>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <View style={estilos.legendaItem}>
      <View style={[estilos.legendaCor, { backgroundColor: cor }]} />
      <Text style={estilos.textoSecundario}>{texto}</Text>
    </View>
  );
}

// ---------- Estilos ----------

export const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  conteudo: {
    paddingHorizontal: Espaco.l,
    paddingBottom: Espaco.xxl * 2,
    gap: Espaco.l,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  cabecalho: { gap: Espaco.xs },
  marca: { color: Cores.laranja, fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  titulo: { color: Cores.texto, fontSize: 32, fontWeight: '800' },
  linhaSelo: { flexDirection: 'row', alignItems: 'center', gap: Espaco.s, marginTop: Espaco.xs },
  atualizado: { color: Cores.textoSecundario, fontSize: 12 },
  selo: {
    borderWidth: 1,
    borderColor: Cores.laranja,
    backgroundColor: Cores.laranjaFundo,
    borderRadius: Raio.pilula,
    paddingHorizontal: Espaco.s,
    paddingVertical: 2,
  },
  seloTexto: { color: Cores.laranja, fontSize: 12, fontWeight: '700' },
  carregando: { alignItems: 'center', gap: Espaco.s, paddingVertical: Espaco.xxl },
  aviso: { borderColor: Cores.laranja },
  avisoTitulo: { color: Cores.texto, fontSize: 15, fontWeight: '700', marginBottom: Espaco.xs },

  cartao: {
    backgroundColor: Cores.branco,
    borderRadius: Raio.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Cores.borda,
    padding: Espaco.l,
    gap: Espaco.m,
  },
  tituloSecao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  tituloSecaoTexto: { color: Cores.texto, fontSize: 17, fontWeight: '700' },
  textoSecundario: { color: Cores.textoSecundario, fontSize: 13 },
  textoBranco: { color: Cores.branco },
  textoBrancoSuave: { color: 'rgba(255,255,255,0.8)' },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: Espaco.m },
  kpi: {
    flexBasis: '45%',
    flexGrow: 1,
    backgroundColor: Cores.branco,
    borderRadius: Raio.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Cores.borda,
    padding: Espaco.l,
    gap: 2,
  },
  kpiDestaque: { backgroundColor: Cores.preto, borderColor: Cores.preto },
  kpiRotulo: { color: Cores.textoSecundario, fontSize: 13, fontWeight: '600' },
  kpiValor: { color: Cores.texto, fontSize: 24, fontWeight: '800' },
  kpiDetalhe: { color: Cores.textoSecundario, fontSize: 12 },

  pilula: { borderRadius: Raio.pilula, paddingHorizontal: Espaco.m, paddingVertical: 4 },
  pilulaTexto: { fontSize: 13, fontWeight: '700' },

  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Cores.branco,
    borderRadius: Raio.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Cores.borda,
    paddingHorizontal: Espaco.s,
    paddingVertical: Espaco.xs,
  },
  seletorTexto: { color: Cores.texto, fontSize: 17, fontWeight: '700' },
  seta: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Raio.m },
  setaTexto: { color: Cores.laranja, fontSize: 30, fontWeight: '600', lineHeight: 34 },
  pressionado: { opacity: 0.5 },

  segmentado: {
    flexDirection: 'row',
    backgroundColor: Cores.livre,
    borderRadius: Raio.m,
    padding: 3,
  },
  segmento: { flex: 1, alignItems: 'center', paddingVertical: Espaco.s, borderRadius: Raio.s },
  segmentoAtivo: { backgroundColor: Cores.branco },
  segmentoTexto: { color: Cores.textoSecundario, fontSize: 14, fontWeight: '600' },
  segmentoTextoAtivo: { color: Cores.texto, fontWeight: '700' },

  graficoInfo: { color: Cores.texto, fontSize: 13, marginBottom: Espaco.m, minHeight: 18 },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingLeft: 30 },
  guia: {
    position: 'absolute',
    left: 30,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Cores.borda,
  },
  guiaTexto: { position: 'absolute', left: 0, fontSize: 10, color: Cores.textoSecundario },
  colunaBarra: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  barra: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  eixo: { flexDirection: 'row', gap: 2, paddingLeft: 30, marginTop: Espaco.xs },
  colunaEixo: { flex: 1, alignItems: 'center', overflow: 'visible' },
  eixoTexto: { width: 24, textAlign: 'center', fontSize: 11, color: Cores.textoSecundario },
  legenda: { flexDirection: 'row', gap: Espaco.l, marginTop: Espaco.m, flexWrap: 'wrap' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: Espaco.xs },
  legendaCor: { width: 10, height: 10, borderRadius: 2 },
});
