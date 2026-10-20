# Estufa Inteligente

Projeto acadêmico que distribui as mesmas 12 plantas em quatro zonas e compara dois algoritmos. A aplicação mostra a distribuição em uma estufa visual e atualiza os resultados conforme o cenário de água escolhido.

## Algoritmos

- **Busca Gulosa:** constrói uma distribuição e explora primeiro o estado cuja heurística parece mais promissora. A heurística estima o fitness das plantas já colocadas e o potencial das plantas restantes.
- **Algoritmo Genético:** começa com uma população de distribuições. Seleção por torneio escolhe pais; cruzamento combina partes das soluções; mutação altera alguns destinos; elitismo preserva soluções boas ao longo das gerações.

Os algoritmos usam as mesmas plantas, zonas e função em `src/funcoes/fitness.js`. O fitness soma pontos de temperatura, umidade, luminosidade e água e subtrai penalidades por excesso de consumo e de capacidade. A parcela de água é `min(1, água disponível / consumo necessário)` para zonas com plantas: água suficiente vale um ponto, água insuficiente vale uma fração e mais disponibilidade nunca reduz essa parcela. O excesso de consumo também recebe uma penalidade proporcional.

Fitness é uma medida acadêmica deste modelo. Ele serve para comparar as soluções sob as regras do projeto e não garante crescimento melhor na estufa real.

## Cenários

Os três cenários são derivados das zonas originais; só a água disponível muda:

| Cenário | Zona 1 | Zona 2 | Zona 3 | Zona 4 |
| --- | ---: | ---: | ---: | ---: |
| Normal | 80 L/dia | 60 L/dia | 90 L/dia | 50 L/dia |
| Mais água (+20%) | 96 L/dia | 72 L/dia | 108 L/dia | 60 L/dia |
| Menos água (−20%) | 64 L/dia | 48 L/dia | 72 L/dia | 40 L/dia |

As alterações de 20% são simulações didáticas, não recomendações agrícolas. Ao escolher um cenário, os dois algoritmos executam novamente com os mesmos dados.

## Gráficos

Todos os gráficos são desenhados com Chart.js a partir dos resultados calculados:

1. **Fitness final:** compara as notas; uma nota maior é melhor segundo o modelo.
2. **Tempo:** compara a duração em milissegundos; menor tempo significa execução mais rápida naquela rodada.
3. **Evolução genética:** mostra melhor fitness e fitness médio de cada geração. A curva representa aquela execução e não comprova um ótimo global.
4. **Partes do fitness:** mostra contribuições ambientais e de água e as penalidades de capacidade e consumo.
5. **Capacidade:** compara plantas alocadas e capacidade das quatro zonas.
6. **Água:** compara consumo das plantas e disponibilidade no cenário.

O Algoritmo Genético usa aleatoriedade; distribuição, fitness e tempo podem variar entre execuções. A Busca Gulosa não usa gerações.

## Executar e testar

Requer Node.js e npm. Na pasta do projeto:

```bash
npm install
npm run dev
```

Abra o endereço local indicado pelo Vite. A página executa uma comparação inicial; depois, use os botões para executar um algoritmo ou comparar os dois. Escolher outro cenário também atualiza automaticamente as estufas, métricas, conclusão e gráficos.

Para validar os algoritmos e os três cenários:

```bash
npm test
```

Para gerar os arquivos de produção:

```bash
npm run build
```
