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
  // Projeto Firebase "hogwartsriseofmagic" (estes valores são públicos por natureza;
  // a proteção dos dados vem das regras em firestore.rules e do login da staff)
  firebase: {
    apiKey: "AIzaSyDfxHznnJotKA3CtZFmple7Wj7RVzMD9q8",
    authDomain: "hogwartsriseofmagic.firebaseapp.com",
    projectId: "hogwartsriseofmagic",
    storageBucket: "hogwartsriseofmagic.firebasestorage.app",
    messagingSenderId: "225542837655",
    appId: "1:225542837655:web:4210b4a7c38429334ea0d2"
  },

  // Limite de treinos por personagem por dia
  trainingsPerDay: 2,

  // Tipos de perícia: caracteres mínimos de cena e pontos de perícia (PP)
  skillTypes: {
    normal:    { label: "Perícia Normal",    chars: 1500, pp: 20 },
    talento:   { label: "Perícia Talento",   chars: 750,  pp: 25 },
    inaptidao: { label: "Perícia Inaptidão", chars: 3000, pp: 15 }
  },

  // Plataforma de Trabalhos: matérias (o "slug" é o identificador usado no banco e nas regras)
  subjects: [
    { slug: "feiticos",        name: "Feitiços" },
    { slug: "transfiguracao",  name: "Transfiguração" },
    { slug: "pocoes",          name: "Poções" },
    { slug: "dcat",            name: "Defesa Contra as Artes das Trevas" },
    { slug: "herbologia",      name: "Herbologia" },
    { slug: "historia",        name: "História da Magia" },
    { slug: "astronomia",      name: "Astronomia" },
    { slug: "aritmancia",      name: "Aritmancia" },
    { slug: "adivinhacao",     name: "Adivinhação" },
    { slug: "runas",           name: "Runas Antigas" },
    { slug: "trouxas",         name: "Estudos dos Trouxas" },
    { slug: "criaturas",       name: "Trato de Criaturas Mágicas" },
    { slug: "varinhologia",    name: "Varinhologia" },
    { slug: "alquimia",        name: "Alquimia" },
    { slug: "medibruxaria",    name: "Medibruxaria" },
    { slug: "duelos",          name: "Duelos" },
    { slug: "voo",             name: "Voo" }
  ],

  // Prazos dos trabalhos (em dias, contados a partir da data em que o trabalho foi passado).
  // Atenção: o firestore.rules também confere "7 dias de atraso" e "50%"; se mudar aqui, mude lá.
  homework: { onTimeDays: 7, lateDays: 7, latePercent: 50 }
};
