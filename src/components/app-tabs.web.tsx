// Versão web (só para conferir as telas no navegador). No iPhone vale app-tabs.tsx.
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cores, Espaco, Raio } from '@/constants/cores';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View style={estilos.barra}>
          <TabTrigger name="index" href="/" asChild>
            <Botao>Ocupação</Botao>
          </TabTrigger>
          <TabTrigger name="diarias" href="/diarias" asChild>
            <Botao>Diárias</Botao>
          </TabTrigger>
          <TabTrigger name="imoveis" href="/imoveis" asChild>
            <Botao>Imóveis</Botao>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function Botao({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable
      {...(props as Omit<TabTriggerSlotProps, 'ref' | 'children' | 'isFocused'>)}
      style={[estilos.botao, isFocused && estilos.botaoAtivo]}>
      <Text style={[estilos.texto, isFocused && estilos.textoAtivo]}>{children}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Espaco.s,
    padding: Espaco.s,
    backgroundColor: Cores.branco,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Cores.borda,
  },
  botao: { paddingVertical: Espaco.s, paddingHorizontal: Espaco.l, borderRadius: Raio.m },
  botaoAtivo: { backgroundColor: Cores.laranjaFundo },
  texto: { color: Cores.textoSecundario, fontWeight: '600' },
  textoAtivo: { color: Cores.laranja, fontWeight: '700' },
});
