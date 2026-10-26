import { ZONAS_INICIAIS } from './dados/zonas.js'

// Cria cada simulação a partir das mesmas zonas. Só muda a água disponível.
function criarCenario(id, nome, fatorAgua, descricao) {
  return {
    id,
    nome,
    fatorAgua,
    descricao,
    zonas: ZONAS_INICIAIS.map((zona) => ({
      ...zona,
      aguaDisponivel: zona.aguaDisponivel * fatorAgua,
    })),
  }
}

export const CENARIOS = {
  normal: criarCenario(
    'normal',
    'Normal',
    1,
    'Este é o cenário de referência do projeto. Utilizamos as condições originais da estufa para observar como os algoritmos distribuem as plantas. Os resultados deste cenário serão utilizados como base para comparar as outras simulações.',
  ),
  maisAgua: criarCenario(
    'maisAgua',
    'Mais água (+20%)',
    1.2,
    'Nesta simulação, aumentamos em 20% a quantidade de água disponível em todas as zonas. Isso permite observar como os algoritmos se comportam quando a estufa tem mais água. As plantas, suas necessidades, a temperatura, a umidade, a luminosidade e a capacidade das zonas permanecem iguais.',
  ),
  menosAgua: criarCenario(
    'menosAgua',
    'Escassez de água (−80%)',
    0.2,
    'Nesta simulação acadêmica, resta 20% da água original em cada zona. O total é 56 L/dia, abaixo dos 68 L/dia de consumo das 12 plantas, para que a limitação de água apareça no modelo. Plantas, condições e capacidades continuam iguais.',
  ),
}
