import { NativeTabs } from 'expo-router/native-tabs';

import { Cores } from '@/constants/cores';

/** Barra de abas nativa do iPhone. */
export default function AppTabs() {
  return (
    <NativeTabs tintColor={Cores.laranja} labelStyle={{ selected: { color: Cores.laranja } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Ocupação</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="diarias">
        <NativeTabs.Trigger.Label>Diárias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'tag', selected: 'tag.fill' }} md="sell" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="imoveis">
        <NativeTabs.Trigger.Label>Imóveis</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
