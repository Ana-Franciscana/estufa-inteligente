# Estufa Inteligente

Projeto desenvolvido para a disciplina de **Sistemas Inteligentes**, com o objetivo de aplicar algoritmos de busca e otimização em um problema prático.

A aplicação simula uma estufa dividida em diferentes zonas, cada uma com características ambientais próprias. O sistema utiliza algoritmos de Inteligência Artificial para encontrar uma distribuição adequada das plantas entre essas zonas.

---

## Objetivo

Desenvolver uma aplicação capaz de otimizar a organização das plantas dentro de uma estufa, considerando características como:

- temperatura;
- umidade;
- iluminação;
- disponibilidade de água;
- capacidade das zonas.

O projeto tem como foco principal a aplicação e avaliação do **Algoritmo Genético**, utilizando a **Busca Gulosa** como método de comparação.

---

## Sobre o projeto

A Estufa Inteligente representa um cenário em que diferentes plantas possuem necessidades específicas de cultivo e as zonas da estufa apresentam diferentes condições ambientais.

O sistema deverá encontrar uma organização das plantas que maximize a adequação das condições de cultivo e respeite as limitações dos recursos disponíveis.

A qualidade de cada solução será avaliada por meio de uma função de **fitness**, considerando fatores como:

- adequação da temperatura;
- adequação da umidade;
- adequação da iluminação;
- consumo de água;
- capacidade das zonas.

---

## Algoritmos

### Algoritmo Genético

O Algoritmo Genético será o principal método utilizado no projeto.

Serão aplicados os seguintes conceitos:

- população;
- indivíduos;
- cromossomos;
- fitness;
- seleção por torneio;
- crossover de um ponto;
- mutação;
- elitismo;
- gerações;
- critérios de parada.

Os principais parâmetros que poderão ser configurados nos experimentos são:

- tamanho da população;
- número de gerações;
- taxa de crossover;
- taxa de mutação;
- quantidade de indivíduos preservados pelo elitismo.

### Busca Gulosa

A Busca Gulosa será utilizada como algoritmo de comparação.

A estratégia consiste em escolher, para cada planta, a zona que apresenta a melhor adequação naquele momento, considerando as condições disponíveis.

A comparação permitirá analisar as diferenças entre uma estratégia de decisão local e uma estratégia evolutiva.

---

## Experimentos

O sistema será utilizado para realizar experimentos variando os parâmetros dos algoritmos.

Entre os testes previstos estão:

### Taxa de mutação

- 1%
- 3%
- 5%
- 10%

### Tamanho da população

- 20
- 50
- 100
- 200

Os experimentos poderão ser executados mais de uma vez para analisar a variação dos resultados.

---

## 📈 Métricas

Os resultados serão avaliados utilizando métricas como:

- fitness da solução;
- fitness médio;
- melhor fitness;
- tempo de execução;
- variação dos resultados entre execuções;
- evolução do fitness ao longo das gerações.

Os resultados serão apresentados por meio de tabelas e gráficos.

---
