// As validações devolvem mensagens de erro; uma lista vazia significa que os dados passaram.
// Validar confere os dados de entrada; penalidades do fitness pontuam excessos sem invalidar a solução.

// Estes limites e opções são usados para conferir se os valores escolhidos existem e são aceitos.
import {
  LIMITES_GENETICO,
  METODOS_SELECAO,
  NIVEIS_LUMINOSIDADE,
  TIPOS_EXPERIMENTO,
  ALGORITMOS,
  LIMITE_RODADAS,
} from '../dados/configuracao'
// Usada para contar plantas e conferir a ocupação de cada zona.
import { agruparPlantasPorZona } from './solucao'

// Atalhos para verificar números, inteiros e nomes preenchidos.
const ehNumero = Number.isFinite
const ehInteiro = Number.isInteger
// Um nome precisa ser texto e continuar preenchido depois de remover espaços das pontas.
const nomeValido = (nome) => typeof nome === 'string' && nome.trim().length > 0

// Confere se existe uma zona com o id recebido.
export function zonaExiste(idZona, zonas) {
  return zonas.some((zona) => zona.id === idZona)
}

// Confere se os dados da planta estão preenchidos e dentro das faixas aceitas.
export function validarPlanta(planta) {
  // Acumula todos os problemas da planta para mostrar mais de um de uma vez.
  const erros = []
  // O nome vazio não impede as demais verificações.
  if (!nomeValido(planta.nome)) erros.push('Informe o nome da planta.')
  // Primeiro exige dois números; só depois compara qual temperatura é maior.
  if (!ehNumero(planta.temperaturaMinima) || !ehNumero(planta.temperaturaMaxima)) {
    erros.push('Informe as temperaturas mínima e máxima.')
  } else if (planta.temperaturaMinima > planta.temperaturaMaxima) {
    // Só compara os limites depois de confirmar que ambos são números.
    erros.push('A temperatura mínima não pode ser maior que a máxima.')
  }
  // A umidade também precisa formar uma faixa válida entre 0 e 100.
  if (!ehNumero(planta.umidadeMinima) || !ehNumero(planta.umidadeMaxima)) {
    erros.push('Informe as umidades mínima e máxima.')
  } else if (planta.umidadeMinima > planta.umidadeMaxima) {
    // A faixa precisa começar antes de terminar.
    erros.push('A umidade mínima não pode ser maior que a máxima.')
  } else if (planta.umidadeMinima < 0 || planta.umidadeMaxima > 100) {
    // Esse limite é conferido apenas quando os dois números e a ordem da faixa são válidos.
    erros.push('A umidade deve estar entre 0% e 100%.')
  }
  // O nível informado precisa corresponder a uma opção configurada.
  if (!NIVEIS_LUMINOSIDADE[planta.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  // O consumo pode ser zero, mas não pode ser negativo nem um valor que não seja número.
  if (!ehNumero(planta.consumoAgua) || planta.consumoAgua < 0) erros.push('O consumo de água deve ser um número maior ou igual a zero.')
  // A quantidade precisa ser inteira e contar pelo menos uma planta.
  if (!ehInteiro(planta.quantidade) || planta.quantidade < 1) erros.push('A quantidade deve ser um número inteiro maior ou igual a 1.')
  // Devolve todos os problemas encontrados, para que possam ser apresentados juntos.
  return erros
}

// Confere se os valores ambientais, a água e a capacidade da zona são válidos.
export function validarZona(zona) {
  // Guarda os erros encontrados nos campos da zona.
  const erros = []
  // Confere se a zona tem nome e se a temperatura é um número válido.
  if (!nomeValido(zona.nome)) erros.push('Informe o nome da zona.')
  if (!ehNumero(zona.temperatura)) erros.push('Informe a temperatura da zona.')
  // Umidade deve ser numérica e ficar entre 0 e 100, inclusive.
  if (!ehNumero(zona.umidade) || zona.umidade < 0 || zona.umidade > 100) erros.push('A umidade deve estar entre 0% e 100%.')
  // A luminosidade precisa ser uma das opções que a configuração reconhece.
  if (!NIVEIS_LUMINOSIDADE[zona.luminosidade]) erros.push('Escolha uma luminosidade válida.')
  // Água não pode ser negativa; capacidade precisa ser um inteiro de pelo menos uma vaga.
  if (!ehNumero(zona.aguaDisponivel) || zona.aguaDisponivel < 0) erros.push('A água disponível deve ser um número maior ou igual a zero.')
  if (!ehInteiro(zona.capacidade) || zona.capacidade < 1) erros.push('A capacidade deve ser um número inteiro maior ou igual a 1.')
  return erros
}

// Garante que exista pelo menos uma planta e uma zona antes de iniciar a busca.
export function validarProblema(plantasIndividuais, zonas) {
  // Problema guarda erros gerais que não pertencem a uma planta ou zona específica.
  const erros = []
  if (zonas.length === 0) erros.push('Cadastre ao menos uma zona.')
  if (plantasIndividuais.length === 0) erros.push('Cadastre ao menos uma planta.')
  return erros
}

// Avisa quando há mais plantas do que vagas; esse aviso não bloqueia a execução.
export function gerarAvisosProblema(plantasIndividuais, zonas) {
  // Soma as capacidades para descobrir quantas plantas cabem no total.
  const vagas = zonas.reduce((total, zona) => total + zona.capacidade, 0)
  if (plantasIndividuais.length > vagas) {
    return [`Há ${plantasIndividuais.length} plantas para ${vagas} vagas: parte das plantas excederá a capacidade das zonas.`]
  }
  // Sem excesso de plantas, devolve uma lista vazia de avisos.
  return []
}

// Confere se há um gene por planta e se cada gene indica uma zona existente.
export function validarSolucao(solucao, plantasIndividuais, zonas) {
  // A solução precisa ser uma lista antes de conferir seu tamanho e os ids nela guardados.
  if (!Array.isArray(solucao)) return ['A solução deve ser uma lista de zonas.']
  const erros = []
  // Há um gene esperado para cada planta individual.
  if (solucao.length !== plantasIndividuais.length) {
    erros.push(`A solução tem ${solucao.length} genes, mas existem ${plantasIndividuais.length} plantas.`)
  }
  // Separa os genes que apontam para zonas que não estão na lista.
  const invalidos = solucao.filter((gene) => !zonaExiste(gene, zonas))
  // Registra quantos genes apontam para destinos que não existem.
  if (invalidos.length > 0) erros.push(`A solução contém ${invalidos.length} gene(s) apontando para zonas inexistentes.`)
  return erros
}

// Devolve as zonas que passaram da capacidade, incluindo quantas plantas excederam o limite.
export function verificarCapacidade(solucao, plantasIndividuais, zonas) {
  // Reaproveita o agrupamento e mantém somente zonas cuja ocupação passou do limite.
  return agruparPlantasPorZona(solucao, plantasIndividuais, zonas)
    .filter((grupo) => grupo.ocupacao > grupo.zona.capacidade)
    .map((grupo) => ({ idZona: grupo.zona.id, nome: grupo.zona.nome, excesso: grupo.ocupacao - grupo.zona.capacidade }))
}

function validarLimite(valor, { rotulo, minimo, maximo }, ehTaxa, inteiro) {
  // Para taxas, mostra os limites como porcentagens; os valores internos continuam sendo frações.
  const faixa = ehTaxa ? `${minimo * 100}% e ${maximo * 100}%` : `${minimo} e ${maximo}`
  const tipoValido = inteiro ? ehInteiro(valor) : ehNumero(valor)
  // Rejeita valores que não sejam do tipo pedido ou estejam fora dos limites inclusivos.
  if (!tipoValido || valor < minimo || valor > maximo) {
    return `${rotulo} deve ser ${inteiro ? 'um número inteiro' : 'um número'} entre ${faixa}.`
  }
  // null indica que este parâmetro passou pela validação.
  return null
}

export function validarParametrosGenetico(configuracao) {
  const limites = LIMITES_GENETICO
  // Confere quantas soluções haverá em cada geração e quantas gerações serão executadas.
  // As taxas são frações internas; elitismo é uma quantidade inteira de indivíduos.
  const erros = [
    validarLimite(configuracao.tamanhoPopulacao, limites.tamanhoPopulacao, false, true),
    validarLimite(configuracao.numeroGeracoes, limites.numeroGeracoes, false, true),
    validarLimite(configuracao.taxaCrossover, limites.taxaCrossover, true, false),
    validarLimite(configuracao.taxaMutacao, limites.taxaMutacao, true, false),
    validarLimite(configuracao.elitismo, limites.elitismo, false, true),
  ].filter(Boolean)

  // A checagem acima avalia os limites de cada campo; esta compara elitismo com a população.
  // Não é possível preservar mais indivíduos do que existem na população.
  if (ehInteiro(configuracao.elitismo) && configuracao.elitismo > configuracao.tamanhoPopulacao) {
    erros.push('O elitismo não pode ser maior que o tamanho da população.')
  }
  if (!METODOS_SELECAO.some((metodo) => metodo.id === configuracao.tipoSelecao)) {
    erros.push('Escolha um método de seleção válido.')
  }
  // Devolve juntos os problemas dos números e do método de seleção.
  return erros
}

// A Busca Gulosa não recebe parâmetros ajustáveis; por isso, não há erro a apontar aqui.
export function validarParametrosGulosa() {
  return []
}

export function validarConfiguracao(tipo, configuracao) {
  // Escolhe a validação conforme o algoritmo informado e rejeita nomes desconhecidos.
  if (tipo === ALGORITMOS.genetico.id) return validarParametrosGenetico(configuracao)
  if (tipo === ALGORITMOS.gulosa.id) return validarParametrosGulosa(configuracao)
  return [`Algoritmo desconhecido: ${tipo}.`]
}

export function validarExperimento({ tipoExperimento, valores, rodadas }) {
  // Procura a definição do experimento antes de conferir seus valores.
  const tipo = TIPOS_EXPERIMENTO[tipoExperimento]
  if (!tipo) return ['Escolha um tipo de experimento válido.']
  // Começa a lista de erros depois de confirmar que o tipo de experimento existe.
  const erros = []
  // Rodadas precisa ser inteiro e respeitar o mínimo e máximo permitido pelo projeto.
  if (!ehInteiro(rodadas) || rodadas < 1 || rodadas > LIMITE_RODADAS) {
    erros.push(`O número de repetições deve ser um inteiro entre 1 e ${LIMITE_RODADAS}.`)
  }
  // Só exige valores quando o experimento compara um parâmetro específico.
  if (tipo.parametro) {
    // Um experimento de parâmetro precisa de pelo menos um valor numérico para testar.
    if (valores.length === 0) erros.push('Informe ao menos um valor para o experimento.')
    // some detecta se qualquer item não é número; todos precisam ser numéricos.
    if (valores.some((valor) => !ehNumero(valor))) erros.push('Os valores devem ser números separados por vírgula.')
  }
  // A lista permite que a interface apresente todos os problemas da solicitação.
  return erros
}
