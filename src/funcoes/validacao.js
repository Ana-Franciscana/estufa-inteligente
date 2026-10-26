//A UNICA FUNÇÃO DESSE ARQUIVO É BARRAR DADOS IMPOSSÍVEIS OU MAL FORMATADOS ANTES QUE ELES
//ENTREM NOS MOTORES DE CÁLCULO E TRAVEL O PROGRAMA COM UMA TELA DE ERRO


import { NIVEIS_LUMINOSIDADE } from '../dados/configuracao.js'

const ehNumero = Number.isFinite
const ehInteiro = Number.isInteger
const nomeValido = (nome) => typeof nome === 'string' && nome.trim().length > 0

export function zonaExiste(idZona, zonas) {
  return zonas.some((zona) => zona.id === idZona)
}


//Analisa a ficha técnica de uma planta cadastrada e procura por erros absurdos.
export function validarPlanta(planta) {
  const erros = []
  if (!nomeValido(planta.nome)) erros.push('Informe o nome da planta.')
  if (!ehNumero(planta.temperaturaMinima) || !ehNumero(planta.temperaturaMaxima)) {
    erros.push('Informe as temperaturas mínima e máxima.')
  } else if (planta.temperaturaMinima > planta.temperaturaMaxima) {
    erros.push('A temperatura mínima não pode ser maior que a máxima.')
  }
  if (!ehNumero(planta.umidadeMinima) || !ehNumero(planta.umidadeMaxima)) {
    erros.push('Informe as umidades mínima e máxima.')
  } else if (planta.umidadeMinima > planta.umidadeMaxima || planta.umidadeMinima < 0 || planta.umidadeMaxima > 100) {
    erros.push('Informe uma faixa de umidade válida entre 0% e 100%.')
  }
  if (!NIVEIS_LUMINOSIDADE[planta.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  if (!ehNumero(planta.consumoAgua) || planta.consumoAgua < 0) erros.push('O consumo de água deve ser maior ou igual a zero.')
  if (!ehInteiro(planta.quantidade) || planta.quantidade < 1) erros.push('A quantidade deve ser um número inteiro maior ou igual a 1.')
  return erros
}




// Faz a mesma checagem de segurança, mas olhando para as propriedades físicas da estufa.
export function validarZona(zona) {
  const erros = []
  if (!nomeValido(zona.nome)) erros.push('Informe o nome da zona.')
  if (!ehNumero(zona.temperatura)) erros.push('Informe a temperatura da zona.')
  if (!ehNumero(zona.umidade) || zona.umidade < 0 || zona.umidade > 100) erros.push('A umidade deve estar entre 0% e 100%.')
  if (!NIVEIS_LUMINOSIDADE[zona.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  if (!ehNumero(zona.aguaDisponivel) || zona.aguaDisponivel < 0) erros.push('A água disponível deve ser maior ou igual a zero.')
  if (!ehInteiro(zona.capacidade) || zona.capacidade < 1) erros.push('A capacidade deve ser um número inteiro maior ou igual a 1.')
  return erros
}





//Garante que o jogo da distribuição tenha peças suficientes para começar.
export function validarProblema(plantas, zonas) {
  const erros = []
  if (!Array.isArray(plantas) || plantas.length === 0) erros.push('Cadastre ao menos uma planta.')
  if (!Array.isArray(zonas) || zonas.length === 0) erros.push('Cadastre ao menos uma zona.')
  return erros
}





//• Ela inspeciona o vetor final de respostas gerado pela Busca Gulosa ou pelo Algoritmo Genético.
export function validarSolucao(solucao, plantas, zonas) {
  if (!Array.isArray(solucao)) return ['A solução deve ser uma lista de zonas.']
  const erros = []
  if (solucao.length !== plantas.length) erros.push(`A solução tem ${solucao.length} genes, mas existem ${plantas.length} plantas.`)
  if (solucao.some((gene) => !zonaExiste(gene, zonas))) erros.push('A solução contém genes apontando para zonas inexistentes.')
  return erros
}
