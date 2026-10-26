# Estufa Inteligente

Projeto acadêmico em HTML, CSS e JavaScript puro que distribui as mesmas 12 plantas em quatro zonas. A página compara Busca Gulosa e Algoritmo Genético, mostra as distribuições em estufas e cria gráficos com os resultados calculados.

## Executar

Requer Node.js e npm. Na pasta do projeto:

```bash
npm install
npm run dev
```

Abra o endereço local indicado pelo Vite. Escolha um dos cenários e clique em **Comparar algoritmos**. Cada comparação faz 10 execuções de cada método.

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Algoritmos e avaliação

- **Busca Gulosa:** em cada etapa, avalia uma possibilidade para cada zona e escolhe a maior heurística. A mesma entrada produz a mesma distribuição. O número de estados avaliados é contado pela busca.
- **Algoritmo Genético:** evolui uma população de distribuições por seleção de torneio, cruzamento, mutação e elitismo.

Os dois métodos usam a mesma função em `src/funcoes/fitness.js`. Ela soma as pontuações de temperatura, umidade, luminosidade e água e subtrai as penalidades de capacidade e falta de água. Para as zonas com plantas, a parcela de água é `min(1, água disponível / consumo necessário)`: água suficiente recebe a nota máxima, falta de água recebe uma nota proporcional e aumentar a disponibilidade nunca diminui essa parcela. A penalidade por consumo acima do disponível também cai ou permanece igual quando há mais água.

A seção **Configuração utilizada** na página mostra os parâmetros fixos do Algoritmo Genético: população de 100, 200 gerações, crossover de 80%, mutação de 3%, elitismo de 2 indivíduos e torneio com 3 participantes.

## Cenários fixos

Somente a disponibilidade de água muda entre cenários. Os valores são simulações acadêmicas, não recomendações agrícolas.

| Cenário | Zona 1 | Zona 2 | Zona 3 | Zona 4 | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Normal | 80 L/dia | 60 L/dia | 90 L/dia | 50 L/dia | 280 L/dia |
| Mais água (+20%) | 96 L/dia | 72 L/dia | 108 L/dia | 60 L/dia | 336 L/dia |
| Escassez de água (−80%) | 16 L/dia | 12 L/dia | 18 L/dia | 10 L/dia | 56 L/dia |

A escassez foi ajustada de −70% para −80% após verificar que 30% dos valores originais ainda deixavam as melhores distribuições sem penalidade por falta de água. Em −80%, os 56 L/dia disponíveis ficam abaixo dos 68 L/dia de consumo somado das plantas; assim, a limitação aparece nas avaliações do modelo. As plantas, suas necessidades ambientais e as capacidades das zonas permanecem iguais.

## Resultados e gráficos

Cada comparação calcula o fitness médio, o tempo médio, o melhor fitness e o pior fitness das 10 execuções. As estufas mostram a distribuição de maior fitness entre as 10 rodadas. A Busca Gulosa não usa sorteios e foi verificada como determinística. O Algoritmo Genético é aleatório.

Os gráficos de fitness e tempo mostram médias de 10 execuções. Os gráficos de composição do fitness, ocupação e água usam as melhores distribuições. O histórico genético mostra todas as 200 gerações da execução específica que produziu a melhor distribuição genética.

O fitness é uma nota acadêmica para comparar alternativas segundo as regras do modelo; não garante melhor crescimento na estufa real.
