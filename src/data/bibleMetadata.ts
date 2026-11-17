import { BookMeta, HighlightColor, ReadingPlan, TranslationId } from '../types/bible';

export interface TranslationInfo {
  id: TranslationId;
  shortName: string;
  fullName: string;
  description: string;
}

export const TRANSLATIONS: Record<TranslationId, TranslationInfo> = {
  aa: {
    id: 'aa',
    shortName: 'AA',
    fullName: 'Almeida Atualizada',
    description: 'Edição revisada de João Ferreira de Almeida com linguagem fluida e clássica.',
  },
  acf: {
    id: 'acf',
    shortName: 'ACF',
    fullName: 'Almeida Corrigida Fiel',
    description: 'Tradução fiel ao Texto Recebido, preservando a cadência tradicional.',
  },
};

export const HIGHLIGHT_SWATCHES: {
  id: HighlightColor;
  label: string;
  dotColor: string;
  bgVar: string;
}[] = [
  { id: 'amber', label: 'Âmbar', dotColor: '#D99B26', bgVar: 'var(--hl-amber)' },
  { id: 'sage', label: 'Sálvia', dotColor: '#4D7C5B', bgVar: 'var(--hl-sage)' },
  { id: 'lapis', label: 'Lápis', dotColor: '#315696', bgVar: 'var(--hl-lapis)' },
  { id: 'terracotta', label: 'Terracota', dotColor: '#A8482A', bgVar: 'var(--hl-terracotta)' },
];

