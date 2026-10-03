// Dados iniciais de modelagem. NÃO são dados científicos definitivos:
// serão validados/referenciados durante a elaboração do relatório.
// `quantidade` indica quantas plantas desse tipo existem para distribuir.

export const PLANTAS_INICIAIS = [
  {
    id: 1,
    nome: 'Tomate',
    temperaturaMinima: 22,
    temperaturaMaxima: 28,
    umidadeMinima: 70,
    umidadeMaxima: 85,
    luminosidade: 'alta',
    consumoAgua: 8,
    quantidade: 6,
  },
  {
    id: 2,
    nome: 'Alface',
    temperaturaMinima: 18,
    temperaturaMaxima: 24,
    umidadeMinima: 70,
    umidadeMaxima: 90,
    luminosidade: 'media',
    consumoAgua: 5,
    quantidade: 6,
  },
  {
    id: 3,
    nome: 'Manjericão',
    temperaturaMinima: 20,
    temperaturaMaxima: 28,
    umidadeMinima: 50,
    umidadeMaxima: 70,
    luminosidade: 'alta',
    consumoAgua: 4,
    quantidade: 5,
  },
]
