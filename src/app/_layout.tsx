import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { Cores } from '@/constants/cores';
import { DadosProvider } from '@/data/use-dados';

const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Cores.laranja,
    background: Cores.fundo,
    card: Cores.branco,
    text: Cores.texto,
    border: Cores.borda,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={tema}>
      <DadosProvider>
        <StatusBar style="dark" />
        <AppTabs />
      </DadosProvider>
    </ThemeProvider>
  );
}
