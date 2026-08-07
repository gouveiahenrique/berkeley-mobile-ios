# [Events Page] Exibir Indicador "All Day" em Vez do Horário na Página de Detalhe do Evento

## Problema que estamos tentando resolver

Atualmente, quando um evento é marcado como "All Day" (dia inteiro), a página de detalhe do evento exibe um horário literal na linha de horário — especificamente o valor "12:00 AM". Esse comportamento resulta em uma informação incorreta e enganosa para o usuário, uma vez que eventos de dia inteiro não possuem um horário de início ou término específico.

O estado atual da experiência é: o usuário acessa a página de detalhe de um evento marcado como dia inteiro, e visualiza "12:00 AM" na linha de horário (identificada pelo ícone de relógio). Não há nenhuma distinção visual entre eventos com horário definido e eventos de dia inteiro.

Isso é urgente porque a informação exibida é factualmente incorreta — o horário "12:00 AM" é um artefato interno do sistema (representação técnica de eventos sem horário definido), não um dado real do evento. Exibir esse valor degrada a confiança do usuário na precisão das informações do aplicativo e pode gerar confusão sobre quando o evento ocorre.

### Por que isso é um problema

- **Informação incorreta exibida ao usuário**: O horário "12:00 AM" não representa qualquer horário real do evento; é um valor padrão gerado internamente para eventos sem hora definida, induzindo o usuário a acreditar que o evento começa à meia-noite.
- **Ausência de sinalização visual adequada**: Não há elemento visual que comunique claramente ao usuário que aquele evento ocupa o dia inteiro, gerando ambiguidade sobre a natureza do evento.
- **Inconsistência entre telas do aplicativo**: A tela de listagem de eventos já possui componentes dedicados ao tratamento de eventos "All Day" (como o `AllDayEventBannerView`), mas a página de detalhe do evento não reflete esse mesmo tratamento, criando inconsistência na experiência de uso.
- **Erosão da confiança na qualidade das informações**: Dados incorretos, mesmo que sutis, impactam negativamente a percepção de qualidade e confiabilidade do aplicativo pelo usuário.

## Qual é a solução

A solução consiste em identificar, na página de detalhe do evento, quando um evento é do tipo "All Day" e, nesse caso, substituir a exibição do horário por um indicador visual no formato de cápsula/pílula com o texto "All Day".

Os pilares da solução são:
1. **Detecção do tipo de evento**: O sistema deve determinar se o evento em exibição é do tipo dia inteiro, utilizando as informações já disponíveis no modelo de dados do evento.
2. **Substituição condicional do componente de horário**: Quando o evento for do tipo "All Day", a linha de horário deve exibir o indicador visual "All Day" em formato de cápsula; quando não for, deve exibir o intervalo de horário normalmente.
3. **Consistência visual com o restante do aplicativo**: O indicador deve seguir o padrão visual já estabelecido no aplicativo para representar eventos de dia inteiro (cápsula/badge).

O resultado esperado é que o usuário visualize informações precisas e sem ambiguidade na página de detalhe, compreendendo imediatamente que o evento não possui horário específico e ocupa o dia todo.

## Conceitos importantes

**Evento "All Day" (Dia Inteiro)**
Um evento classificado como "All Day" é aquele que não possui um horário de início ou término específico e ocorre ao longo de todo o dia calendário. No modelo de dados atual, um evento "All Day" pode ser identificado por dois mecanismos complementares:
- Pelo campo booleano `isAllDay`, presente no modelo `BMEventCalendarEntry`, que é fornecido diretamente pela fonte de dados (backend via Firestore).
- Pela convenção de tempo: `startDate` com hora `00:00:00` e `end` com hora `23:59:59` — lógica já implementada no protocolo `BMCalendarEvent` para composição do `dateString`.

**`dateString`**
Campo computado presente no protocolo `BMCalendarEvent`. Retorna uma string formatada que representa a data e, se aplicável, o horário do evento. Para eventos identificados pela convenção de tempo como "All Day", o campo já retorna o texto `"Data / All Day"`. Entretanto, a exibição desse texto na tela de detalhe é feita dividindo a string pelo separador ` / `, e a segunda parte (o horário) é renderizada diretamente como texto — sem distinção visual de formato.

