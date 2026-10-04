// Configurações centrais da aplicação.
// Todos os valores "de modelagem" ficam aqui para serem ajustados em um único lugar.

export const NOME_PROJETO = 'Estufa Inteligente'

export const ITENS_NAVEGACAO = [
  { id: 'estufa', rotulo: 'Estufa' },
  { id: 'otimizacao', rotulo: 'Otimização' },
  { id: 'experimentos', rotulo: 'Experimentos' },
]

// Luminosidade é uma variável categórica; o valor numérico permite calcular a distância entre níveis.
export const NIVEIS_LUMINOSIDADE = {
  baixa: { valor: 1, rotulo: 'baixa' },
  media: { valor: 2, rotulo: 'média' },
  alta: { valor: 3, rotulo: 'alta' },
}

export const ALGORITMOS = {
  genetico: {
    id: 'genetico',
    nome: 'Algoritmo Genético',
    icone: '🧬',
    descricao: 'Evolui uma população de distribuições por seleção, crossover e mutação.',
    statusPendente: 'Preparado para implementação',
  },
  gulosa: {
    id: 'gulosa',
    nome: 'Busca Gulosa',
    icone: '🔎',
    descricao: 'Constrói a distribuição escolhendo, passo a passo, a melhor opção local.',
    statusPendente: 'Preparada para implementação',
  },
}

export const METODOS_SELECAO = [{ id: 'torneio', rotulo: 'Torneio' }]

// Convenção adotada: taxas são guardadas como fração (0 a 1) e exibidas como porcentagem na interface.
export const PARAMETROS_PADRAO_GENETICO = {
  tamanhoPopulacao: 100,
  numeroGeracoes: 200,
  taxaCrossover: 0.8,
  taxaMutacao: 0.03,
  elitismo: 2,
  tipoSelecao: 'torneio',
}

// A Busca Gulosa ainda não tem parâmetros definidos (serão decididos na implementação).
export const PARAMETROS_PADRAO_GULOSA = {}

export const LIMITES_GENETICO = {
  tamanhoPopulacao: { rotulo: 'Tamanho da população', minimo: 2, maximo: 1000 },
  numeroGeracoes: { rotulo: 'Número de gerações', minimo: 1, maximo: 5000 },
  taxaCrossover: { rotulo: 'Taxa de crossover', minimo: 0, maximo: 1 },
  taxaMutacao: { rotulo: 'Taxa de mutação', minimo: 0, maximo: 1 },
  elitismo: { rotulo: 'Elitismo', minimo: 0, maximo: 1000 },
}

// Parâmetros da função de fitness (versão inicial, a serem refinados e justificados no relatório).
export const PARAMETROS_FITNESS = {
  toleranciaTemperatura: 5, // °C além do intervalo ideal em que a pontuação cai a zero
  toleranciaUmidade: 20, // pontos percentuais além do intervalo ideal em que a pontuação cai a zero
  pesos: { temperatura: 0.4, umidade: 0.3, luminosidade: 0.3 }, // por planta
  pesoAgua: 1, // por zona
  penalidadeCapacidade: 2, // por planta além da capacidade
  penalidadeAgua: 0.5, // por litro/dia acima do disponível
}

export const TIPOS_EXPERIMENTO = {
  mutacao: {
    id: 'mutacao',
    rotulo: 'Influência da taxa de mutação',
    parametro: 'taxaMutacao',
    rotuloEixo: 'Taxa de mutação',
    formato: 'percentual',
    unidadeValores: '%',
    valoresPadrao: [0.01, 0.03, 0.05, 0.1],
    pergunta: 'Como a taxa de mutação influencia o desempenho do AG?',
    descricao: 'Este experimento analisa como diferentes taxas de mutação influenciam a qualidade e o tempo de execução do Algoritmo Genético. As plantas, zonas e demais parâmetros permanecem constantes.',
    explicacaoParametro: 'A taxa de mutação representa a probabilidade de alteração de um gene durante a etapa de mutação.',
  },
  populacao: {
    id: 'populacao',
    rotulo: 'Influência do tamanho da população',
    parametro: 'tamanhoPopulacao',
    rotuloEixo: 'Tamanho da população',
    formato: 'inteiro',
    unidadeValores: 'indivíduos',
    valoresPadrao: [20, 50, 100, 200],
    pergunta: 'Como o tamanho da população influencia o desempenho do AG?',
    descricao: 'Este experimento analisa como diferentes tamanhos de população influenciam a qualidade e o tempo de execução do Algoritmo Genético.',
    explicacaoParametro: 'O tamanho da população representa quantos indivíduos compõem cada geração do Algoritmo Genético.',
  },
  algoritmos: {
    id: 'algoritmos',
    rotulo: 'Comparação entre Algoritmo Genético e Busca Gulosa',
    parametro: null,
    rotuloEixo: 'Algoritmo',
    formato: null,
    valoresPadrao: ['genetico', 'gulosa'],
    pergunta: 'Como AG e Busca Gulosa se comportam diante da mesma estufa?',
    descricao: 'Este experimento compara os dois algoritmos utilizando exatamente a mesma instância da estufa, com as mesmas plantas, zonas e função de avaliação.',
  },
}

export const RODADAS_PADRAO = 10
export const LIMITE_RODADAS = 100

// Cores usadas nos gráficos (o Recharts precisa de valores literais).
export const CORES_GRAFICO = {
  grade: '#E6DECE',
  principal: '#4A6838',
  secundaria: '#B8764F',
  apoio: '#B7CC9A',
}
