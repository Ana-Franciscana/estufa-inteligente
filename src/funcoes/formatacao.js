// Funções puras de formatação e conversão de texto/números para a interface.

import { NIVEIS_LUMINOSIDADE } from '../dados/configuracao'

const VAZIO = '—'

export function formatarNumero(valor, casas = 2) {
  if (!Number.isFinite(valor)) return VAZIO
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function formatarPercentual(fracao, casas = 0) {
  if (!Number.isFinite(fracao)) return VAZIO
  return `${(fracao * 100).toLocaleString('pt-BR', { maximumFractionDigits: casas })}%`
}

// Tempo recebido em milissegundos.
export function formatarTempo(milissegundos) {
  if (!Number.isFinite(milissegundos)) return VAZIO
  if (milissegundos >= 1000) return `${formatarNumero(milissegundos / 1000, 2)} s`
  return `${formatarNumero(milissegundos, 2)} ms`
}

export const formatarTemperatura = (valor) => `${valor}°C`
export const formatarUmidade = (valor) => `${valor}%`
export const formatarAgua = (valor) => `${valor} L/dia`

export function rotuloLuminosidade(nivel) {
  return NIVEIS_LUMINOSIDADE[nivel]?.rotulo ?? VAZIO
}

// Campos numéricos de formulário: texto vazio vira '' (inválido na validação), caso contrário número.
export function converterTextoEmNumero(texto) {
  return texto === '' ? '' : Number(texto)
}

export function fracaoParaPercentual(fracao) {
  return Number.isFinite(fracao) ? Number((fracao * 100).toFixed(4)) : ''
}

export function percentualParaFracao(texto) {
  return texto === '' ? '' : Number(texto) / 100
}

// Converte valores de um experimento para o texto exibido (ex.: [0.01, 0.03] -> "1, 3").
export function valoresParaTexto(valores, formato) {
  const exibidos = formato === 'percentual' ? valores.map(fracaoParaPercentual) : valores
  return exibidos.join(', ')
}

// Converte o texto digitado (ex.: "1, 3, 5") em valores. Itens inválidos viram NaN e são rejeitados na validação.
export function textoParaValores(texto, formato) {
  const itens = texto.split(',').map((item) => item.trim()).filter(Boolean).map(Number)
  return formato === 'percentual' ? itens.map((item) => item / 100) : itens
}