**Indicador de Cápsula / Pill / Badge**
Elemento visual em formato de cápsula (bordas totalmente arredondadas) utilizado para comunicar um atributo ou estado de forma destacada e compacta. No contexto do Berkeley Mobile, o `AllDayEventBannerView` já utiliza esse padrão para exibir eventos de dia inteiro na listagem. Na página de detalhe, o mesmo padrão visual deve ser adotado na linha de horário.

**Linha de Horário (Time Row)**
Componente visual presente na seção de cabeçalho da página de detalhe do evento (`BMDetailHeaderView`). É identificado pelo ícone de relógio e exibe o horário do evento. Atualmente, renderiza o segundo segmento do `dateString` (após o separador ` / `) sem qualquer tratamento condicional para eventos de dia inteiro.

**`BMDetailHeaderView`**
Componente SwiftUI responsável por renderizar o cabeçalho da página de detalhe do evento, contendo: imagem, nome do evento, data, horário e localização.

**`EventDetailRow`**
Componente SwiftUI reutilizável que renderiza uma linha de informação com ícone e texto. Utilizado atualmente para exibir data, horário e localização na `BMDetailHeaderView`.

**`isAllDay` (campo do modelo)**
Campo booleano opcional (`Bool?`) presente em `BMEventCalendarEntry` e no DTO `BerkeleyEvent`. Indica se o evento foi classificado como dia inteiro pela fonte de dados. Valor padrão é `false` quando ausente ou nulo.

## Suposições

- O campo `isAllDay` presente em `BMEventCalendarEntry` reflete com fidelidade a classificação do evento pela fonte de dados (Firestore), e é o indicador autoritativo para determinar se um evento é do tipo dia inteiro na página de detalhe.
- Quando `isAllDay` for `nil` ou `false`, o evento deve ser tratado como possuindo horário definido, e o horário deve ser exibido normalmente.
- A convenção de tempo (start = 00:00:00, end = 23:59:59) e o campo `isAllDay` são mecanismos complementares e consistentes entre si — não haverá eventos em que `isAllDay` seja `true` mas o `dateString` não contenha "All Day", nem o contrário.
- O indicador visual "All Day" deve substituir integralmente o conteúdo da linha de horário (Time Row), mantendo o ícone de relógio visível para preservar a estrutura visual do cabeçalho.
- A mudança é restrita à página de detalhe do evento (`EventDetailView` / `BMDetailHeaderView`); a tela de listagem e outros contextos não fazem parte do escopo desta história.
- O estilo visual (forma de cápsula, fundo cinza semitransparente) do indicador "All Day" deve ser consistente com o padrão já estabelecido pelo componente `AllDayEventBannerView` existente no aplicativo.
- Não há requisito de acessibilidade (VoiceOver label personalizado) explicitado nesta história — assume-se que o texto "All Day" serve como label legível por tecnologias assistivas por padrão.
- A fonte de dados (Firestore) já fornece o campo `isAllDay` corretamente preenchido; não há necessidade de derivação ou cálculo adicional por parte do cliente para determinar se o evento é de dia inteiro.

## Requisitos funcionais

**RF-01 — Exibição do Indicador "All Day" na Linha de Horário**

Quando o usuário acessa a página de detalhe de um evento, o sistema deve verificar se o evento é do tipo dia inteiro.

- Se o evento for do tipo "All Day" (campo `isAllDay` igual a `true`), a linha de horário na seção de cabeçalho da página de detalhe deve exibir um indicador visual em formato de cápsula contendo o texto "All Day", em substituição ao horário.
- O indicador deve apresentar:
  - Formato de cápsula (bordas totalmente arredondadas).
  - Fundo visualmente distinto do fundo do card (ex.: cinza semitransparente), garantindo legibilidade.
  - Texto "All Day" em destaque (peso bold ou semibold), legível sobre o fundo da cápsula.
- O ícone de relógio (identificador da linha de horário) deve permanecer visível ao lado do indicador "All Day", preservando a consistência estrutural do cabeçalho.
- O indicador "All Day" deve ocupar apenas o espaço necessário para seu conteúdo, sem comprometer o layout dos demais elementos do cabeçalho.

**RF-02 — Manutenção do Comportamento para Eventos com Horário Definido**

Quando o evento não for do tipo "All Day" (campo `isAllDay` igual a `false`, `nil`, ou ausente), a linha de horário deve exibir o intervalo de horário do evento exatamente como hoje: horário de início e, quando disponível, horário de término, no formato `h:mm a - h:mm a`.

- Nenhuma alteração visual deve ocorrer para eventos com horário definido.
- O comportamento existente para eventos com horário deve ser integralmente preservado.

