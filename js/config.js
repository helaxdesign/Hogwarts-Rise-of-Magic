/*
 * Configuração do Hogwarts: Rise of Magic
 *
 * SEM Firebase (firebase: null): o site funciona em "Modo local" — os dados ficam
 * salvos apenas no navegador de quem está usando. Bom para testar o visual.
 *
 * COM Firebase: todos os jogadores e a staff compartilham os mesmos pontos,
 * solicitações e treinos. Veja o README.md para o passo a passo.
 */
window.HRM_CONFIG = {
  firebase: null,
  // Exemplo:
  // firebase: {
  //   apiKey: "....",
  //   authDomain: "seu-projeto.firebaseapp.com",
  //   projectId: "seu-projeto",
  //   storageBucket: "seu-projeto.appspot.com",
  //   messagingSenderId: "....",
  //   appId: "...."
  // },

  // Limite de treinos por personagem por dia
  trainingsPerDay: 2,

  // Tipos de perícia: caracteres mínimos de cena e pontos de perícia (PP)
  skillTypes: {
    normal:    { label: "Perícia Normal",    chars: 1500, pp: 20 },
    talento:   { label: "Perícia Talento",   chars: 750,  pp: 25 },
    inaptidao: { label: "Perícia Inaptidão", chars: 3000, pp: 15 }
  }
};
