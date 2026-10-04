// Validações. Convenção: as funções `validar*` devolvem uma lista de mensagens de erro
// (lista vazia = válido), para que a interface possa mostrá-las diretamente.

import {
  LIMITES_GENETICO,
  METODOS_SELECAO,
  NIVEIS_LUMINOSIDADE,
  TIPOS_EXPERIMENTO,
  ALGORITMOS,
  LIMITE_RODADAS,
} from '../dados/configuracao'
import { agruparPlantasPorZona } from './solucao'

const ehNumero = Number.isFinite
const ehInteiro = Number.isInteger
const nomeValido = (nome) => typeof nome === 'string' && nome.trim().length > 0

export function zonaExiste(idZona, zonas) {
  return zonas.some((zona) => zona.id === idZona)
}

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
  } else if (planta.umidadeMinima > planta.umidadeMaxima) {
    erros.push('A umidade mínima não pode ser maior que a máxima.')
  } else if (planta.umidadeMinima < 0 || planta.umidadeMaxima > 100) {
    erros.push('A umidade deve estar entre 0% e 100%.')
  }
  if (!NIVEIS_LUMINOSIDADE[planta.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  if (!ehNumero(planta.consumoAgua) || planta.consumoAgua < 0) erros.push('O consumo de água deve ser um número maior ou igual a zero.')
  if (!ehInteiro(planta.quantidade) || planta.quantidade < 1) erros.push('A quantidade deve ser um número inteiro maior ou igual a 1.')
  return erros
}

export function validarZona(zona) {
  const erros = []
  if (!nomeValido(zona.nome)) erros.push('Informe o nome da zona.')
  if (!ehNumero(zona.temperatura)) erros.push('Informe a temperatura da zona.')
  if (!ehNumero(zona.umidade) || zona.umidade < 0 || zona.umidade > 100) erros.push('A umidade deve estar entre 0% e 100%.')
  if (!NIVEIS_LUMINOSIDADE[zona.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  if (!ehNumero(zona.aguaDisponivel) || zona.aguaDisponivel < 0) erros.push('A água disponível deve ser um número maior ou igual a zero.')
  if (!ehInteiro(zona.capacidade) || zona.capacidade < 1) erros.push('A capacidade deve ser um número inteiro maior ou igual a 1.')
  return erros
}

// Verifica o problema como um todo (catálogo de plantas + zonas) antes de executar um algoritmo.
export function validarProblema(plantasIndividuais, zonas) {
  const erros = []
  if (zonas.length === 0) erros.push('Cadastre ao menos uma zona.')
  if (plantasIndividuais.length === 0) erros.push('Cadastre ao menos uma planta.')
  return erros
}

// Situações que não impedem a execução, mas merecem atenção.
export function gerarAvisosProblema(plantasIndividuais, zonas) {
  const vagas = zonas.reduce((total, zona) => total + zona.capacidade, 0)
  if (plantasIndividuais.length > vagas) {
    return [`Há ${plantasIndividuais.length} plantas para ${vagas} vagas: parte das plantas excederá a capacidade das zonas.`]
  }
  return []
}

// Verifica a estrutura da solução (tamanho e genes). A capacidade é verificada à parte.
export function validarSolucao(solucao, plantasIndividuais, zonas) {
  if (!Array.isArray(solucao)) return ['A solução deve ser uma lista de zonas.']
  const erros = []
  if (solucao.length !== plantasIndividuais.length) {
    erros.push(`A solução tem ${solucao.length} genes, mas existem ${plantasIndividuais.length} plantas.`)
  }
  const invalidos = solucao.filter((gene) => !zonaExiste(gene, zonas))
  if (invalidos.length > 0) erros.push(`A solução contém ${invalidos.length} gene(s) apontando para zonas inexistentes.`)
  return erros
}

// Zonas que receberam mais plantas do que comportam: [{ idZona, nome, excesso }]
export function verificarCapacidade(solucao, plantasIndividuais, zonas) {
  return agruparPlantasPorZona(solucao, plantasIndividuais, zonas)
    .filter((grupo) => grupo.ocupacao > grupo.zona.capacidade)
    .map((grupo) => ({ idZona: grupo.zona.id, nome: grupo.zona.nome, excesso: grupo.ocupacao - grupo.zona.capacidade }))
}

function validarLimite(valor, { rotulo, minimo, maximo }, ehTaxa, inteiro) {
  const faixa = ehTaxa ? `${minimo * 100}% e ${maximo * 100}%` : `${minimo} e ${maximo}`
  const tipoValido = inteiro ? ehInteiro(valor) : ehNumero(valor)
  if (!tipoValido || valor < minimo || valor > maximo) {
    return `${rotulo} deve ser ${inteiro ? 'um número inteiro' : 'um número'} entre ${faixa}.`
  }
  return null
}

export function validarParametrosGenetico(configuracao) {
  const limites = LIMITES_GENETICO
  const erros = [
    validarLimite(configuracao.tamanhoPopulacao, limites.tamanhoPopulacao, false, true),
    validarLimite(configuracao.numeroGeracoes, limites.numeroGeracoes, false, true),
    validarLimite(configuracao.taxaCrossover, limites.taxaCrossover, true, false),
    validarLimite(configuracao.taxaMutacao, limites.taxaMutacao, true, false),
    validarLimite(configuracao.elitismo, limites.elitismo, false, true),
  ].filter(Boolean)

  if (ehInteiro(configuracao.elitismo) && configuracao.elitismo > configuracao.tamanhoPopulacao) {
    erros.push('O elitismo não pode ser maior que o tamanho da população.')
  }
  if (!METODOS_SELECAO.some((metodo) => metodo.id === configuracao.tipoSelecao)) {
    erros.push('Escolha um método de seleção válido.')
  }
  return erros
}

// A Busca Gulosa ainda não possui parâmetros; a validação será estendida junto com a implementação.
export function validarParametrosGulosa() {
  return []
}

export function validarConfiguracao(tipo, configuracao) {
  if (tipo === ALGORITMOS.genetico.id) return validarParametrosGenetico(configuracao)
  if (tipo === ALGORITMOS.gulosa.id) return validarParametrosGulosa(configuracao)
  return [`Algoritmo desconhecido: ${tipo}.`]
}

export function validarExperimento({ tipoExperimento, valores, rodadas }) {
  const tipo = TIPOS_EXPERIMENTO[tipoExperimento]
  if (!tipo) return ['Escolha um tipo de experimento válido.']
  const erros = []
  if (!ehInteiro(rodadas) || rodadas < 1 || rodadas > LIMITE_RODADAS) {
    erros.push(`O número de repetições deve ser um inteiro entre 1 e ${LIMITE_RODADAS}.`)
  }
  if (tipo.parametro) {
    if (valores.length === 0) erros.push('Informe ao menos um valor para o experimento.')
    if (valores.some((valor) => !ehNumero(valor))) erros.push('Os valores devem ser números separados por vírgula.')
  }
  return erros
}
