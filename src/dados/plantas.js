// Dados iniciais de modelagem. NÃO são dados científicos definitivos:
// serão validados/referenciados durante a elaboração do relatório.
// `quantidade` indica quantas plantas desse tipo existem para distribuir.

// INSTÂNCIA-BASE dos experimentos: as quantidades compõem as 12 plantas individuais.
// Estes dados são fixos durante a execução; alterações futuras devem ser feitas neste arquivo.
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
    quantidade: 2,
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
    quantidade: 2,
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
    quantidade: 2,
  },
  {
    id: 4,
    nome: 'Pimentão',
    temperaturaMinima: 22,
    temperaturaMaxima: 30,
    umidadeMinima: 60,
    umidadeMaxima: 80,
    luminosidade: 'alta',
    consumoAgua: 6,
    quantidade: 2,
  },
  {
    id: 5,
    nome: 'Pepino',
    temperaturaMinima: 20,
    temperaturaMaxima: 28,
    umidadeMinima: 70,
    umidadeMaxima: 90,
    luminosidade: 'alta',
    consumoAgua: 7,
    quantidade: 2,
  },
  {
    id: 6,
    nome: 'Morango',
    temperaturaMinima: 15,
    temperaturaMaxima: 26,
    umidadeMinima: 60,
    umidadeMaxima: 80,
    luminosidade: 'media',
    consumoAgua: 4,
    quantidade: 2,
  },
]
