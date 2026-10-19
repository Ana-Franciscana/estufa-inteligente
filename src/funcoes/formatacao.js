// Formata números para a tela e converte os textos dos campos para os valores usados no código.

// A configuração associa cada luminosidade ao rótulo que aparece na tela.
import { NIVEIS_LUMINOSIDADE } from '../dados/configuracao'

// Texto usado quando um valor numérico não pode ser exibido.
const VAZIO = '—'

// Mostra um número no formato brasileiro e com a quantidade de casas pedida.
export function formatarNumero(valor, casas = 2) {
  // Se o valor não for um número finito, mostra um traço em vez de uma conta inválida.
  if (!Number.isFinite(valor)) return VAZIO
  // Usa as regras brasileiras e limita as casas decimais ao número pedido.
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

// Transforma uma fração, como 0.8, em percentual, como 80%.
export function formatarPercentual(fracao, casas = 0) {
  if (!Number.isFinite(fracao)) return VAZIO
  // Multiplica por 100 e acrescenta o símbolo de porcentagem ao texto formatado.
  return `${(fracao * 100).toLocaleString('pt-BR', { maximumFractionDigits: casas })}%`
}

// Mostra tempos longos em segundos e os menores em milissegundos.
export function formatarTempo(milissegundos) {
  if (!Number.isFinite(milissegundos)) return VAZIO
  // A partir de 1000 ms, divide por 1000 e mostra segundos.
  if (milissegundos >= 1000) return `${formatarNumero(milissegundos / 1000, 2)} s`
  // Tempos menores continuam em milissegundos.
  return `${formatarNumero(milissegundos, 2)} ms`
}

// Acrescenta a unidade ao valor sem alterar o número guardado.
export const formatarTemperatura = (valor) => `${valor}°C`
export const formatarUmidade = (valor) => `${valor}%`
export const formatarAgua = (valor) => `${valor} L/dia`

// Procura o rótulo da luminosidade; usa um traço se o nível não for conhecido.
export function rotuloLuminosidade(nivel) {
  // ?. evita acessar rotulo se o nível não existir; ?? escolhe o traço nesse caso.
  return NIVEIS_LUMINOSIDADE[nivel]?.rotulo ?? VAZIO
}

// Mantém o campo vazio como texto vazio para que a validação possa rejeitá-lo.
export function converterTextoEmNumero(texto) {
  // Campos em branco ficam ''; os demais passam pela conversão numérica do JavaScript.
  return texto === '' ? '' : Number(texto)
}

// Converte uma fração para percentual com até quatro casas decimais.
export function fracaoParaPercentual(fracao) {
  // Multiplica por 100 para mostrar 0.8 como 80 e limita ruídos decimais.
  return Number.isFinite(fracao) ? Number((fracao * 100).toFixed(4)) : ''
}

// Divide o percentual digitado por 100 para guardar a taxa como fração.
export function percentualParaFracao(texto) {
  // Um campo vazio continua vazio; por exemplo, 3 passa a ser 0.03.
  return texto === '' ? '' : Number(texto) / 100
}

// Prepara os valores dos cenários para exibição; taxas viram percentuais.
export function valoresParaTexto(valores, formato) {
  // Só converte para percentual quando o formato do experimento pede essa apresentação.
  const exibidos = formato === 'percentual' ? valores.map(fracaoParaPercentual) : valores
  return exibidos.join(', ')
}

// Separa os números digitados por vírgula; percentuais são divididos por 100.
export function textoParaValores(texto, formato) {
  // Separa pela vírgula, tira espaços e ignora itens vazios antes de converter para número.
  const itens = texto.split(',').map((item) => item.trim()).filter(Boolean).map(Number)
  // Em experimento percentual, converte cada número digitado para fração.
  return formato === 'percentual' ? itens.map((item) => item / 100) : itens
}