export const BOOK_METADATA: BookMeta[] = [
  { index: 0, abbrev: 'gn', name: 'Gênesis', testament: 'AT', division: 'Pentateuco', chaptersCount: 50, aliases: ['genesis', 'gn', 'gen'] },
  { index: 1, abbrev: 'ex', name: 'Êxodo', testament: 'AT', division: 'Pentateuco', chaptersCount: 40, aliases: ['exodo', 'ex'] },
  { index: 2, abbrev: 'lv', name: 'Levítico', testament: 'AT', division: 'Pentateuco', chaptersCount: 27, aliases: ['levitico', 'lv', 'lev'] },
  { index: 3, abbrev: 'nm', name: 'Números', testament: 'AT', division: 'Pentateuco', chaptersCount: 36, aliases: ['numeros', 'nm', 'num'] },
  { index: 4, abbrev: 'dt', name: 'Deuteronômio', testament: 'AT', division: 'Pentateuco', chaptersCount: 34, aliases: ['deuteronomio', 'dt', 'deut'] },
  { index: 5, abbrev: 'js', name: 'Josué', testament: 'AT', division: 'Históricos', chaptersCount: 24, aliases: ['josue', 'js', 'jos'] },
  { index: 6, abbrev: 'jz', name: 'Juízes', testament: 'AT', division: 'Históricos', chaptersCount: 21, aliases: ['juizes', 'jz'] },
  { index: 7, abbrev: 'rt', name: 'Rute', testament: 'AT', division: 'Históricos', chaptersCount: 4, aliases: ['rute', 'rt'] },
  { index: 8, abbrev: '1sm', name: '1 Samuel', testament: 'AT', division: 'Históricos', chaptersCount: 31, aliases: ['1 samuel', '1samuel', '1sm', '1 sm'] },
  { index: 9, abbrev: '2sm', name: '2 Samuel', testament: 'AT', division: 'Históricos', chaptersCount: 24, aliases: ['2 samuel', '2samuel', '2sm', '2 sm'] },
  { index: 10, abbrev: '1rs', name: '1 Reis', testament: 'AT', division: 'Históricos', chaptersCount: 22, aliases: ['1 reis', '1reis', '1rs', '1 rs'] },
  { index: 11, abbrev: '2rs', name: '2 Reis', testament: 'AT', division: 'Históricos', chaptersCount: 25, aliases: ['2 reis', '2reis', '2rs', '2 rs'] },
  { index: 12, abbrev: '1cr', name: '1 Crônicas', testament: 'AT', division: 'Históricos', chaptersCount: 29, aliases: ['1 cronicas', '1cronicas', '1cr', '1 cr'] },
  { index: 13, abbrev: '2cr', name: '2 Crônicas', testament: 'AT', division: 'Históricos', chaptersCount: 36, aliases: ['2 cronicas', '2cronicas', '2cr', '2 cr'] },
  { index: 14, abbrev: 'ed', name: 'Esdras', testament: 'AT', division: 'Históricos', chaptersCount: 10, aliases: ['esdras', 'ed'] },
  { index: 15, abbrev: 'ne', name: 'Neemias', testament: 'AT', division: 'Históricos', chaptersCount: 13, aliases: ['neemias', 'ne'] },
  { index: 16, abbrev: 'et', name: 'Ester', testament: 'AT', division: 'Históricos', chaptersCount: 10, aliases: ['ester', 'et'] },
  { index: 17, abbrev: 'jó', name: 'Jó', testament: 'AT', division: 'Poéticos', chaptersCount: 42, aliases: ['jo', 'jó'] },
  { index: 18, abbrev: 'sl', name: 'Salmos', testament: 'AT', division: 'Poéticos', chaptersCount: 150, aliases: ['salmos', 'salmo', 'sl', 'sal'] },
  { index: 19, abbrev: 'pv', name: 'Provérbios', testament: 'AT', division: 'Poéticos', chaptersCount: 31, aliases: ['proverbios', 'pv', 'prov'] },
  { index: 20, abbrev: 'ec', name: 'Eclesiastes', testament: 'AT', division: 'Poéticos', chaptersCount: 12, aliases: ['eclesiastes', 'ec'] },
  { index: 21, abbrev: 'ct', name: 'Cânticos', testament: 'AT', division: 'Poéticos', chaptersCount: 8, aliases: ['canticos', 'cantares', 'ct'] },
  { index: 22, abbrev: 'is', name: 'Isaías', testament: 'AT', division: 'Profetas Maiores', chaptersCount: 66, aliases: ['isaias', 'is'] },
  { index: 23, abbrev: 'jr', name: 'Jeremias', testament: 'AT', division: 'Profetas Maiores', chaptersCount: 52, aliases: ['jeremias', 'jr', 'jer'] },
  { index: 24, abbrev: 'lm', name: 'Lamentações', testament: 'AT', division: 'Profetas Maiores', chaptersCount: 5, aliases: ['lamentacoes', 'lamentacoes de jeremias', 'lm'] },
  { index: 25, abbrev: 'ez', name: 'Ezequiel', testament: 'AT', division: 'Profetas Maiores', chaptersCount: 48, aliases: ['ezequiel', 'ez'] },
  { index: 26, abbrev: 'dn', name: 'Daniel', testament: 'AT', division: 'Profetas Maiores', chaptersCount: 12, aliases: ['daniel', 'dn', 'dan'] },
  { index: 27, abbrev: 'os', name: 'Oséias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 14, aliases: ['oseias', 'os'] },
  { index: 28, abbrev: 'jl', name: 'Joel', testament: 'AT', division: 'Profetas Menores', chaptersCount: 3, aliases: ['joel', 'jl'] },
  { index: 29, abbrev: 'am', name: 'Amós', testament: 'AT', division: 'Profetas Menores', chaptersCount: 9, aliases: ['amos', 'am'] },
  { index: 30, abbrev: 'ob', name: 'Obadias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 1, aliases: ['obadias', 'ob'] },
  { index: 31, abbrev: 'jn', name: 'Jonas', testament: 'AT', division: 'Profetas Menores', chaptersCount: 4, aliases: ['jonas', 'jn'] },
  { index: 32, abbrev: 'mq', name: 'Miquéias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 7, aliases: ['miqueias', 'mq'] },
  { index: 33, abbrev: 'na', name: 'Naum', testament: 'AT', division: 'Profetas Menores', chaptersCount: 3, aliases: ['naum', 'na'] },
  { index: 34, abbrev: 'hc', name: 'Habacuque', testament: 'AT', division: 'Profetas Menores', chaptersCount: 3, aliases: ['habacuque', 'hc'] },
  { index: 35, abbrev: 'sf', name: 'Sofonias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 3, aliases: ['sofonias', 'sf'] },
  { index: 36, abbrev: 'ag', name: 'Ageu', testament: 'AT', division: 'Profetas Menores', chaptersCount: 2, aliases: ['ageu', 'ag'] },
  { index: 37, abbrev: 'zc', name: 'Zacarias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 14, aliases: ['zacarias', 'zc'] },
  { index: 38, abbrev: 'ml', name: 'Malaquias', testament: 'AT', division: 'Profetas Menores', chaptersCount: 4, aliases: ['malaquias', 'ml'] },
  { index: 39, abbrev: 'mt', name: 'Mateus', testament: 'NT', division: 'Evangelhos', chaptersCount: 28, aliases: ['mateus', 'mt', 'mat'] },
  { index: 40, abbrev: 'mc', name: 'Marcos', testament: 'NT', division: 'Evangelhos', chaptersCount: 16, aliases: ['marcos', 'mc'] },
  { index: 41, abbrev: 'lc', name: 'Lucas', testament: 'NT', division: 'Evangelhos', chaptersCount: 24, aliases: ['lucas', 'lc'] },
  { index: 42, abbrev: 'jo', name: 'João', testament: 'NT', division: 'Evangelhos', chaptersCount: 21, aliases: ['joao', 'jo'] },
  { index: 43, abbrev: 'atos', name: 'Atos', testament: 'NT', division: 'Histórico', chaptersCount: 28, aliases: ['atos', 'atos dos apostolos', 'at'] },
  { index: 44, abbrev: 'rm', name: 'Romanos', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 16, aliases: ['romanos', 'rm', 'rom'] },
  { index: 45, abbrev: '1co', name: '1 Coríntios', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 16, aliases: ['1 corintios', '1corintios', '1co', '1 co'] },
  { index: 46, abbrev: '2co', name: '2 Coríntios', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 13, aliases: ['2 corintios', '2corintios', '2co', '2 co'] },
  { index: 47, abbrev: 'gl', name: 'Gálatas', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 6, aliases: ['galatas', 'gl'] },
  { index: 48, abbrev: 'ef', name: 'Efésios', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 6, aliases: ['efesios', 'ef'] },
  { index: 49, abbrev: 'fp', name: 'Filipenses', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 4, aliases: ['filipenses', 'fp'] },
  { index: 50, abbrev: 'cl', name: 'Colossenses', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 4, aliases: ['colossenses', 'cl'] },
  { index: 51, abbrev: '1ts', name: '1 Tessalonicenses', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 5, aliases: ['1 tessalonicenses', '1ts', '1 ts'] },
  { index: 52, abbrev: '2ts', name: '2 Tessalonicenses', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 3, aliases: ['2 tessalonicenses', '2ts', '2 ts'] },
  { index: 53, abbrev: '1tm', name: '1 Timóteo', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 6, aliases: ['1 timoteo', '1tm', '1 tm'] },
  { index: 54, abbrev: '2tm', name: '2 Timóteo', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 4, aliases: ['2 timoteo', '2tm', '2 tm'] },
  { index: 55, abbrev: 'tt', name: 'Tito', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 3, aliases: ['tito', 'tt'] },
  { index: 56, abbrev: 'fm', name: 'Filemom', testament: 'NT', division: 'Cartas Paulinas', chaptersCount: 1, aliases: ['filemom', 'fm'] },
  { index: 57, abbrev: 'hb', name: 'Hebreus', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 13, aliases: ['hebreus', 'hb'] },
  { index: 58, abbrev: 'tg', name: 'Tiago', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 5, aliases: ['tiago', 'tg'] },
  { index: 59, abbrev: '1pe', name: '1 Pedro', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 5, aliases: ['1 pedro', '1pe', '1 pe'] },
  { index: 60, abbrev: '2pe', name: '2 Pedro', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 3, aliases: ['2 pedro', '2pe', '2 pe'] },
  { index: 61, abbrev: '1jo', name: '1 João', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 5, aliases: ['1 joao', '1jo', '1 jo'] },
  { index: 62, abbrev: '2jo', name: '2 João', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 1, aliases: ['2 joao', '2jo', '2 jo'] },
  { index: 63, abbrev: '3jo', name: '3 João', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 1, aliases: ['3 joao', '3jo', '3 jo'] },
  { index: 64, abbrev: 'jd', name: 'Judas', testament: 'NT', division: 'Cartas Gerais', chaptersCount: 1, aliases: ['judas', 'jd'] },
  { index: 65, abbrev: 'ap', name: 'Apocalipse', testament: 'NT', division: 'Profético', chaptersCount: 22, aliases: ['apocalipse', 'ap'] },
];

export const TOTAL_CHAPTERS = BOOK_METADATA.reduce((acc, b) => acc + b.chaptersCount, 0);

export const DAILY_VERSE_REFS = [
  { bookIndex: 18, chapter: 23, verse: 1 },
  { bookIndex: 42, chapter: 1, verse: 5 },
  { bookIndex: 44, chapter: 8, verse: 28 },
  { bookIndex: 19, chapter: 3, verse: 5 },
  { bookIndex: 22, chapter: 40, verse: 31 },
  { bookIndex: 49, chapter: 4, verse: 7 },
  { bookIndex: 18, chapter: 119, verse: 105 },
  { bookIndex: 39, chapter: 11, verse: 28 },
  { bookIndex: 42, chapter: 14, verse: 27 },
  { bookIndex: 24, chapter: 3, verse: 22 },
  { bookIndex: 5, chapter: 1, verse: 9 },
  { bookIndex: 18, chapter: 46, verse: 1 },
];

export function getDailyVerseRef(): { bookIndex: number; chapter: number; verse: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_VERSE_REFS[dayOfYear % DAILY_VERSE_REFS.length];
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'evangelhos-30',
    title: 'Os Evangelhos em 30 Dias',
    subtitle: 'A vida, os ensinamentos e a compaixão de Jesus segundo Mateus, Marcos, Lucas e João.',
    category: 'Novo Testamento',
    durationLabel: '30 dias',
    description:
      'Um percurso contínuo pelos quatro relatos evangélicos, alternando narrativas históricas, parábolas e o Sermão do Monte em ritmo sereno de leitura diária.',
    imageUrl: '/src/assets/images/plan_evangelhos_manuscript_1794942494592.jpg',
    imageAlt: 'Livro antigo aberto com ramo de oliveira sobre pedra travertino',
    days: [
      { day: 1, title: 'O Verbo e a Genealogia', passages: [{ bookIndex: 42, startChapter: 1, endChapter: 1, label: 'João 1' }, { bookIndex: 39, startChapter: 1, endChapter: 2, label: 'Mateus 1–2' }] },
      { day: 2, title: 'Preparação no Deserto', passages: [{ bookIndex: 39, startChapter: 3, endChapter: 4, label: 'Mateus 3–4' }] },
      { day: 3, title: 'As Bem-Aventuranças', passages: [{ bookIndex: 39, startChapter: 5, endChapter: 7, label: 'Mateus 5–7' }] },
      { day: 4, title: 'Sinais e Chamado', passages: [{ bookIndex: 39, startChapter: 8, endChapter: 10, label: 'Mateus 8–10' }] },
      { day: 5, title: 'Parábolas do Reino', passages: [{ bookIndex: 39, startChapter: 11, endChapter: 13, label: 'Mateus 11–13' }] },
      { day: 6, title: 'Pão da Vida e Confissão', passages: [{ bookIndex: 39, startChapter: 14, endChapter: 17, label: 'Mateus 14–17' }] },
      { day: 7, title: 'Perdão e Serviço', passages: [{ bookIndex: 39, startChapter: 18, endChapter: 20, label: 'Mateus 18–20' }] },
      { day: 8, title: 'Jerusalém e o Templo', passages: [{ bookIndex: 39, startChapter: 21, endChapter: 23, label: 'Mateus 21–23' }] },
      { day: 9, title: 'Vigília e Misericórdia', passages: [{ bookIndex: 39, startChapter: 24, endChapter: 25, label: 'Mateus 24–25' }] },
      { day: 10, title: 'Paixão e Ressurreição em Mateus', passages: [{ bookIndex: 39, startChapter: 26, endChapter: 28, label: 'Mateus 26–28' }] },
      { day: 11, title: 'O Início em Marcos', passages: [{ bookIndex: 40, startChapter: 1, endChapter: 4, label: 'Marcos 1–4' }] },
      { day: 12, title: 'Autoridade e Fé', passages: [{ bookIndex: 40, startChapter: 5, endChapter: 8, label: 'Marcos 5–8' }] },
      { day: 13, title: 'O Caminho da Cruz', passages: [{ bookIndex: 40, startChapter: 9, endChapter: 12, label: 'Marcos 9–12' }] },
      { day: 14, title: 'Entrega e Vitória', passages: [{ bookIndex: 40, startChapter: 13, endChapter: 16, label: 'Marcos 13–16' }] },
      { day: 15, title: 'Anunciação e Cânticos', passages: [{ bookIndex: 41, startChapter: 1, endChapter: 3, label: 'Lucas 1–3' }] },
      { day: 16, title: 'Ano Aceitável do Senhor', passages: [{ bookIndex: 41, startChapter: 4, endChapter: 6, label: 'Lucas 4–6' }] },
      { day: 17, title: 'Compaixão na Galileia', passages: [{ bookIndex: 41, startChapter: 7, endChapter: 9, label: 'Lucas 7–9' }] },
      { day: 18, title: 'O Bom Samaritano e Oração', passages: [{ bookIndex: 41, startChapter: 10, endChapter: 12, label: 'Lucas 10–12' }] },
      { day: 19, title: 'O Filho Pródigo', passages: [{ bookIndex: 41, startChapter: 13, endChapter: 16, label: 'Lucas 13–16' }] },
      { day: 20, title: 'Zaqueu e Entrada Triunfal', passages: [{ bookIndex: 41, startChapter: 17, endChapter: 20, label: 'Lucas 17–20' }] },
      { day: 21, title: 'Caminho de Emaús', passages: [{ bookIndex: 41, startChapter: 21, endChapter: 24, label: 'Lucas 21–24' }] },
      { day: 22, title: 'Caná e Nicodemos', passages: [{ bookIndex: 42, startChapter: 2, endChapter: 4, label: 'João 2–4' }] },
      { day: 23, title: 'Pão Vivo descido do Céu', passages: [{ bookIndex: 42, startChapter: 5, endChapter: 6, label: 'João 5–6' }] },
      { day: 24, title: 'Água Viva e Luz do Mundo', passages: [{ bookIndex: 42, startChapter: 7, endChapter: 9, label: 'João 7–9' }] },
      { day: 25, title: 'O Bom Pastor', passages: [{ bookIndex: 42, startChapter: 10, endChapter: 11, label: 'João 10–11' }] },
      { day: 26, title: 'O Lava-Pés', passages: [{ bookIndex: 42, startChapter: 12, endChapter: 13, label: 'João 12–13' }] },
      { day: 27, title: 'A Videira Verdadeira', passages: [{ bookIndex: 42, startChapter: 14, endChapter: 15, label: 'João 14–15' }] },
      { day: 28, title: 'Oração Sacerdotal', passages: [{ bookIndex: 42, startChapter: 16, endChapter: 17, label: 'João 16–17' }] },
      { day: 29, title: 'Consumado Está', passages: [{ bookIndex: 42, startChapter: 18, endChapter: 19, label: 'João 18–19' }] },
      { day: 30, title: 'Manhã na Galileia', passages: [{ bookIndex: 42, startChapter: 20, endChapter: 21, label: 'João 20–21' }] },
    ],
  },
  {
    id: 'sabedoria-diaria',
    title: 'Sabedoria Diária: Salmos e Provérbios',
    subtitle: 'Contemplação poética e discernimento prático através dos livros sapienciais.',
    category: 'Livros Poéticos',
    durationLabel: '15 dias',
    description:
      'Seleção estruturada dos Salmos de confiança, louvor e súplica em diálogo com os capítulos centrais de Provérbios e Eclesiastes.',
    imageUrl: '/src/assets/images/plan_sabedoria_scrolls_1794942494331.jpg',
    imageAlt: 'Pergaminhos enrolados sobre pedra calcária ao lado de vaso artesanal',
    days: [
      { day: 1, title: 'Dois Caminhos', passages: [{ bookIndex: 18, startChapter: 1, endChapter: 2, label: 'Salmos 1–2' }, { bookIndex: 19, startChapter: 1, endChapter: 1, label: 'Provérbios 1' }] },
      { day: 2, title: 'Confiança na Madrugada', passages: [{ bookIndex: 18, startChapter: 8, endChapter: 8, label: 'Salmos 8' }, { bookIndex: 19, startChapter: 2, endChapter: 3, label: 'Provérbios 2–3' }] },
      { day: 3, title: 'Os Céus Proclamam', passages: [{ bookIndex: 18, startChapter: 19, endChapter: 19, label: 'Salmos 19' }, { bookIndex: 19, startChapter: 4, endChapter: 4, label: 'Provérbios 4' }] },
      { day: 4, title: 'O Senhor é o Meu Pastor', passages: [{ bookIndex: 18, startChapter: 23, endChapter: 24, label: 'Salmos 23–24' }, { bookIndex: 19, startChapter: 8, endChapter: 8, label: 'Provérbios 8' }] },
      { day: 5, title: 'Luz e Salvação', passages: [{ bookIndex: 18, startChapter: 27, endChapter: 27, label: 'Salmos 27' }, { bookIndex: 19, startChapter: 9, endChapter: 10, label: 'Provérbios 9–10' }] },
      { day: 6, title: 'Refúgio e Fortaleza', passages: [{ bookIndex: 18, startChapter: 46, endChapter: 46, label: 'Salmos 46' }, { bookIndex: 19, startChapter: 11, endChapter: 12, label: 'Provérbios 11–12' }] },
      { day: 7, title: 'Sede de Deus', passages: [{ bookIndex: 18, startChapter: 42, endChapter: 43, label: 'Salmos 42–43' }, { bookIndex: 19, startChapter: 15, endChapter: 15, label: 'Provérbios 15' }] },
      { day: 8, title: 'Coração Puro', passages: [{ bookIndex: 18, startChapter: 51, endChapter: 51, label: 'Salmos 51' }, { bookIndex: 19, startChapter: 16, endChapter: 16, label: 'Provérbios 16' }] },
      { day: 9, title: 'À Sombra do Altíssimo', passages: [{ bookIndex: 18, startChapter: 90, endChapter: 91, label: 'Salmos 90–91' }, { bookIndex: 19, startChapter: 18, endChapter: 18, label: 'Provérbios 18' }] },
      { day: 10, title: 'Gratidão e Misericórdia', passages: [{ bookIndex: 18, startChapter: 103, endChapter: 103, label: 'Salmos 103' }, { bookIndex: 19, startChapter: 22, endChapter: 22, label: 'Provérbios 22' }] },
      { day: 11, title: 'Lâmpada para os Pés', passages: [{ bookIndex: 18, startChapter: 119, endChapter: 119, label: 'Salmos 119' }, { bookIndex: 19, startChapter: 25, endChapter: 25, label: 'Provérbios 25' }] },
      { day: 12, title: 'Olhos nos Montes', passages: [{ bookIndex: 18, startChapter: 121, endChapter: 121, label: 'Salmos 121' }, { bookIndex: 20, startChapter: 3, endChapter: 3, label: 'Eclesiastes 3' }] },
      { day: 13, title: 'Sondado e Conhecido', passages: [{ bookIndex: 18, startChapter: 139, endChapter: 139, label: 'Salmos 139' }, { bookIndex: 19, startChapter: 27, endChapter: 27, label: 'Provérbios 27' }] },
      { day: 14, title: 'Tempo e Eternidade', passages: [{ bookIndex: 20, startChapter: 11, endChapter: 12, label: 'Eclesiastes 11–12' }, { bookIndex: 19, startChapter: 31, endChapter: 31, label: 'Provérbios 31' }] },
      { day: 15, title: 'Tudo Quanto Tem Fôlego', passages: [{ bookIndex: 18, startChapter: 145, endChapter: 150, label: 'Salmos 145–150' }] },
    ],
  },
  {
    id: 'grandes-narrativas',
    title: 'Grandes Narrativas da Escritura',
    subtitle: 'Da criação ao novo céu: um panorama pelos momentos decisivos da história bíblica.',
    category: 'Panorama Bíblico',
    durationLabel: '14 dias',
    description:
      'Ideal para compreender a linha histórica da Bíblia em duas semanas, passando por Gênesis, Êxodo, os Profetas, os Evangelhos e Apocalipse.',
    imageUrl: '/src/assets/images/plan_narrativas_landscape_1794942494599.jpg',
    imageAlt: 'Oliveiras antigas sobre colinas calcárias do Mediterrâneo ao amanhecer',
    days: [
      { day: 1, title: 'A Criação do Mundo', passages: [{ bookIndex: 0, startChapter: 1, endChapter: 3, label: 'Gênesis 1–3' }] },
      { day: 2, title: 'Chamado de Abraão', passages: [{ bookIndex: 0, startChapter: 12, endChapter: 15, label: 'Gênesis 12–15' }] },
      { day: 3, title: 'A Sarça e a Libertação', passages: [{ bookIndex: 1, startChapter: 3, endChapter: 4, label: 'Êxodo 3–4' }, { bookIndex: 1, startChapter: 14, endChapter: 15, label: 'Êxodo 14–15' }] },
      { day: 4, title: 'A Aliança no Sinai', passages: [{ bookIndex: 1, startChapter: 19, endChapter: 20, label: 'Êxodo 19–20' }] },
      { day: 5, title: 'Fidelidade de Rute', passages: [{ bookIndex: 7, startChapter: 1, endChapter: 4, label: 'Rute 1–4' }] },
      { day: 6, title: 'O Rei Pastor', passages: [{ bookIndex: 8, startChapter: 16, endChapter: 17, label: '1 Samuel 16–17' }, { bookIndex: 18, startChapter: 23, endChapter: 23, label: 'Salmos 23' }] },
      { day: 7, title: 'Consolação em Isaías', passages: [{ bookIndex: 22, startChapter: 40, endChapter: 40, label: 'Isaías 40' }, { bookIndex: 22, startChapter: 53, endChapter: 53, label: 'Isaías 53' }] },
      { day: 8, title: 'Coragem na Babilônia', passages: [{ bookIndex: 26, startChapter: 3, endChapter: 3, label: 'Daniel 3' }, { bookIndex: 26, startChapter: 6, endChapter: 6, label: 'Daniel 6' }] },
      { day: 9, title: 'O Nascimento Prometido', passages: [{ bookIndex: 41, startChapter: 1, endChapter: 2, label: 'Lucas 1–2' }] },
      { day: 10, title: 'O Sermão do Monte', passages: [{ bookIndex: 39, startChapter: 5, endChapter: 7, label: 'Mateus 5–7' }] },
      { day: 11, title: 'A Cruz e a Manhã', passages: [{ bookIndex: 42, startChapter: 19, endChapter: 20, label: 'João 19–20' }] },
      { day: 12, title: 'Pentecostes e a Igreja', passages: [{ bookIndex: 43, startChapter: 1, endChapter: 2, label: 'Atos 1–2' }] },
      { day: 13, title: 'O Hino do Amor e da Graça', passages: [{ bookIndex: 45, startChapter: 13, endChapter: 13, label: '1 Coríntios 13' }, { bookIndex: 44, startChapter: 8, endChapter: 8, label: 'Romanos 8' }] },
      { day: 14, title: 'Novos Céus e Nova Terra', passages: [{ bookIndex: 65, startChapter: 21, endChapter: 22, label: 'Apocalipse 21–22' }] },
    ],
  },
  {
    id: 'cartas-apostolicas',
    title: 'Cartas de Fé e Comunidade',
    subtitle: 'Romanos, Gálatas, Efésios, Filipenses e Tiago em leitura reflexiva.',
    category: 'Epístolas',
    durationLabel: '12 dias',
    description:
      'Leitura concentrada nas principais cartas do Novo Testamento sobre graça, unidade comunitária, esperança e vida prática.',
    imageUrl: '/src/assets/images/plan_evangelhos_manuscript_1794942494592.jpg',
    imageAlt: 'Livro antigo aberto com ramo de oliveira sobre pedra travertino',
    days: [
      { day: 1, title: 'Justificados pela Fé', passages: [{ bookIndex: 44, startChapter: 1, endChapter: 5, label: 'Romanos 1–5' }] },
      { day: 2, title: 'Vida no Espírito', passages: [{ bookIndex: 44, startChapter: 6, endChapter: 8, label: 'Romanos 6–8' }] },
      { day: 3, title: 'Misericórdia e Serviço', passages: [{ bookIndex: 44, startChapter: 12, endChapter: 15, label: 'Romanos 12–15' }] },
      { day: 4, title: 'O Fruto do Espírito', passages: [{ bookIndex: 47, startChapter: 1, endChapter: 6, label: 'Gálatas 1–6' }] },
      { day: 5, title: 'Riquezas da Graça', passages: [{ bookIndex: 48, startChapter: 1, endChapter: 3, label: 'Efésios 1–3' }] },
      { day: 6, title: 'Unidade e Nova Vida', passages: [{ bookIndex: 48, startChapter: 4, endChapter: 6, label: 'Efésios 4–6' }] },
      { day: 7, title: 'Alegria em Cristo', passages: [{ bookIndex: 49, startChapter: 1, endChapter: 4, label: 'Filipenses 1–4' }] },
      { day: 8, title: 'Plenitude em Colossenses', passages: [{ bookIndex: 50, startChapter: 1, endChapter: 4, label: 'Colossenses 1–4' }] },
      { day: 9, title: 'Nuvem de Testemunhas', passages: [{ bookIndex: 57, startChapter: 11, endChapter: 13, label: 'Hebreus 11–13' }] },
      { day: 10, title: 'Fé que Opera', passages: [{ bookIndex: 58, startChapter: 1, endChapter: 5, label: 'Tiago 1–5' }] },
      { day: 11, title: 'Pedras Vivas', passages: [{ bookIndex: 59, startChapter: 1, endChapter: 5, label: '1 Pedro 1–5' }] },
      { day: 12, title: 'Deus é Amor', passages: [{ bookIndex: 61, startChapter: 1, endChapter: 5, label: '1 João 1–5' }] },
    ],
  },
];