**RF-03 — Tratamento do Campo `isAllDay` Nulo ou Ausente**

Quando o campo `isAllDay` de um evento for `nil` (não fornecido pela fonte de dados), o sistema deve tratar o evento como possuindo horário definido.

- O indicador "All Day" não deve ser exibido para eventos com `isAllDay` nulo.
- A linha de horário deve exibir o horário normalmente, conforme RF-02.
- Não deve haver estado visual de erro ou indisponibilidade de informação nesse cenário.

**RF-04 — Consistência Visual com o Padrão Existente do Aplicativo**

O indicador "All Day" exibido na página de detalhe deve ser visualmente consistente com o estilo de cápsula já utilizado em outras partes do aplicativo para representar eventos de dia inteiro.

- O estilo visual (formato de cápsula, paleta de cores, tipografia) deve seguir o padrão estabelecido pelo componente de banner "All Day" existente na listagem de eventos.
- Não deve haver introdução de um novo padrão visual divergente do já existente.

**RF-05 — Preservação da Estrutura do Cabeçalho de Detalhe**

A introdução do indicador "All Day" na linha de horário não deve alterar a estrutura ou o layout dos demais elementos presentes no cabeçalho da página de detalhe do evento.

- A linha de data deve continuar exibindo a data do evento sem alterações.
- A linha de localização deve continuar exibindo o local do evento sem alterações.
- O nome do evento, imagem e demais componentes do cabeçalho devem permanecer inalterados.
- O comportamento de scroll e demais interações da página devem continuar funcionando normalmente.

## Integrações externas

**Firestore (Firebase) — Fonte de Dados de Eventos**
- **Tipo**: Banco de dados NoSQL em nuvem (backend).
- **Propósito**: Fornece os dados dos eventos exibidos no aplicativo, incluindo o campo `isAllDay` que determina se um evento é do tipo dia inteiro.
- **Dados de entrada**: Documentos da coleção `Events`, contendo a estrutura `BerkeleyEventsDaySnapshot` com lista de `BerkeleyEvent`.
- **Dados de saída**: Campo `isAllDay` (booleano opcional) do documento de evento, mapeado para o campo `isAllDay` de `BMEventCalendarEntry`.
- **Criticidade**: Alta — é a fonte autoritativa da classificação do evento como "All Day". Sem esse dado, a funcionalidade depende da lógica de fallback pela convenção de tempo.
- **Impacto de falha**: Se o campo `isAllDay` não for fornecido ou vier como `nil`, o sistema deve aplicar o comportamento padrão (exibir horário), sem degradação da experiência para o usuário. Não há impacto de falha crítico, pois o campo é opcional e existe mecanismo de fallback na lógica do `dateString`.

## Fora do escopo

- **Alteração da tela de listagem de eventos (EventRowView / EventsView)**: A listagem já possui tratamento visual para eventos de dia inteiro por meio do `AllDayEventBannerView`. Qualquer ajuste nessa tela é escopo de outra história.
- **Alteração da lógica de cálculo ou composição do `dateString`**: A propriedade `dateString` do protocolo `BMCalendarEvent` já retorna "All Day" para eventos identificados pela convenção de tempo. Não há necessidade de modificar essa lógica nesta história.
- **Exibição do indicador "All Day" em outros contextos do aplicativo** (ex.: cards da tela Home, widget, mapa): O escopo é restrito à página de detalhe do evento. Outros contextos podem ser tratados em histórias futuras, se necessário.
- **Persistência ou sincronização do campo `isAllDay` com o calendário nativo do dispositivo**: A integração com o `EKEventStore` (EventKit) para salvar eventos no calendário do usuário não é alterada por esta história. O comportamento de adicionar/remover eventos do calendário nativo permanece inalterado.
- **Tratamento de eventos "All Day" com múltiplos dias**: Não há evidência no modelo de dados atual de suporte a eventos de dia inteiro com múltiplos dias de duração. Este cenário está fora do escopo e deve ser tratado em história dedicada caso o requisito surja.
- **Edição ou criação de eventos marcados como "All Day"**: O aplicativo não possui funcionalidade de criação ou edição de eventos. Este cenário é fora do escopo por definição.
- **Mudança no padrão tipográfico ou de cores globais do aplicativo**: Ajustes de design system que vão além do componente de indicador "All Day" na página de detalhe estão fora do escopo desta história.

{{split by token}}
