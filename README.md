# Sam Dias Temporada (app iOS)

App do iPhone da Sam Dias para acompanhar a locação por temporada. Versão 1.0.0, com **dados de exemplo** (o selo "Dados de exemplo" aparece no topo de cada tela). Não há nenhum dado real, senha ou chave neste repositório.

## Telas

- **Ocupação**: taxa de ocupação do mês, receita, diária média e RevPAR; gráfico de ocupação dia a dia (toque numa barra para ver o dia); próximos check-ins.
- **Diárias**: diária atual de cada imóvel, calendário dos próximos 14 dias e sugestão de ajuste de preço.
- **Imóveis**: comparativo entre os imóveis, ordenado por receita, ocupação ou diária.

Em todas as telas: setas para trocar o mês e "puxar para atualizar".

### Regra da sugestão de diária (ocupação dos próximos 14 dias)

| Ocupação | Sugestão |
|---|---|
| 80% ou mais | subir 10% |
| de 65% a 80% | subir 5% |
| de 40% a 65% | manter |
| abaixo de 40% | baixar 10% |

## Como gerar o app e mandar para o TestFlight

**Pelo celular, sem computador (Expo Launch):** abra o link do Expo Launch com este repositório, entre na Expo e na Apple e toque em Launch. A nuvem da Expo monta o app e o envia ao App Store Connect (TestFlight).

**Pelo computador (EAS CLI):**

```bash
npm install
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

O perfil `production` aumenta o número do build sozinho (`appVersionSource: remote`).

## Dados reais (próximo passo)

Só muda `src/data/fonte.ts`. Com a variável `EXPO_PUBLIC_API_TEMPORADA` definida, o app busca os dados nesse endereço (JSON no formato `DadosTemporada`, em `src/data/tipos.ts`). A API fica no Azure da Sam Dias e junta o dashboard de temporada e o ApresentaMe; o token do ApresentaMe fica no servidor, nunca no iPhone.

## Técnico

- Expo SDK 58, React Native 0.88, Expo Router com barra de abas nativa do iOS.
- iOS: bundle ID `br.com.samdias.temporada`, nome "Sam Dias Temporada". Sem criptografia própria (`ITSAppUsesNonExemptEncryption: false`), então o TestFlight não pergunta sobre exportação.
- Cores: laranja `#FF7D36`, preto `#111111` e branco.
- Código: `src/app` (telas), `src/components` (barra de abas e componentes visuais), `src/data` (dados e cálculos), `src/utils` (datas e formatação), `src/constants` (cores).
- Conferências: `npm run typecheck`, `npm run lint`, `npm run doctor`.
