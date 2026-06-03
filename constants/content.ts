import type { Lang } from './i18n';

// Çeviri sözlüğü — eksik alanlar İngilizce'ye (yoksa TR) düşer (güvenlik ağı).
type L = Partial<Record<Lang, string>>;

function pick(l: L | undefined, lang: Lang, fallback = ''): string {
  return l?.[lang] ?? l?.en ?? l?.tr ?? fallback;
}

// ─── Yazarlar (kanıt düzeyine göre sıralı) ────────────────
export interface Author { id: string; name: L; }

export const AUTHORS: Author[] = [
  // Eseri/metni günümüze ulaşanlar
  { id: 'seneca',      name: { tr: 'Seneca',          en: 'Seneca',            de: 'Seneca',             ru: 'Сенека', fr: 'Sénèque', es: 'Séneca' } },
  { id: 'epictetus',   name: { tr: 'Epiktetos',       en: 'Epictetus',         de: 'Epiktet',            ru: 'Эпиктет', fr: 'Épictète', es: 'Epicteto' } },
  { id: 'marcus',      name: { tr: 'Marcus Aurelius', en: 'Marcus Aurelius',   de: 'Mark Aurel',         ru: 'Марк Аврелий', fr: 'Marc Aurèle', es: 'Marco Aurelio' } },
  { id: 'musonius',    name: { tr: 'Musonius Rufus',  en: 'Musonius Rufus',    de: 'Musonius Rufus',     ru: 'Музоний Руф', fr: 'Musonius Rufus', es: 'Musonio Rufo' } },
  { id: 'cleanthes',   name: { tr: 'Kleanthes',       en: 'Cleanthes',         de: 'Kleanthes',          ru: 'Клеанф', fr: 'Cléanthe', es: 'Cleantes' } },
  { id: 'hierocles',   name: { tr: 'Hierokles',       en: 'Hierocles',         de: 'Hierokles',          ru: 'Гиерокл', fr: 'Hiéroclès', es: 'Hierocles' } },
  // Sözleri antik kaynaklarda belgelenenler
  { id: 'zeno',        name: { tr: 'Kıbrıslı Zenon',  en: 'Zeno of Citium',    de: 'Zenon von Kition',   ru: 'Зенон Китийский', fr: 'Zénon de Cition', es: 'Zenón de Citio' } },
  { id: 'chrysippus',  name: { tr: 'Khrysippos',      en: 'Chrysippus',        de: 'Chrysippos',         ru: 'Хрисипп', fr: 'Chrysippe', es: 'Crisipo' } },
  { id: 'cato',        name: { tr: 'Genç Cato',       en: 'Cato the Younger',  de: 'Cato der Jüngere',   ru: 'Катон Младший', fr: 'Caton le Jeune', es: 'Catón el Joven' } },
  { id: 'athenodorus', name: { tr: 'Athenodoros',     en: 'Athenodorus',       de: 'Athenodoros',        ru: 'Афинодор', fr: 'Athénodore', es: 'Atenodoro' } },
  // Öğretisi fragmanlardan yeniden kurulanlar
  { id: 'panaetius',   name: { tr: 'Panaitios',       en: 'Panaetius',         de: 'Panaitios',          ru: 'Панэтий', fr: 'Panétios', es: 'Panecio' } },
  { id: 'posidonius',  name: { tr: 'Poseidonios',     en: 'Posidonius',        de: 'Poseidonios',        ru: 'Посидоний', fr: 'Posidonios', es: 'Posidonio' } },
  { id: 'ariston',     name: { tr: 'Sakızlı Ariston', en: 'Ariston of Chios',  de: 'Ariston von Chios',  ru: 'Аристон Хиосский', fr: 'Ariston de Chios', es: 'Aristón de Quíos' } },
  { id: 'diogenes_b',  name: { tr: 'Babilli Diogenes',en: 'Diogenes of Babylon',de: 'Diogenes von Babylon',ru: 'Диоген Вавилонский', fr: 'Diogène de Babylone', es: 'Diógenes de Babilonia' } },
  // Belirli bir kişiye atfedilmeyen, ortak Stoacı miras
  { id: 'tradition',   name: { tr: 'Stoacı Gelenek',  en: 'Stoic Tradition',   de: 'Stoische Tradition', ru: 'Стоическая традиция', fr: 'Tradition stoïcienne', es: 'Tradición estoica' } },
];

export function authorName(id: string, lang: Lang): string {
  return pick(AUTHORS.find((a) => a.id === id)?.name, lang, id);
}

// ─── Kaynaklar ────────────────────────────────────────────
const SOURCES: Record<string, L> = {
  meditations:    { tr: 'Meditationes',     en: 'Meditations',        de: 'Selbstbetrachtungen',  ru: 'Размышления', fr: 'Pensées pour moi-même', es: 'Meditaciones' },
  enchiridion:    { tr: 'Enchiridion',      en: 'Enchiridion',        de: 'Handbüchlein',         ru: 'Энхиридион', fr: 'Manuel', es: 'Enquiridión' },
  discourses:     { tr: 'Discourses',       en: 'Discourses',         de: 'Diatriben',            ru: 'Беседы', fr: 'Entretiens', es: 'Disertaciones' },
  letters:        { tr: 'Epistulae Morales',en: 'Moral Letters',      de: 'Briefe an Lucilius',   ru: 'Нравственные письма', fr: 'Lettres à Lucilius', es: 'Cartas a Lucilio' },
  happyLife:      { tr: 'De Vita Beata',    en: 'On the Happy Life',  de: 'Vom glücklichen Leben',ru: 'О счастливой жизни', fr: 'De la vie heureuse', es: 'Sobre la vida feliz' },
  fragments:      { tr: 'Fragmanlar',       en: 'Fragments',          de: 'Fragmente',            ru: 'Фрагменты', fr: 'Fragments', es: 'Fragmentos' },
  laertius:       { tr: 'Diogenes Laertios',en: 'Diogenes Laërtius',  de: 'Diogenes Laertios',    ru: 'Диоген Лаэртский', fr: 'Diogène Laërce', es: 'Diógenes Laercio' },
  hymnZeus:       { tr: "Zeus'a İlahi",     en: 'Hymn to Zeus',       de: 'Zeus-Hymne',           ru: 'Гимн Зевсу', fr: 'Hymne à Zeus', es: 'Himno a Zeus' },
  lectures:       { tr: 'Söylevler',        en: 'Lectures',           de: 'Vorträge',             ru: 'Лекции', fr: 'Leçons', es: 'Lecciones' },
  onDuties:       { tr: 'Görevler Üzerine', en: 'On Duties',          de: 'Über die Pflichten',   ru: 'Об обязанностях', fr: 'Des devoirs', es: 'Sobre los deberes' },
  plutarch:       { tr: 'Plutarkhos',       en: 'Plutarch',           de: 'Plutarch',             ru: 'Плутарх', fr: 'Plutarque', es: 'Plutarco' },
  ethicalElements:{ tr: 'Etik Unsurlar',    en: 'Elements of Ethics', de: 'Elemente der Ethik',   ru: 'Основы этики', fr: "Éléments d'éthique", es: 'Elementos de ética' },
  brevity:        { tr: 'De Brevitate Vitae',en: 'On the Shortness of Life', de: 'Von der Kürze des Lebens', ru: 'О краткости жизни', fr: 'De la brièveté de la vie', es: 'Sobre la brevedad de la vida' },
  onAnger:        { tr: 'De Ira',            en: 'On Anger',           de: 'Über den Zorn',        ru: 'О гневе', fr: 'De la colère', es: 'Sobre la ira' },
  attributed:     { tr: 'Rivayet',           en: 'Attributed',         de: 'Überliefert',          ru: 'Приписывается', fr: 'Attribué', es: 'Atribuido' },
  tradition:      { tr: 'Stoacı Gelenek',    en: 'Stoic Tradition',    de: 'Stoische Tradition',   ru: 'Стоическая традиция', fr: 'Tradition stoïcienne', es: 'Tradición estoica' },
};

function sourceName(id: string, lang: Lang): string {
  return pick(SOURCES[id], lang, id);
}

// ─── Alıntılar ────────────────────────────────────────────
// theme: gizli tema etiketi (ileride ruh haline göre filtre için; uygulamada gösterilmez)
interface RawQuote { id: string; authorId: string; sourceId: string; text: L; theme?: string; }

const QUOTES_RAW: RawQuote[] = [
  { id: '1', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Bugün ölebilirdin; bunun yerine hâlâ hayattasın. Bu zamanı bilgelikle kullan.',
    en: 'Today you could have died; instead you are still alive. Use this time wisely.',
    de: 'Heute hättest du sterben können; stattdessen lebst du noch. Nutze diese Zeit weise.',
    ru: 'Сегодня ты мог умереть; но ты всё ещё жив. Используй это время мудро.',
    fr: "Tu aurais pu mourir aujourd'hui ; pourtant tu es encore en vie. Emploie ce temps avec sagesse.",
    es: 'Hoy podrías haber muerto; en cambio sigues vivo. Usa este tiempo con sabiduría.' } },
  { id: '2', authorId: 'epictetus', sourceId: 'enchiridion', text: {
    tr: 'İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir.',
    en: 'People are disturbed not by things, but by their opinions about things.',
    de: 'Nicht die Dinge beunruhigen die Menschen, sondern ihre Urteile über die Dinge.',
    ru: 'Людей беспокоят не вещи, а их мнения о вещах.',
    fr: "Ce ne sont pas les choses qui troublent les hommes, mais les opinions qu'ils en ont.",
    es: 'A las personas no las perturban las cosas, sino las opiniones que tienen de ellas.' } },
  { id: '3', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Hayatını değiştirmek istiyorsan, düşüncelerini değiştir. Bu kadar basit, bu kadar zor.',
    en: 'If you want to change your life, change your thoughts. This simple, this hard.',
    de: 'Willst du dein Leben ändern, ändere deine Gedanken. So einfach, so schwer.',
    ru: 'Хочешь изменить свою жизнь — измени свои мысли. Так просто и так трудно.',
    fr: 'Si tu veux changer ta vie, change tes pensées. Aussi simple, aussi difficile.',
    es: 'Si quieres cambiar tu vida, cambia tus pensamientos. Así de simple, así de difícil.' } },
  { id: '4', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Kendine dönük yolculuk, tüm yolculukların en uzunudur.',
    en: 'The journey toward oneself is the longest of all journeys.',
    de: 'Die Reise zu sich selbst ist die längste aller Reisen.',
    ru: 'Путь к самому себе — самый длинный из всех путей.',
    fr: 'Le voyage vers soi-même est le plus long de tous les voyages.',
    es: 'El viaje hacia uno mismo es el más largo de todos los viajes.' } },
  { id: '5', authorId: 'epictetus', sourceId: 'discourses', text: {
    tr: 'Özgürlük, istediğini elde etmek değil; istemediğin şeyden korkmamaktır.',
    en: 'Freedom is not getting what you want, but ceasing to fear what you do not want.',
    de: 'Freiheit heißt nicht, zu bekommen, was man will, sondern das Unerwünschte nicht zu fürchten.',
    ru: 'Свобода — не в том, чтобы получать желаемое, а в том, чтобы не бояться нежеланного.',
    fr: "La liberté n'est pas d'obtenir ce qu'on veut, mais de cesser de craindre ce qu'on ne veut pas.",
    es: 'La libertad no consiste en obtener lo que quieres, sino en dejar de temer lo que no quieres.' } },
  { id: '6', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Kayıplarını değil, sahip olduklarını say.',
    en: 'Count not your losses, but what you possess.',
    de: 'Zähle nicht deine Verluste, sondern das, was du besitzt.',
    ru: 'Считай не свои потери, а то, чем владеешь.',
    fr: 'Ne compte pas tes pertes, mais ce que tu possèdes.',
    es: 'No cuentes tus pérdidas, sino lo que posees.' } },
  { id: '7', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Vakit en değerli şeydir; onu harcarken bile tasarruflu ol.',
    en: 'Time is the most precious thing; be frugal even as you spend it.',
    de: 'Zeit ist das Kostbarste; sei sparsam, selbst während du sie ausgibst.',
    ru: 'Время — самое драгоценное; будь бережлив, даже расходуя его.',
    fr: 'Le temps est la chose la plus précieuse ; sois économe même en le dépensant.',
    es: 'El tiempo es lo más precioso; sé frugal incluso al gastarlo.' } },
  { id: '8', authorId: 'epictetus', sourceId: 'enchiridion', text: {
    tr: 'Başkalarının söyledikleri onların kontrolünde; onlara nasıl tepki vereceğin senin.',
    en: 'What others say is in their control; how you respond is in yours.',
    de: 'Was andere sagen, liegt in ihrer Macht; wie du reagierst, in deiner.',
    ru: 'Что говорят другие — в их власти; как ты ответишь — в твоей.',
    fr: "Ce que disent les autres dépend d'eux ; ta façon d'y répondre dépend de toi.",
    es: 'Lo que dicen los demás está en su poder; cómo respondes está en el tuyo.' } },
  { id: '9', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Gelecek için kaygılanmak, henüz yaşanmamış bir acıyı iki kez yaşamaktır.',
    en: 'To worry about the future is to suffer a pain not yet born, twice.',
    de: 'Sich um die Zukunft zu sorgen heißt, ein noch ungeborenes Leid zweimal zu erleiden.',
    ru: 'Тревожиться о будущем — значит дважды пережить ещё не наступившую боль.',
    fr: "S'inquiéter de l'avenir, c'est souffrir deux fois d'un mal qui n'est pas encore né.",
    es: 'Preocuparse por el futuro es sufrir dos veces un dolor que aún no ha nacido.' } },
  { id: '10', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Kendi ruhunu değiştirmek, dünyanın geri kalanını değiştirmekten daha zordur.',
    en: 'To change your own soul is harder than to change all the rest of the world.',
    de: 'Die eigene Seele zu ändern ist schwerer, als die ganze übrige Welt zu ändern.',
    ru: 'Изменить собственную душу труднее, чем изменить весь остальной мир.',
    fr: "Changer sa propre âme est plus difficile que de changer tout le reste du monde.",
    es: 'Cambiar tu propia alma es más difícil que cambiar todo el resto del mundo.' } },
  { id: '11', authorId: 'seneca', sourceId: 'happyLife', text: {
    tr: 'Az isteyen çok sahiptir. Çok isteyen hiçbir zaman yeterince sahip değildir.',
    en: 'He who wants little has much. He who wants much never has enough.',
    de: 'Wer wenig will, hat viel. Wer viel will, hat nie genug.',
    ru: 'Кто желает малого, владеет многим. Кому нужно многое, тому всегда мало.',
    fr: "Qui désire peu possède beaucoup. Qui désire beaucoup n'a jamais assez.",
    es: 'Quien desea poco tiene mucho. Quien desea mucho nunca tiene suficiente.' } },
  { id: '12', authorId: 'epictetus', sourceId: 'discourses', text: {
    tr: 'Bilgelik; neyin senin kontrolünde olduğunu, neyin olmadığını bilmektir.',
    en: 'Wisdom is knowing what is in your control and what is not.',
    de: 'Weisheit ist zu wissen, was in deiner Macht steht und was nicht.',
    ru: 'Мудрость — знать, что в твоей власти, а что нет.',
    fr: "La sagesse, c'est savoir ce qui dépend de toi et ce qui n'en dépend pas.",
    es: 'La sabiduría es saber qué está en tu poder y qué no.' } },

  { id: '13', authorId: 'zeno', sourceId: 'laertius', text: {
    tr: 'İki kulağımız ve tek bir ağzımız var; bu yüzden daha çok dinleyip daha az konuşmalıyız.',
    en: 'We have two ears and one mouth, so we should listen more and speak less.',
    de: 'Wir haben zwei Ohren und einen Mund, also sollten wir mehr hören und weniger reden.',
    ru: 'У нас два уха и один рот, поэтому слушать надо больше, а говорить меньше.',
    fr: "Nous avons deux oreilles et une seule bouche, afin d'écouter davantage et de parler moins.",
    es: 'Tenemos dos oídos y una sola boca, para escuchar más y hablar menos.' } },
  { id: '14', authorId: 'zeno', sourceId: 'fragments', text: {
    tr: 'İyi insanlar yasalardan değil, erdemden ötürü doğru davranır.',
    en: 'Good people act rightly not because of laws, but because of virtue.',
    de: 'Gute Menschen handeln recht nicht wegen der Gesetze, sondern aus Tugend.',
    ru: 'Добрые люди поступают правильно не из-за законов, а из добродетели.',
    fr: 'Les gens de bien agissent avec droiture non par crainte des lois, mais par vertu.',
    es: 'Las personas buenas actúan rectamente no por las leyes, sino por la virtud.' } },
  { id: '15', authorId: 'zeno', sourceId: 'laertius', text: {
    tr: 'Doğayla uyum içinde yaşamak — işte hayatın amacı budur.',
    en: 'To live in agreement with nature — that is the goal of life.',
    de: 'Im Einklang mit der Natur zu leben — das ist das Ziel des Lebens.',
    ru: 'Жить в согласии с природой — вот цель жизни.',
    fr: 'Vivre en accord avec la nature — voilà le but de la vie.',
    es: 'Vivir en concordancia con la naturaleza: ese es el fin de la vida.' } },
  { id: '16', authorId: 'zeno', sourceId: 'fragments', text: {
    tr: 'Mutluluk, akışı düzgün bir yaşamdır.',
    en: 'Happiness is a smooth flow of life.',
    de: 'Glück ist ein gleichmäßiger Fluss des Lebens.',
    ru: 'Счастье — это ровное течение жизни.',
    fr: 'Le bonheur est un cours paisible de la vie.',
    es: 'La felicidad es un fluir sereno de la vida.' } },

  { id: '17', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'Erdemli yaşamak için zenginliğe değil, yalnızca akla ihtiyacın var.',
    en: 'To live virtuously you need not wealth, but only reason.',
    de: 'Um tugendhaft zu leben, brauchst du keinen Reichtum, sondern nur Vernunft.',
    ru: 'Чтобы жить добродетельно, нужно не богатство, а лишь разум.',
    fr: "Pour vivre vertueusement, tu n'as pas besoin de richesse, mais seulement de raison.",
    es: 'Para vivir con virtud no necesitas riqueza, sino solo razón.' } },
  { id: '18', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'İyi yaşamayı öğrenmek, tüm hayatı öğrenmektir; çünkü her an doğru davranma fırsatıdır.',
    en: 'To learn to live well is to learn all of life, for every moment is a chance to act rightly.',
    de: 'Gut leben zu lernen heißt, das ganze Leben zu lernen; denn jeder Augenblick ist eine Gelegenheit, recht zu handeln.',
    ru: 'Учиться жить хорошо — значит учиться всей жизни, ведь каждый миг — повод поступить верно.',
    fr: "Apprendre à bien vivre, c'est apprendre toute la vie, car chaque instant est l'occasion d'agir avec droiture.",
    es: 'Aprender a vivir bien es aprender toda la vida, pues cada momento es una ocasión de obrar con rectitud.' } },
  { id: '19', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'Zorluğa katlanmayı seçen kişi, hazza teslim olandan daha özgürdür.',
    en: 'One who chooses to endure hardship is freer than one who surrenders to pleasure.',
    de: 'Wer Mühsal zu ertragen wählt, ist freier als der, der sich der Lust ergibt.',
    ru: 'Тот, кто выбирает терпеть трудность, свободнее того, кто отдаётся наслаждению.',
    fr: "Celui qui choisit d'endurer l'épreuve est plus libre que celui qui s'abandonne au plaisir.",
    es: 'Quien elige soportar la dificultad es más libre que quien se entrega al placer.' } },

  { id: '20', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Yaşamak, erdemi öğrenmek için verilmiş bir okuldur.',
    en: 'To live is a school given to us for learning virtue.',
    de: 'Das Leben ist eine Schule, die uns zum Erlernen der Tugend gegeben ist.',
    ru: 'Жизнь — это школа, данная нам для обучения добродетели.',
    fr: 'Vivre est une école qui nous est donnée pour apprendre la vertu.',
    es: 'Vivir es una escuela que se nos da para aprender la virtud.' } },
  { id: '21', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Hiçbir şey rastlantı değildir; her şey aklın düzeni içinde olur.',
    en: 'Nothing happens by chance; everything occurs within the order of reason.',
    de: 'Nichts geschieht zufällig; alles geschieht in der Ordnung der Vernunft.',
    ru: 'Ничто не случайно; всё происходит в порядке разума.',
    fr: "Rien n'arrive par hasard ; tout advient dans l'ordre de la raison.",
    es: 'Nada ocurre por azar; todo sucede dentro del orden de la razón.' } },
  { id: '22', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Bilge kişi hiçbir şeye muhtaç değildir, ama her şeyi kullanabilir.',
    en: 'The wise person needs nothing, yet can make use of everything.',
    de: 'Der Weise bedarf nichts, kann aber alles gebrauchen.',
    ru: 'Мудрец ни в чём не нуждается, но может воспользоваться всем.',
    fr: "Le sage n'a besoin de rien, et pourtant peut user de tout.",
    es: 'El sabio no necesita nada, y sin embargo puede servirse de todo.' } },

  { id: '23', authorId: 'cleanthes', sourceId: 'hymnZeus', text: {
    tr: 'Beni yönet ey Zeus, ve sen ey Kader, bana çizdiğiniz yola. Tereddütsüz izleyeceğim; istemesem bile gitmem gerekir.',
    en: 'Lead me, O Zeus, and you, O Destiny, upon the path you have set for me. I will follow without hesitation; even unwilling, I must go.',
    de: 'Führe mich, o Zeus, und du, o Schicksal, auf dem Weg, den ihr mir bestimmt habt. Ich folge ohne Zögern; selbst widerwillig muss ich gehen.',
    ru: 'Веди меня, о Зевс, и ты, о Рок, по пути, что вы мне начертали. Я последую без колебаний; даже не желая, я должен идти.',
    fr: "Conduis-moi, ô Zeus, et toi, ô Destin, sur la voie que vous m'avez tracée. Je suivrai sans hésiter ; même à contrecœur, il me faut aller.",
    es: 'Guíame, oh Zeus, y tú, oh Destino, por el camino que me habéis trazado. Os seguiré sin vacilar; aun sin querer, debo ir.' } },
  { id: '24', authorId: 'cleanthes', sourceId: 'fragments', text: {
    tr: 'İsteyeni kader yöneltir, istemeyeni sürükler.',
    en: 'The Fates guide the willing and drag the unwilling.',
    de: 'Den Willigen führt das Schicksal, den Unwilligen schleift es fort.',
    ru: 'Желающего судьба ведёт, нежелающего — тащит.',
    fr: 'Le destin conduit celui qui consent et traîne celui qui résiste.',
    es: 'El destino guía al que consiente y arrastra al que se resiste.' } },

  { id: '25', authorId: 'ariston', sourceId: 'fragments', text: {
    tr: 'Bilge kişi, hangi rolü oynarsa oynasın onu iyi oynayan usta bir oyuncuya benzer.',
    en: 'The wise person is like a skilled actor who plays well whatever role is given.',
    de: 'Der Weise gleicht einem geschickten Schauspieler, der jede Rolle gut spielt.',
    ru: 'Мудрец подобен искусному актёру, который хорошо играет любую доставшуюся роль.',
    fr: "Le sage est comme un acteur habile qui joue bien quel que soit le rôle qu'on lui donne.",
    es: 'El sabio es como un actor diestro que interpreta bien cualquier papel que le toque.' } },
  { id: '26', authorId: 'ariston', sourceId: 'fragments', text: {
    tr: 'Erdem ile kötülük dışında her şey kayıtsızdır; gerisi ne iyi ne kötüdür.',
    en: 'Everything except virtue and vice is indifferent; the rest is neither good nor bad.',
    de: 'Alles außer Tugend und Laster ist gleichgültig; der Rest ist weder gut noch schlecht.',
    ru: 'Всё, кроме добродетели и порока, безразлично; остальное ни хорошо, ни плохо.',
    fr: "Tout, hormis la vertu et le vice, est indifférent ; le reste n'est ni bon ni mauvais.",
    es: 'Todo, salvo la virtud y el vicio, es indiferente; lo demás no es ni bueno ni malo.' } },

  { id: '27', authorId: 'diogenes_b', sourceId: 'fragments', text: {
    tr: 'Doğayla uyumlu yaşamak, her seçimde sağduyuya kulak vermektir.',
    en: 'To live in accordance with nature is to heed good sense in every choice.',
    de: 'Im Einklang mit der Natur zu leben heißt, in jeder Wahl auf die Vernunft zu hören.',
    ru: 'Жить согласно природе — значит в каждом выборе слушать здравый смысл.',
    fr: 'Vivre selon la nature, c'+"'"+'est écouter le bon sens dans chaque choix.',
    es: 'Vivir conforme a la naturaleza es atender al buen juicio en cada elección.' } },

  { id: '28', authorId: 'panaetius', sourceId: 'onDuties', text: {
    tr: 'Her insanın doğası gereği üstlendiği görevler vardır; erdem bunları eksiksiz yerine getirmektir.',
    en: 'Each person has duties given by nature; virtue is fulfilling them completely.',
    de: 'Jeder Mensch hat von Natur aus Pflichten; Tugend ist es, sie vollständig zu erfüllen.',
    ru: 'У каждого по природе есть обязанности; добродетель — исполнять их полностью.',
    fr: 'Chacun a des devoirs que lui donne la nature ; la vertu consiste à les accomplir pleinement.',
    es: 'Cada persona tiene deberes dados por la naturaleza; la virtud es cumplirlos por completo.' } },
  { id: '29', authorId: 'panaetius', sourceId: 'onDuties', text: {
    tr: 'Onurlu olan ile yararlı olan asla çatışmaz; çatışıyor görünüyorsa, yanılıyoruzdur.',
    en: 'The honorable and the useful never truly conflict; if they seem to, we are mistaken.',
    de: 'Das Ehrenhafte und das Nützliche stehen nie im Widerstreit; scheint es so, irren wir.',
    ru: 'Достойное и полезное никогда не противоречат; если кажется, что да, — мы ошибаемся.',
    fr: "L'honnête et l'utile ne s'opposent jamais vraiment ; s'ils semblent le faire, c'est que nous nous trompons.",
    es: 'Lo honorable y lo útil nunca se oponen de verdad; si lo parecen, es que nos equivocamos.' } },

  { id: '30', authorId: 'posidonius', sourceId: 'fragments', text: {
    tr: 'Tek bir evren vardır ve onu saran her şey karşılıklı bir sempati ile birbirine bağlıdır.',
    en: 'There is one universe, and all within it is bound together by mutual sympathy.',
    de: 'Es gibt ein Universum, und alles darin ist durch wechselseitige Sympathie verbunden.',
    ru: 'Вселенная едина, и всё в ней связано взаимным сочувствием.',
    fr: "Il n'y a qu'un seul univers, et tout en lui est lié par une sympathie mutuelle.",
    es: 'Hay un solo universo, y todo en él está unido por una simpatía mutua.' } },
  { id: '31', authorId: 'posidonius', sourceId: 'fragments', text: {
    tr: 'Bir gün bilgelikle yaşadıysan, bütün bir ömrü yaşamış sayılırsın.',
    en: 'If you have lived one day with wisdom, you have lived a whole lifetime.',
    de: 'Hast du einen Tag mit Weisheit gelebt, so hast du ein ganzes Leben gelebt.',
    ru: 'Если ты прожил мудро хотя бы один день, ты прожил целую жизнь.',
    fr: 'Si tu as vécu un seul jour avec sagesse, tu as vécu une vie entière.',
    es: 'Si has vivido un solo día con sabiduría, has vivido una vida entera.' } },

  { id: '32', authorId: 'athenodorus', sourceId: 'plutarch', text: {
    tr: 'Öfkelendiğinde, konuşmadan ya da harekete geçmeden önce alfabenin tüm harflerini içinden say.',
    en: 'When angry, recite the whole alphabet to yourself before speaking or acting.',
    de: 'Wenn du zornig bist, sprich das ganze Alphabet im Stillen durch, bevor du redest oder handelst.',
    ru: 'Разгневавшись, мысленно повтори весь алфавит, прежде чем говорить или действовать.',
    fr: 'Quand tu es en colère, récite en toi-même tout l'+"'"+'alphabet avant de parler ou d'+"'"+'agir.',
    es: 'Cuando estés enojado, recita para ti todo el alfabeto antes de hablar o actuar.' } },

  { id: '33', authorId: 'cato', sourceId: 'plutarch', text: {
    tr: 'Özgür bir insan ancak kendi erdemiyle yenilebilir; düşmanıyla değil.',
    en: 'A free person can be conquered only by his own virtue, never by an enemy.',
    de: 'Ein freier Mensch kann nur durch seine eigene Tugend besiegt werden, nie durch einen Feind.',
    ru: 'Свободного человека можно победить лишь его собственной добродетелью, но не врагом.',
    fr: 'Un homme libre ne peut être vaincu que par sa propre vertu, jamais par un ennemi.',
    es: 'A un hombre libre solo puede vencerlo su propia virtud, nunca un enemigo.' } },
  { id: '34', authorId: 'cato', sourceId: 'plutarch', text: {
    tr: 'Doğru olanı yap; sonucu kadere bırak.',
    en: 'Do what is right; leave the outcome to fate.',
    de: 'Tu das Rechte; den Ausgang überlass dem Schicksal.',
    ru: 'Делай то, что правильно; исход оставь судьбе.',
    fr: "Fais ce qui est juste ; laisse l'issue au destin.",
    es: 'Haz lo que es justo; deja el resultado al destino.' } },

  { id: '35', authorId: 'hierocles', sourceId: 'ethicalElements', text: {
    tr: 'Önce kendini, sonra aileni, sonra şehrini, en sonunda tüm insanlığı kucaklayan halkalar çiz; ve bu halkaları sürekli merkeze doğru çekmeye çalış.',
    en: 'Draw circles that embrace first yourself, then your family, your city, and finally all humanity; and keep drawing them toward the center.',
    de: 'Ziehe Kreise, die zuerst dich selbst, dann deine Familie, deine Stadt und schließlich die ganze Menschheit umfassen; und ziehe sie stets zur Mitte hin.',
    ru: 'Очерти круги, охватывающие сначала тебя, затем семью, город и, наконец, всё человечество; и постоянно стягивай их к центру.',
    fr: "Trace des cercles qui embrassent d'abord toi-même, puis ta famille, ta cité, et enfin toute l'humanité ; et ne cesse de les ramener vers le centre.",
    es: 'Traza círculos que abarquen primero a ti mismo, luego a tu familia, tu ciudad y, por fin, a toda la humanidad; y no dejes de acercarlos hacia el centro.' } },
  { id: '36', authorId: 'hierocles', sourceId: 'ethicalElements', text: {
    tr: 'İnsan doğası gereği topluluk için yaratılmıştır; başkasına iyilik, kendine iyiliktir.',
    en: 'By nature the human being is made for community; kindness to another is kindness to oneself.',
    de: 'Von Natur aus ist der Mensch für die Gemeinschaft geschaffen; Güte gegen andere ist Güte gegen sich selbst.',
    ru: 'По природе человек создан для общности; добро другому — это добро себе.',
    fr: "Par nature, l'être humain est fait pour la communauté ; la bonté envers autrui est bonté envers soi-même.",
    es: 'Por naturaleza, el ser humano está hecho para la comunidad; la bondad hacia otro es bondad hacia uno mismo.' } },

  // ─── 130 söz genişletmesi (Türkçe; diğer diller pick() ile TR'ye düşer) ───
  // Sözler antik Stoacı kaynaklardan esinlenerek sadeleştirilmiştir.
  // Marcus Aurelius
  { id: '37', authorId: 'marcus', sourceId: 'meditations', theme: 'sabah', text: { tr: 'Bugün huysuzlukla karşılaşacaksın. Hazır ol — ama kırılma.' } },
  { id: '38', authorId: 'marcus', sourceId: 'meditations', theme: 'olum', text: { tr: 'Her işi son işinmiş gibi yap. Telaşsız, savruk değil, kendinden kaçmadan.' } },
  { id: '39', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Kendi ruhunu değiştirmek, dünyayı değiştirmekten zordur — ama tek gerçek iş budur.' } },
  { id: '40', authorId: 'marcus', sourceId: 'meditations', theme: 'kontrol', text: { tr: 'Sana olan değil, ona nasıl baktığın acıtır. Bakışını değiştir.' } },
  { id: '41', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Mutluluk dışarıda aranmaz. O, kendi zihninin bir kararıdır.' } },
  { id: '42', authorId: 'marcus', sourceId: 'meditations', theme: 'sabah', text: { tr: 'Sabah kalkmak istemediğinde sor: Ben yaşamak için mi yaratıldım, yoksa örtü altında ısınmak için mi?' } },
  { id: '43', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'İnsanlar inzivaya kaçar. Oysa en sakin sığınak, kendi içindir.' } },
  { id: '44', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Kalan ömrünü, başkalarının ne dediğini düşünerek harcama.' } },
  { id: '45', authorId: 'marcus', sourceId: 'meditations', theme: 'eylem', text: { tr: 'Engel, yolun kendisi olur. Önündeki taş, basamağındır.' } },
  { id: '46', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Geçmiş ve gelecek senin değil. Yalnızca şu an elinde.' } },
  { id: '47', authorId: 'marcus', sourceId: 'meditations', theme: 'cesaret', text: { tr: 'Bir şey zor diye yapılamaz sanma. İnsana mümkün olan, sana da mümkündür.' } },
  { id: '48', authorId: 'marcus', sourceId: 'meditations', theme: 'ofke', text: { tr: 'Öfkenin sana verdiği zarar, onu doğuran şeyden büyüktür.' } },
  { id: '49', authorId: 'marcus', sourceId: 'meditations', theme: 'sadelik', text: { tr: 'Yalın yaşa. Çoğu şey gereksiz; çıkar onları, huzur kalır.' } },
  { id: '50', authorId: 'marcus', sourceId: 'meditations', theme: 'kabul', text: { tr: 'Kimseye kin tutma. İnsanlar bilmeden hata eder — sen bilerek bağışla.' } },
  { id: '51', authorId: 'marcus', sourceId: 'meditations', theme: 'kader', text: { tr: 'Evrenin bir parçasısın. Akışına diren, yorulursun; uy, hafifle.' } },
  { id: '52', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Ne düşünürsen, ruhun o renge boyanır. Düşüncelerini seç.' } },
  { id: '53', authorId: 'marcus', sourceId: 'meditations', theme: 'olum', text: { tr: 'Ölüm doğa kadar olağan. Korkma; doğan her şey döner.' } },
  { id: '54', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Bugünü kurtar. Yarın senin değil, belki hiç gelmeyecek.' } },
  { id: '55', authorId: 'marcus', sourceId: 'meditations', theme: 'ofke', text: { tr: 'Başkasının kusuruna kızdığında, kendi benzer kusuruna bak.' } },
  { id: '56', authorId: 'marcus', sourceId: 'meditations', theme: 'sukran', text: { tr: 'İyilik yap ve unut. Karşılık bekleyen, iyilik değil ticaret yapar.' } },
  { id: '57', authorId: 'marcus', sourceId: 'meditations', theme: 'cesaret', text: { tr: 'Sınırların çoğu zihnindedir. Sınırı koyan da kaldıran da sensin.' } },
  { id: '58', authorId: 'marcus', sourceId: 'meditations', theme: 'sukran', text: { tr: 'Sahip olduklarını, hiç yokmuş da yeni kavuşmuşsun gibi düşün.' } },
  { id: '59', authorId: 'marcus', sourceId: 'meditations', theme: 'kontrol', text: { tr: 'Dış olaylar seni sarsamaz; onlara verdiğin yargı sarsar. Yargıyı bırak.' } },
  { id: '60', authorId: 'marcus', sourceId: 'meditations', theme: 'disiplin', text: { tr: 'Acele etme, ama durma da. Sakin bir kararlılıkla yürü.' } },
  { id: '61', authorId: 'marcus', sourceId: 'meditations', theme: 'eylem', text: { tr: 'Hayat kısa. Tek meyvesi: doğru bir karakter ve topluma yararlı işler.' } },
  // Seneca (md#28 "Kayıplarını değil..." mevcut id6 ile aynı → eklenmedi)
  { id: '62', authorId: 'seneca', sourceId: 'brevity', theme: 'zaman', text: { tr: 'Paranı kıskançlıkla korursun da zamanını herkese dağıtırsın. Oysa kıt olan zamandır.' } },
  { id: '63', authorId: 'seneca', sourceId: 'letters', theme: 'yas', text: { tr: 'Sevdiklerin senin değil, sana emanet. Geri vermeden önce ödünç aldığını hatırla.' } },
  { id: '64', authorId: 'seneca', sourceId: 'letters', theme: 'kaygi', text: { tr: 'Acıyı çekmeden önce çekersek, iki kez acımış oluruz.' } },
  { id: '65', authorId: 'seneca', sourceId: 'letters', theme: 'eylem', text: { tr: 'Rüzgârın yönünü bilmeyene hiçbir liman yaramaz.' } },
  { id: '66', authorId: 'seneca', sourceId: 'letters', theme: 'kaygi', text: { tr: 'Korktuğun şeyi incele. Çoğu zaman korku, olaydan büyüktür.' } },
  { id: '67', authorId: 'seneca', sourceId: 'letters', theme: 'sadelik', text: { tr: 'Zenginlik, az şeyle yetinmeyi bilmektir — çok şeye sahip olmak değil.' } },
  { id: '68', authorId: 'seneca', sourceId: 'letters', theme: 'olum', text: { tr: 'Her gün sonun olabilir gibi yaşa; ama yarın hiç gelmeyecekmiş gibi de korkma.' } },
  { id: '69', authorId: 'seneca', sourceId: 'letters', theme: 'disiplin', text: { tr: 'Yaşamayı, yaşamı bitirene dek öğreniriz.' } },
  { id: '70', authorId: 'seneca', sourceId: 'letters', theme: 'cesaret', text: { tr: 'Talih kiminle gideceğini bilir: cesurla yürür, korkağı sürükler.' } },
  { id: '71', authorId: 'seneca', sourceId: 'letters', theme: 'ic-huzur', text: { tr: 'Bilge, elindekiyle zengindir. Aptal, eksiğiyle yoksul.' } },
  { id: '72', authorId: 'seneca', sourceId: 'letters', theme: 'kabul', text: { tr: 'Hiçbir şey bizim değil; her şey ödünç. Geri istendiğinde şikâyet etme.' } },
  { id: '73', authorId: 'seneca', sourceId: 'letters', theme: 'dostluk', text: { tr: 'Çok kişiyle değil, doğru kişiyle vakit geçir. Kalite, kalabalığı yener.' } },
  { id: '74', authorId: 'seneca', sourceId: 'onAnger', theme: 'ofke', text: { tr: 'Öfke, kısa süreli bir deliliktir. Bir an bekle — akıl geri gelsin.' } },
  { id: '75', authorId: 'seneca', sourceId: 'letters', theme: 'kabul', text: { tr: 'Geleceği merak etme. Onu olduğu gibi karşıla — ister tatlı, ister acı.' } },
  { id: '76', authorId: 'seneca', sourceId: 'letters', theme: 'disiplin', text: { tr: 'En büyük güç, kendine hâkim olmaktır.' } },
  { id: '77', authorId: 'seneca', sourceId: 'letters', theme: 'zaman', text: { tr: 'Bir gün bile, dikkatle yaşanırsa, koca bir ömre bedeldir.' } },
  { id: '78', authorId: 'seneca', sourceId: 'brevity', theme: 'zaman', text: { tr: 'Yol uzun değil — biz oyalanıyoruz. Ömür kısa değil, biz savuruyoruz.' } },
  { id: '79', authorId: 'seneca', sourceId: 'letters', theme: 'sadelik', text: { tr: 'Yoksulluk az şeye sahip olmak değil, çok şeye aç olmaktır.' } },
  { id: '80', authorId: 'seneca', sourceId: 'letters', theme: 'kader', text: { tr: 'Kaderi kabul et; o seni zaten taşıyor. Diren, sadece yorulursun.' } },
  { id: '81', authorId: 'seneca', sourceId: 'letters', theme: 'dostluk', text: { tr: 'Dostluk fayda için değildir. Fayda için sevilen, fayda bitince bırakılır.' } },
  { id: '82', authorId: 'seneca', sourceId: 'letters', theme: 'cesaret', text: { tr: 'Her yeni başlangıç, bir önceki cesaretin meyvesidir.' } },
  { id: '83', authorId: 'seneca', sourceId: 'letters', theme: 'olum', text: { tr: 'Ne kadar yaşadığın değil, nasıl yaşadığın önemli.' } },
  { id: '84', authorId: 'seneca', sourceId: 'onAnger', theme: 'ofke', text: { tr: 'Kızgınken hiçbir karar verme. Dalga geçince denize bak.' } },
  { id: '85', authorId: 'seneca', sourceId: 'letters', theme: 'sukran', text: { tr: 'Şükret — ama yokken de huzurlu kalabilecek kadar az şeye bağlan.' } },
  // Epiktetos
  { id: '86', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Bazı şeyler senin elinde, bazıları değil. Huzur, ikisini ayırdığın an başlar.' } },
  { id: '87', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'ofke', text: { tr: 'Seni öfkelendiren olay değil, ona verdiğin anlam. Tepkiye bir an tanı.' } },
  { id: '88', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kaygi', text: { tr: 'İnsanı üzen şeyler değil, şeyler hakkındaki düşünceleridir.' } },
  { id: '89', authorId: 'epictetus', sourceId: 'discourses', theme: 'ic-huzur', text: { tr: 'Hayatını değiştirmek istiyorsan, önce düşünceni değiştir.' } },
  { id: '90', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'yas', text: { tr: "Sahip olduğun hiçbir şeyi 'kaybettim' deme; 'geri verdim' de." } },
  { id: '91', authorId: 'epictetus', sourceId: 'discourses', theme: 'sadelik', text: { tr: 'İki kulağın, bir ağzın var. Bunu unutma.' } },
  { id: '92', authorId: 'epictetus', sourceId: 'discourses', theme: 'ic-huzur', text: { tr: 'Özgürlük, istediğini elde etmekle değil, isteklerini terbiye etmekle gelir.' } },
  { id: '93', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Kimse seni rızan olmadan incitemez. İncinmeyi de sen seçersin.' } },
  { id: '94', authorId: 'epictetus', sourceId: 'discourses', theme: 'eylem', text: { tr: 'Önce ne olmak istediğine karar ver. Sonra yapman gerekeni yap.' } },
  { id: '95', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'ic-huzur', text: { tr: 'Başkalarının seni kınamasına değil, kendi vicdanına bak.' } },
  { id: '96', authorId: 'epictetus', sourceId: 'discourses', theme: 'cesaret', text: { tr: 'Felsefenin meyvesi, hiçbir koşulda sarsılmayan bir ruhtur.' } },
  { id: '97', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kabul', text: { tr: 'Olayların olmasını istediğin gibi değil, oldukları gibi iste. Huzur böyle gelir.' } },
  { id: '98', authorId: 'epictetus', sourceId: 'discourses', theme: 'disiplin', text: { tr: 'Küçük şeylerde ustalaş. Büyük denge, küçük disiplinlerden doğar.' } },
  { id: '99', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'cesaret', text: { tr: 'Hasta beden, hür bir iradeye engel değildir — sakat olan bedenin değil, seçimindir.' } },
  { id: '100', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'sadelik', text: { tr: 'Konuşmadan önce sus. Çoğu pişmanlık, fazladan söylenen sözdür.' } },
  { id: '101', authorId: 'epictetus', sourceId: 'discourses', theme: 'cesaret', text: { tr: 'Sınavlar olmadan güç olmaz. Zorluk, erdeminin antrenörüdür.' } },
  { id: '102', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Başkasının işine karışma; kendi bahçeni ek. Yeter de artar.' } },
  { id: '103', authorId: 'epictetus', sourceId: 'discourses', theme: 'kabul', text: { tr: 'Kaybından korkmadığın şey, gerçekten senindir.' } },
  { id: '104', authorId: 'epictetus', sourceId: 'discourses', theme: 'disiplin', text: { tr: 'Bekle ve sus. Olgunlaşmamış meyveyi koparmak, ham bırakır.' } },
  { id: '105', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kabul', text: { tr: 'Sana ait olmayan için üzülme. Yağmura kızan, ıslanmaktan kurtulmaz.' } },
  { id: '106', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'eylem', text: { tr: 'İyi bir insan ol — bunu kanıtlamaya değil, olmaya çalış.' } },
  { id: '107', authorId: 'epictetus', sourceId: 'discourses', theme: 'sabah', text: { tr: 'Her sabah kendine sor: bugün hangi kötü huyumla savaşacağım?' } },
  // Musonius Rufus
  { id: '108', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Felsefeyi bilmek değil, yaşamak gerekir. Bilgi, alışkanlığa dönünce senin olur.' } },
  { id: '109', authorId: 'musonius', sourceId: 'lectures', theme: 'cesaret', text: { tr: 'Zor olanı seç. Kolaylık gevşetir, zorluk güçlendirir.' } },
  { id: '110', authorId: 'musonius', sourceId: 'lectures', theme: 'olum', text: { tr: 'İyi yaşamak, çok yaşamaktan değerlidir.' } },
  { id: '111', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Bedenini de terbiye et; erdem yalnız zihinde değil, alışkanlıkta yaşar.' } },
  { id: '112', authorId: 'musonius', sourceId: 'lectures', theme: 'sadelik', text: { tr: 'Az ile yetinmeyi öğren. İhtiyacın azaldıkça özgürlüğün artar.' } },
  { id: '113', authorId: 'musonius', sourceId: 'lectures', theme: 'cesaret', text: { tr: 'Acıya dayanmak öğrenilir. Her küçük dayanışma, seni büyütür.' } },
  { id: '114', authorId: 'musonius', sourceId: 'lectures', theme: 'sadelik', text: { tr: 'Gerçek süs, giysi değil karakterdir.' } },
  { id: '115', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Öğrenmek kolay, uygulamak zordur. Değer, zor olandadır.' } },
  { id: '116', authorId: 'musonius', sourceId: 'lectures', theme: 'eylem', text: { tr: 'Herkese adil davran — kazanç için değil, doğru olduğu için.' } },
  { id: '117', authorId: 'musonius', sourceId: 'lectures', theme: 'ic-huzur', text: { tr: 'Sağlıklı bir ruh, sade bir hayatta yeşerir.' } },
  // Kleanthes
  { id: '118', authorId: 'cleanthes', sourceId: 'hymnZeus', theme: 'kader', text: { tr: 'Kader razı olanı yürütür, direneni sürükler.' } },
  { id: '119', authorId: 'cleanthes', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Akışa uy. Evren seni zaten taşıyor — sadece bırak.' } },
  { id: '120', authorId: 'cleanthes', sourceId: 'fragments', theme: 'cesaret', text: { tr: 'Erdem, güçlü bir ruhun değişmez duruşudur.' } },
  { id: '121', authorId: 'cleanthes', sourceId: 'fragments', theme: 'disiplin', text: { tr: 'İyiyi seçmek alışkanlık ister. Her gün biraz daha.' } },
  { id: '122', authorId: 'cleanthes', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Düzen her yerde. Kaos sandığın şey, görmediğin uyumdur.' } },
  // Hierokles
  { id: '123', authorId: 'hierocles', sourceId: 'ethicalElements', theme: 'dostluk', text: { tr: 'Önce kendine, sonra yakınına, sonra herkese — şefkat halkalar halinde büyür.' } },
  { id: '124', authorId: 'hierocles', sourceId: 'ethicalElements', theme: 'dostluk', text: { tr: 'Komşunu uzak biri gibi değil, kendinin uzantısı gibi gör.' } },
  { id: '125', authorId: 'hierocles', sourceId: 'fragments', theme: 'dostluk', text: { tr: 'Aile, erdemin ilk okuludur. Orada öğrenemezsen, dışarıda zor.' } },
  { id: '126', authorId: 'hierocles', sourceId: 'fragments', theme: 'kabul', text: { tr: 'İnsanlık tek beden. Birinin acısı, hepimizin acısıdır.' } },
  { id: '127', authorId: 'hierocles', sourceId: 'fragments', theme: 'eylem', text: { tr: 'Görevini sevgiyle yap. Zorunluluk, gönülle hafifler.' } },
  // Zenon (Kıbrıslı)
  { id: '128', authorId: 'zeno', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'İyi akış hâlindeki bir hayat — mutluluk budur, başka değil.' } },
  { id: '129', authorId: 'zeno', sourceId: 'fragments', theme: 'sadelik', text: { tr: 'Doğaya uygun yaşa. Geri kalan gürültüdür.' } },
  { id: '130', authorId: 'zeno', sourceId: 'fragments', theme: 'sadelik', text: { tr: 'Az konuş, çok dinle. Doğa bunu kulak ve dille zaten söylüyor.' } },
  { id: '131', authorId: 'zeno', sourceId: 'fragments', theme: 'disiplin', text: { tr: 'İki kez düşün, bir kez konuş. Söz, atılan ok gibidir.' } },
  { id: '132', authorId: 'zeno', sourceId: 'fragments', theme: 'eylem', text: { tr: 'Mutluluk, küçük adımların toplamıdır — ama küçük bir şey değildir.' } },
  // Khrysippos
  { id: '133', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Bilge, talihin her yüzüne hazırdır — gülüşüne de, kaşına da.' } },
  { id: '134', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kontrol', text: { tr: 'Mantığını yitirme. Duygu fırtınadır; akıl, dümendir.' } },
  { id: '135', authorId: 'chrysippus', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'Erdem yeter. Mutluluk için fazlasına ihtiyacın yok.' } },
  { id: '136', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kader', text: { tr: 'Evrende tesadüf yok. Her şey bir nedenin çocuğu.' } },
  // Cato (Genç) — md#102 "Doğru olanı yap..." mevcut id34 ile aynı → eklenmedi
  { id: '137', authorId: 'cato', sourceId: 'attributed', theme: 'cesaret', text: { tr: 'Eğilmektense kırılmayı seç — ama gereksiz yere değil.' } },
  { id: '138', authorId: 'cato', sourceId: 'attributed', theme: 'cesaret', text: { tr: 'Bir insanın değeri, baskı altında ne yaptığıyla ölçülür.' } },
  // Posidonius
  { id: '139', authorId: 'posidonius', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Evreni anla, kendini anlarsın. İkisi aynı dokunun parçası.' } },
  { id: '140', authorId: 'posidonius', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'Bilgi, ruhu hastalıktan arındıran tek ilaçtır.' } },
  { id: '141', authorId: 'posidonius', sourceId: 'fragments', theme: 'kontrol', text: { tr: 'Tutkular bedenden doğar; akılla terbiye edilir.' } },
  // Stoacı Gelenek — genel miras
  { id: '142', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Sakinlik bir kaçış değil, seçilmiş bir duruştur.' } },
  { id: '143', authorId: 'tradition', sourceId: 'tradition', theme: 'kontrol', text: { tr: 'Fırtınayı durduramazsın ama yelkenini ayarlayabilirsin.' } },
  { id: '144', authorId: 'tradition', sourceId: 'tradition', theme: 'sadelik', text: { tr: 'Az şeye ihtiyaç duyan, hür adama en yakın olandır.' } },
  { id: '145', authorId: 'tradition', sourceId: 'tradition', theme: 'zaman', text: { tr: 'Bugün için yaşa — ama yarını da hor görme.' } },
  { id: '146', authorId: 'tradition', sourceId: 'tradition', theme: 'kaygi', text: { tr: 'Kontrol edemediğin şeye harcadığın endişe, çalınan zamandır.' } },
  { id: '147', authorId: 'tradition', sourceId: 'tradition', theme: 'yas', text: { tr: 'Yas, sevginin gölgesidir. Gölgeye değil, ışığa bak.' } },
  { id: '148', authorId: 'tradition', sourceId: 'tradition', theme: 'cesaret', text: { tr: 'Cesaret korkusuzluk değil, korkuya rağmen yürümektir.' } },
  { id: '149', authorId: 'tradition', sourceId: 'tradition', theme: 'sukran', text: { tr: 'Şükran, sahip olduğunu iki kez yaşamaktır.' } },
  // Karma — günlük ritim & pratik
  { id: '150', authorId: 'tradition', sourceId: 'tradition', theme: 'sabah', text: { tr: 'Sabah niyetini kur, akşam gününü tart. Arada sadece yürü.' } },
  { id: '151', authorId: 'tradition', sourceId: 'tradition', theme: 'kontrol', text: { tr: 'Bugün kontrolünde olan tek şey: bir sonraki seçimin.' } },
  { id: '152', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Acele bir karar, yavaş bir pişmanlıktır.' } },
  { id: '153', authorId: 'tradition', sourceId: 'tradition', theme: 'kaygi', text: { tr: 'Kötü haber geldiğinde sor: bu gerçekten benim elimde mi?' } },
  { id: '154', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Nefes al. Bu an, sahip olduğun tek gerçek.' } },
  { id: '155', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Karşılaştırma hırsızdır — huzurunu çalar. Kendi yoluna bak.' } },
  { id: '156', authorId: 'tradition', sourceId: 'tradition', theme: 'kabul', text: { tr: 'Bir şeyi değiştiremiyorsan, ona karşı tutumunu değiştir.' } },
  { id: '157', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Akşam üç soru: Ne iyi yaptım? Nerede yanıldım? Yarın nasıl daha iyi?' } },
  { id: '158', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Övgüye de yergiye de aynı sükûnetle bak. İkisi de geçer.' } },
  { id: '159', authorId: 'tradition', sourceId: 'tradition', theme: 'sukran', text: { tr: 'Sahip olduğunu bir an için kaybettiğini düşün — sonra geri kazandığını. İşte şükran.' } },
  { id: '160', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Mükemmel olmaya değil, biraz daha iyi olmaya çalış.' } },
  { id: '161', authorId: 'tradition', sourceId: 'tradition', theme: 'ofke', text: { tr: 'Öfke yükseldiğinde, on say. Sayarken çoğu öfke düşer.' } },
  { id: '162', authorId: 'tradition', sourceId: 'tradition', theme: 'zaman', text: { tr: 'Geçmişe takılma, geleceğe kaçma. Hayat tam buradadır.' } },
  { id: '163', authorId: 'tradition', sourceId: 'tradition', theme: 'eylem', text: { tr: 'Yapabileceğinin en iyisini yap, gerisini sakince bırak.' } },
  { id: '164', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Her gün küçük bir zafer: söz verdiğin şeyi yapmak.' } },
];

export interface Quote { id: string; authorId: string; text: string; author: string; source: string; }

export function getQuotes(lang: Lang): Quote[] {
  return QUOTES_RAW.map((q) => ({
    id: q.id,
    authorId: q.authorId,
    text: pick(q.text, lang),
    author: authorName(q.authorId, lang),
    source: sourceName(q.sourceId, lang),
  }));
}

export function getTodaysQuote(lang: Lang): Quote {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const q = QUOTES_RAW[dayOfYear % QUOTES_RAW.length];
  return { id: q.id, authorId: q.authorId, text: pick(q.text, lang), author: authorName(q.authorId, lang), source: sourceName(q.sourceId, lang) };
}

// ─── Kavramlar ────────────────────────────────────────────
// practice: günlük hayata bağlayan kısa "pratik bağ" cümlesi (opsiyonel)
interface RawConcept { latin: string; icon: string; color: string; name: L; desc: L; example: L; practice?: L; }

const CONCEPTS_RAW: RawConcept[] = [
  { latin: 'Amor Fati', icon: '♾', color: 'rgba(212,146,74,0.15)',
    name: { tr: 'Kaderini Sev', en: 'Love Your Fate', de: 'Liebe dein Schicksal', ru: 'Люби свою судьбу', fr: 'Aime ton destin', es: 'Ama tu destino' },
    desc: {
      tr: 'Her olayı — acı veren ya da keyifli — olması gerektiği gibi kabul etmek. Dirençten değil kabulden güç doğar.',
      en: 'To accept every event — painful or pleasant — as it ought to be. Strength is born of acceptance, not resistance.',
      de: 'Jedes Ereignis — schmerzhaft oder angenehm — so anzunehmen, wie es sein soll. Kraft entsteht aus Annahme, nicht aus Widerstand.',
      ru: 'Принимать всякое событие — болезненное или приятное — таким, каким оно должно быть. Сила рождается из принятия, а не из сопротивления.',
      fr: "Accepter chaque événement — douloureux ou agréable — tel qu'il doit être. La force naît de l'acceptation, non de la résistance.",
      es: 'Aceptar cada suceso — doloroso o placentero — tal como debe ser. La fuerza nace de la aceptación, no de la resistencia.' },
    example: {
      tr: 'İşini kaybettiğinde "Bu beni nasıl daha güçlü yapabilir?" diye sormak Amor Fati\'dir.',
      en: 'When you lose your job, asking "How can this make me stronger?" is Amor Fati.',
      de: 'Wenn du deine Arbeit verlierst und fragst „Wie kann mich das stärker machen?“, ist das Amor Fati.',
      ru: 'Потеряв работу, спросить «Как это сделает меня сильнее?» — это Amor Fati.',
      fr: "Quand tu perds ton emploi, te demander « En quoi cela peut-il me rendre plus fort ? », c'est Amor Fati.",
      es: 'Cuando pierdes tu trabajo, preguntarte «¿Cómo puede esto hacerme más fuerte?» es Amor Fati.' },
    practice: {
      tr: 'Bugün ters giden bir şey olduğunda sor: bu bana ne öğretebilir?',
      en: 'When something goes wrong today, ask: what can this teach me?',
      de: 'Wenn heute etwas schiefgeht, frage: Was kann mich das lehren?',
      ru: 'Когда сегодня что-то пойдёт не так, спроси: чему это может меня научить?',
      fr: "Quand quelque chose tourne mal aujourd'hui, demande : que puis-je en apprendre ?",
      es: 'Cuando algo salga mal hoy, pregunta: ¿qué puede enseñarme esto?' } },
  { latin: 'Memento Mori', icon: '⧗', color: 'rgba(180,120,80,0.15)',
    name: { tr: 'Ölümü Hatırla', en: 'Remember Death', de: 'Gedenke des Todes', ru: 'Помни о смерти', fr: 'Souviens-toi de la mort', es: 'Recuerda la muerte' },
    desc: {
      tr: 'Ölümlülüğünü hatırlamak seni karamsarlığa değil, uyanıklığa iter. Sınırlı zamanın olduğunu bilmek her anı değerli kılar.',
      en: 'Remembering your mortality drives you not to gloom but to wakefulness. Knowing your time is limited makes each moment precious.',
      de: 'Sich der eigenen Sterblichkeit zu erinnern führt nicht zu Düsternis, sondern zu Wachheit. Zu wissen, dass die Zeit begrenzt ist, macht jeden Augenblick kostbar.',
      ru: 'Память о смертности ведёт не к унынию, а к бодрствованию. Зная, что время ограничено, ценишь каждое мгновение.',
      fr: "Se souvenir de sa mortalité ne mène pas à la morosité, mais à l'éveil. Savoir que le temps est limité rend chaque instant précieux.",
      es: 'Recordar tu mortalidad no lleva a la tristeza, sino al despertar. Saber que el tiempo es limitado hace precioso cada instante.' },
    example: {
      tr: '"Bu sabah uyandığımda ölmemiştim" — bu düşünce her günü bir hediye olarak görmeni sağlar.',
      en: '"This morning I woke and had not died" — this thought lets you see each day as a gift.',
      de: '„Heute Morgen erwachte ich und war nicht gestorben“ — dieser Gedanke lässt dich jeden Tag als Geschenk sehen.',
      ru: '«Сегодня утром я проснулся и не умер» — эта мысль помогает видеть каждый день как дар.',
      fr: "« Ce matin, je me suis réveillé et je n'étais pas mort » — cette pensée te fait voir chaque jour comme un cadeau.",
      es: '«Esta mañana desperté y no había muerto» — este pensamiento te hace ver cada día como un regalo.' },
    practice: {
      tr: 'Sabah uyandığında bir an dur ve bugünün bir armağan olduğunu hatırla.',
      en: 'When you wake, pause a moment and remember today is a gift.',
      de: 'Wenn du erwachst, halte kurz inne und denke daran: Heute ist ein Geschenk.',
      ru: 'Проснувшись, остановись на миг и вспомни: сегодня — это дар.',
      fr: "Au réveil, marque une pause et souviens-toi : aujourd'hui est un cadeau.",
      es: 'Al despertar, haz una pausa y recuerda: hoy es un regalo.' } },
  { latin: 'Premeditatio Malorum', icon: '◈', color: 'rgba(100,140,180,0.15)',
    name: { tr: 'Kötülükleri Önceden Düşün', en: 'Foresee Adversity', de: 'Das Übel vorausdenken', ru: 'Предвидеть невзгоды', fr: "Prévoir l'adversité", es: 'Prever la adversidad' },
    desc: {
      tr: 'Olası zorlukları zihinsel olarak prova etmek, onlarla karşılaştığında hazırlıklı olmanı sağlar. Bu korku değil, hazırlıktır.',
      en: 'Mentally rehearsing possible hardships prepares you to meet them. This is not fear, but readiness.',
      de: 'Mögliche Schwierigkeiten im Geist durchzuspielen bereitet dich darauf vor, ihnen zu begegnen. Das ist keine Furcht, sondern Bereitschaft.',
      ru: 'Мысленная репетиция возможных трудностей готовит к встрече с ними. Это не страх, а готовность.',
      fr: "Répéter mentalement les difficultés possibles te prépare à les affronter. Ce n'est pas de la peur, mais de la préparation.",
      es: 'Ensayar mentalmente las posibles dificultades te prepara para afrontarlas. No es miedo, sino preparación.' },
    example: {
      tr: 'Bir sunum öncesi "Ya yanılırsam? Ya teknik aksaklık olursa?" diye sorup cevabını düşünmek.',
      en: 'Before a presentation, asking "What if I err? What if tech fails?" and preparing your answer.',
      de: 'Vor einer Präsentation zu fragen „Was, wenn ich mich irre? Was, wenn die Technik versagt?“ und die Antwort zu bedenken.',
      ru: 'Перед презентацией спросить «А если ошибусь? А если откажет техника?» и продумать ответ.',
      fr: "Avant une présentation, te demander « Et si je me trompe ? Et si la technique lâche ? » et préparer ta réponse.",
      es: 'Antes de una presentación, preguntarte «¿Y si me equivoco? ¿Y si falla la tecnología?» y preparar tu respuesta.' },
    practice: {
      tr: 'Önemli bir işe başlamadan önce, ters gidebilecek bir şeyi düşün ve yanıtını hazırla.',
      en: 'Before an important task, picture one thing that could go wrong and prepare your response.',
      de: 'Stell dir vor einer wichtigen Aufgabe eine Sache vor, die schiefgehen könnte, und bereite deine Antwort vor.',
      ru: 'Перед важным делом представь, что может пойти не так, и подготовь ответ.',
      fr: "Avant une tâche importante, imagine une chose qui pourrait mal tourner et prépare ta réponse.",
      es: 'Antes de una tarea importante, imagina algo que podría salir mal y prepara tu respuesta.' } },
  { latin: 'Dichotomy of Control', icon: '◎', color: 'rgba(80,160,120,0.15)',
    name: { tr: 'Kontrol Dairesi', en: 'Dichotomy of Control', de: 'Dichotomie der Kontrolle', ru: 'Дихотомия контроля', fr: 'Dichotomie du contrôle', es: 'Dicotomía del control' },
    desc: {
      tr: 'Her şeyi iki kategoriye ayır: kontrolündeki (düşünceler, kararlar, tepkiler) ve kontrolün dışındaki. Enerjini yalnızca birincisine ver.',
      en: 'Divide everything into two: what is in your control (thoughts, choices, responses) and what is not. Give your energy only to the first.',
      de: 'Teile alles in zwei: was in deiner Macht steht (Gedanken, Entscheidungen, Reaktionen) und was nicht. Gib deine Kraft nur dem Ersten.',
      ru: 'Раздели всё на две части: подвластное тебе (мысли, решения, реакции) и неподвластное. Отдавай силы только первому.',
      fr: "Divise tout en deux : ce qui dépend de toi (pensées, choix, réactions) et ce qui n'en dépend pas. Ne donne ton énergie qu'au premier.",
      es: 'Divide todo en dos: lo que está en tu poder (pensamientos, decisiones, reacciones) y lo que no. Dedica tu energía solo a lo primero.' },
    example: {
      tr: 'Trafik sıkışıklığı kontrolünde değil. Ama sakin kalıp müzik dinlemek senin elinde.',
      en: 'Traffic is not in your control. But staying calm and listening to music is.',
      de: 'Der Stau liegt nicht in deiner Macht. Aber ruhig zu bleiben und Musik zu hören schon.',
      ru: 'Пробка не в твоей власти. Но оставаться спокойным и слушать музыку — в твоей.',
      fr: 'Les embouteillages ne dépendent pas de toi. Mais rester calme et écouter de la musique, oui.',
      es: 'El tráfico no está en tu poder. Pero mantener la calma y escuchar música, sí.' },
    practice: {
      tr: 'Bir şey seni kaygılandırdığında sor: bu gerçekten benim kontrolümde mi?',
      en: 'When something worries you, ask: is this truly in my control?',
      de: 'Wenn dich etwas beunruhigt, frage: Liegt das wirklich in meiner Macht?',
      ru: 'Когда что-то тревожит, спроси: действительно ли это в моей власти?',
      fr: "Quand quelque chose t'inquiète, demande : cela dépend-il vraiment de moi ?",
      es: 'Cuando algo te preocupe, pregunta: ¿esto está realmente en mi poder?' } },
  { latin: 'Eudaimonia', icon: '✦', color: 'rgba(196,169,106,0.15)',
    name: { tr: 'İyi Yaşam', en: 'Flourishing', de: 'Gutes Leben', ru: 'Благоденствие', fr: 'La vie accomplie', es: 'El buen vivir' },
    desc: {
      tr: 'Stoacılıkta mutluluk dış koşullara değil, erdemli yaşamaya dayanır. Gerçek huzur sahip olduklarından değil, kim olduğundan gelir.',
      en: 'In Stoicism, happiness rests not on circumstances but on living virtuously. True peace comes from who you are, not what you own.',
      de: 'Im Stoizismus beruht Glück nicht auf Umständen, sondern auf tugendhaftem Leben. Wahrer Frieden kommt daher, wer du bist, nicht was du besitzt.',
      ru: 'В стоицизме счастье зиждется не на обстоятельствах, а на добродетельной жизни. Истинный покой — от того, кто ты, а не от того, чем владеешь.',
      fr: "Dans le stoïcisme, le bonheur ne repose pas sur les circonstances, mais sur une vie vertueuse. La vraie paix vient de qui tu es, non de ce que tu possèdes.",
      es: 'En el estoicismo, la felicidad no depende de las circunstancias, sino de vivir con virtud. La verdadera paz viene de quién eres, no de lo que posees.' },
    example: {
      tr: 'Zenginlik, ün veya güzellik olmadan da tam bir insan olunabilir — erdemi seçmek yeterli.',
      en: 'One can be a complete human without wealth, fame, or beauty — choosing virtue is enough.',
      de: 'Man kann ohne Reichtum, Ruhm oder Schönheit ein ganzer Mensch sein — die Tugend zu wählen genügt.',
      ru: 'Можно быть цельным человеком без богатства, славы и красоты — достаточно выбрать добродетель.',
      fr: 'On peut être pleinement humain sans richesse, gloire ni beauté — choisir la vertu suffit.',
      es: 'Se puede ser plenamente humano sin riqueza, fama ni belleza — basta con elegir la virtud.' },
    practice: {
      tr: "Bugün bir seçimde 'doğru olan' ile 'kolay olan' arasında dur ve erdemi seç.",
      en: 'In a choice today, pause between what is right and what is easy, and choose virtue.',
      de: 'Halte heute bei einer Wahl zwischen dem Richtigen und dem Einfachen inne und wähle die Tugend.',
      ru: 'Сегодня в выборе между правильным и лёгким остановись и выбери добродетель.',
      fr: "Dans un choix aujourd'hui, hésite entre le juste et le facile, et choisis la vertu.",
      es: 'En una elección de hoy, detente entre lo correcto y lo fácil, y elige la virtud.' } },
  { latin: 'Sympatheia', icon: '∞', color: 'rgba(160,100,180,0.15)',
    name: { tr: 'Evrensel Bağ', en: 'Universal Connection', de: 'Universale Verbundenheit', ru: 'Всеобщая связь', fr: 'Lien universel', es: 'Conexión universal' },
    desc: {
      tr: 'Her şey birbirine bağlıdır. Başkalarına zarar vermek kendine zarar vermektir. Evrenin küçük ama önemli bir parçasısın.',
      en: 'All things are interconnected. To harm others is to harm yourself. You are a small but vital part of the whole.',
      de: 'Alles ist miteinander verbunden. Anderen zu schaden heißt, sich selbst zu schaden. Du bist ein kleiner, doch wichtiger Teil des Ganzen.',
      ru: 'Всё взаимосвязано. Вредить другим — значит вредить себе. Ты малая, но важная часть целого.',
      fr: "Tout est interconnecté. Nuire aux autres, c'est se nuire à soi-même. Tu es une part petite mais essentielle du tout.",
      es: 'Todo está interconectado. Dañar a otros es dañarte a ti mismo. Eres una parte pequeña pero esencial del todo.' },
    example: {
      tr: 'Birine yardım ettiğinde sadece onu değil, bütünün dengesini iyileştiriyorsun.',
      en: 'When you help someone, you improve not just them but the balance of the whole.',
      de: 'Wenn du jemandem hilfst, verbesserst du nicht nur ihn, sondern das Gleichgewicht des Ganzen.',
      ru: 'Помогая кому-то, ты улучшаешь не только его, но и равновесие целого.',
      fr: "Quand tu aides quelqu'un, tu améliores non seulement cette personne, mais l'équilibre du tout.",
      es: 'Cuando ayudas a alguien, mejoras no solo a esa persona, sino el equilibrio del todo.' },
    practice: {
      tr: 'Bugün küçük bir iyilik yap ve bunun bütüne dokunduğunu hatırla.',
      en: 'Do one small kindness today and remember it touches the whole.',
      de: 'Tu heute eine kleine Güte und denke daran, dass sie das Ganze berührt.',
      ru: 'Сделай сегодня маленькое добро и помни: оно касается целого.',
      fr: "Fais une petite bonté aujourd'hui et souviens-toi qu'elle touche le tout.",
      es: 'Haz una pequeña bondad hoy y recuerda que toca al todo.' } },
  { latin: 'Logos', icon: '☉', color: 'rgba(150,150,90,0.15)',
    name: { tr: 'Evrensel Akıl', en: 'Universal Reason', de: 'Universale Vernunft', ru: 'Вселенский разум', fr: 'Raison universelle', es: 'Razón universal' },
    desc: {
      tr: 'Evreni yöneten bir düzen, bir akıl vardır. Akla uygun yaşamak, bu düzenle uyum içinde olmaktır.',
      en: 'There is an order, a reason, governing the universe. To live rationally is to be in harmony with it.',
      de: 'Es gibt eine Ordnung, eine Vernunft, die das Universum lenkt. Vernünftig zu leben heißt, mit ihr im Einklang zu sein.',
      ru: 'Вселенной правит порядок, разум. Жить разумно — значит быть в согласии с ним.',
      fr: "Un ordre, une raison gouverne l'univers. Vivre selon la raison, c'est être en harmonie avec lui.",
      es: 'Hay un orden, una razón que gobierna el universo. Vivir conforme a la razón es estar en armonía con él.' },
    example: {
      tr: 'Bir nehir gibi: akışa direnmek yerine onun mantığını anlamak huzur getirir.',
      en: 'Like a river: instead of fighting the current, understanding its logic brings peace.',
      de: 'Wie ein Fluss: Statt gegen die Strömung zu kämpfen, bringt es Frieden, ihre Logik zu verstehen.',
      ru: 'Как река: вместо борьбы с течением, понимание его логики приносит покой.',
      fr: "Comme un fleuve : plutôt que de lutter contre le courant, en comprendre la logique apporte la paix.",
      es: 'Como un río: en vez de luchar contra la corriente, comprender su lógica trae paz.' },
    practice: {
      tr: 'Bir şeye direnmek istediğinde sor: bunun arkasında görmediğim bir düzen olabilir mi?',
      en: "When you want to resist something, ask: could there be an order behind it I don't see?",
      de: 'Wenn du dich gegen etwas sträuben willst, frage: Könnte dahinter eine Ordnung stecken, die ich nicht sehe?',
      ru: 'Когда хочешь сопротивляться, спроси: нет ли за этим порядка, которого я не вижу?',
      fr: "Quand tu veux résister à quelque chose, demande : n'y a-t-il pas un ordre que je ne vois pas ?",
      es: 'Cuando quieras resistirte a algo, pregunta: ¿habrá un orden detrás que no veo?' } },

  // ─── 5 yeni kavram (TR; diğer diller pick() ile TR'ye düşer) ───
  { latin: 'Aretē', icon: '⚖', color: 'rgba(150,130,90,0.15)',
    name: { tr: 'Dört Erdem', en: 'The Four Virtues', de: 'Die vier Tugenden', ru: 'Четыре добродетели', fr: 'Les quatre vertus', es: 'Las cuatro virtudes' },
    desc: {
      tr: 'Stoacılığın tüm ahlakı dört sütuna dayanır: bilgelik, cesaret, adalet, ölçülülük. İyi bir hayat, bu dördünü yaşamaktır.\n\nStoacılar için "iyi" olan tek şey erdemdir — para, ün, sağlık değil. Erdem de dört temel biçimde görünür. Bilgelik: neyin kontrolünde olduğunu, neyin olmadığını görmek. Cesaret: korkuya rağmen doğru olanı yapmak. Adalet: herkese hakkını vermek, ortak iyiyi gözetmek. Ölçülülük: arzu ve tepkilerinde dengeyi korumak. Bu dördü ayrı beceriler değil, aynı bilgeliğin farklı yüzleridir. Birini geliştirdiğinde diğerleri de güçlenir. Mutluluğu dışarıda değil, bu dört erdemi yaşamakta ara — çünkü tek gerçekten senin olan, karakterindir.',
      en: 'All of Stoic ethics rests on four pillars: wisdom, courage, justice, temperance. A good life means living these four.\n\nFor the Stoics the only true "good" is virtue — not money, fame or health. And virtue appears in four basic forms. Wisdom: seeing what is in your control and what is not. Courage: doing what is right despite fear. Justice: giving each their due and caring for the common good. Temperance: keeping balance in your desires and reactions. These four are not separate skills but different faces of the same wisdom. Strengthen one and the others grow too. Seek happiness not outside but in living these four virtues — for the only thing truly yours is your character.',
      de: 'Die gesamte stoische Ethik ruht auf vier Säulen: Weisheit, Mut, Gerechtigkeit, Mäßigung. Ein gutes Leben heißt, diese vier zu leben.\n\nFür die Stoiker ist das einzig wahre „Gute“ die Tugend — nicht Geld, Ruhm oder Gesundheit. Und Tugend zeigt sich in vier Grundformen. Weisheit: erkennen, was in deiner Macht steht und was nicht. Mut: das Rechte tun trotz Furcht. Gerechtigkeit: jedem das Seine geben und das Gemeinwohl achten. Mäßigung: das Gleichgewicht in Begierden und Reaktionen wahren. Diese vier sind keine getrennten Fähigkeiten, sondern verschiedene Gesichter derselben Weisheit. Stärkst du eine, wachsen auch die anderen. Suche das Glück nicht außen, sondern im Leben dieser vier Tugenden — denn das Einzige, was wirklich dir gehört, ist dein Charakter.',
      ru: 'Вся стоическая этика держится на четырёх столпах: мудрость, мужество, справедливость, умеренность. Хорошая жизнь — это жить этими четырьмя.\n\nДля стоиков единственное подлинное «благо» — добродетель, а не деньги, слава или здоровье. И добродетель проявляется в четырёх основных формах. Мудрость: видеть, что в твоей власти, а что нет. Мужество: делать правильное вопреки страху. Справедливость: воздавать каждому должное и беречь общее благо. Умеренность: хранить равновесие в желаниях и реакциях. Эти четыре — не отдельные навыки, а разные лица одной мудрости. Развивая одну, укрепляешь и другие. Ищи счастье не снаружи, а в жизни этих четырёх добродетелей — ведь единственное, что подлинно твоё, — твой характер.',
      fr: "Toute l'éthique stoïcienne repose sur quatre piliers : sagesse, courage, justice, tempérance. Une bonne vie, c'est vivre ces quatre.\n\nPour les stoïciens, le seul vrai « bien » est la vertu — non l'argent, la gloire ou la santé. Et la vertu apparaît sous quatre formes fondamentales. Sagesse : voir ce qui dépend de toi et ce qui n'en dépend pas. Courage : faire ce qui est juste malgré la peur. Justice : rendre à chacun son dû et veiller au bien commun. Tempérance : garder l'équilibre dans tes désirs et tes réactions. Ces quatre ne sont pas des compétences séparées, mais les différents visages d'une même sagesse. Développe l'une et les autres se renforcent. Cherche le bonheur non au-dehors, mais dans la pratique de ces quatre vertus — car la seule chose vraiment tienne, c'est ton caractère.",
      es: 'Toda la ética estoica se apoya en cuatro pilares: sabiduría, valor, justicia, templanza. Una buena vida es vivir estos cuatro.\n\nPara los estoicos lo único verdaderamente "bueno" es la virtud — no el dinero, la fama o la salud. Y la virtud aparece en cuatro formas básicas. Sabiduría: ver qué está en tu poder y qué no. Valor: hacer lo correcto a pesar del miedo. Justicia: dar a cada uno lo suyo y cuidar el bien común. Templanza: mantener el equilibrio en tus deseos y reacciones. Estas cuatro no son destrezas separadas, sino distintas caras de una misma sabiduría. Fortalece una y las demás también crecen. Busca la felicidad no fuera, sino en vivir estas cuatro virtudes — porque lo único verdaderamente tuyo es tu carácter.' },
    example: { tr: '' },
    practice: {
      tr: 'Bugün bir karar verirken sor: bu seçim bu dört erdemden hangisini besliyor?',
      en: 'When you make a decision today, ask: which of these four virtues does this choice feed?',
      de: 'Wenn du heute eine Entscheidung triffst, frage: Welche dieser vier Tugenden nährt diese Wahl?',
      ru: 'Принимая сегодня решение, спроси: какую из этих четырёх добродетелей питает этот выбор?',
      fr: "Lorsque tu prends une décision aujourd'hui, demande : laquelle de ces quatre vertus ce choix nourrit-il ?",
      es: 'Al tomar una decisión hoy, pregunta: ¿cuál de estas cuatro virtudes alimenta esta elección?' } },

  { latin: 'Prosochē', icon: '◉', color: 'rgba(120,150,170,0.15)',
    name: { tr: 'Anlık Farkındalık', en: 'Present Awareness', de: 'Gegenwärtige Achtsamkeit', ru: 'Внимательность к настоящему', fr: "Attention au présent", es: 'Atención al presente' },
    desc: {
      tr: 'Her ana uyanık olmak. Stoacı pratiğin kalbi: ne düşündüğünü, ne hissettiğini, ne yaptığını fark ederek yaşamak.\n\nProsochē, kesintisiz bir dikkat hâlidir — kendi düşüncelerine ve tepkilerine sürekli, nazik bir farkındalıkla bakmak. Stoacı için felsefe kitapta değil, tam da şu anda yaşanır: Şu öfke nereden geldi? Bu kaygı gerçek mi, yoksa zihnimin uydurduğu bir gelecek mi? Bu dikkat olmadan, eski alışkanlıklar bizi otomatik olarak sürükler. Prosochē ile araya bir boşluk girer — uyaran ile tepki arasında. O boşlukta özgürlük vardır: tepki vermek yerine seçim yapabilirsin. Bu yüzden Stoacılar sabah niyet kurmayı, gün içinde durup nefes almayı, akşam günü gözden geçirmeyi önerir. Hepsi aynı kası çalıştırır: farkında kalma kasını.',
      en: 'Being awake to every moment. The heart of Stoic practice: living while noticing what you think, what you feel, what you do.\n\nProsochē is a state of continuous attention — looking at your own thoughts and reactions with steady, gentle awareness. For the Stoic, philosophy is lived not in a book but right now: Where did this anger come from? Is this anxiety real, or a future my mind invented? Without this attention, old habits drag us along automatically. With Prosochē a gap opens — between stimulus and response. In that gap there is freedom: instead of reacting, you can choose. This is why the Stoics advise setting an intention in the morning, pausing to breathe during the day, and reviewing the day at night. All train the same muscle: the muscle of staying aware.',
      de: 'Jedem Augenblick wach begegnen. Das Herz der stoischen Praxis: leben und dabei bemerken, was du denkst, fühlst und tust.\n\nProsochē ist ein Zustand ununterbrochener Aufmerksamkeit — die eigenen Gedanken und Reaktionen mit steter, sanfter Achtsamkeit zu betrachten. Für den Stoiker wird Philosophie nicht im Buch gelebt, sondern genau jetzt: Woher kam dieser Zorn? Ist diese Angst real oder eine Zukunft, die mein Geist erfunden hat? Ohne diese Aufmerksamkeit reißen uns alte Gewohnheiten automatisch mit. Mit Prosochē öffnet sich ein Zwischenraum — zwischen Reiz und Reaktion. In diesem Raum liegt Freiheit: statt zu reagieren, kannst du wählen. Darum raten die Stoiker, morgens einen Vorsatz zu fassen, tagsüber innezuhalten und zu atmen, abends den Tag zu überdenken. Alles trainiert denselben Muskel: den Muskel des Wachbleibens.',
      ru: 'Бодрствовать в каждом мгновении. Сердце стоической практики: жить, замечая, что ты думаешь, что чувствуешь, что делаешь.\n\nПросохэ — состояние непрерывного внимания: смотреть на собственные мысли и реакции с ровной, мягкой осознанностью. Для стоика философия живётся не в книге, а именно сейчас: Откуда этот гнев? Реальна ли эта тревога или это будущее, выдуманное умом? Без этого внимания старые привычки автоматически уносят нас. С просохэ возникает зазор — между стимулом и реакцией. В этом зазоре свобода: вместо того чтобы реагировать, ты можешь выбирать. Поэтому стоики советуют утром ставить намерение, днём останавливаться и дышать, вечером пересматривать день. Всё тренирует одну мышцу — мышцу осознанности.',
      fr: "Être éveillé à chaque instant. Le cœur de la pratique stoïcienne : vivre en remarquant ce que tu penses, ce que tu ressens, ce que tu fais.\n\nProsochē est un état d'attention continue — observer ses propres pensées et réactions avec une vigilance constante et douce. Pour le stoïcien, la philosophie se vit non dans un livre, mais ici et maintenant : D'où vient cette colère ? Cette anxiété est-elle réelle, ou un avenir inventé par mon esprit ? Sans cette attention, les vieilles habitudes nous entraînent automatiquement. Avec Prosochē, un espace s'ouvre — entre le stimulus et la réaction. Dans cet espace est la liberté : au lieu de réagir, tu peux choisir. C'est pourquoi les stoïciens conseillent de poser une intention le matin, de s'arrêter pour respirer dans la journée, de revoir la journée le soir. Tout entraîne le même muscle : celui de rester conscient.",
      es: 'Estar despierto a cada momento. El corazón de la práctica estoica: vivir notando qué piensas, qué sientes, qué haces.\n\nProsochē es un estado de atención continua — mirar los propios pensamientos y reacciones con una conciencia firme y amable. Para el estoico, la filosofía se vive no en un libro, sino justo ahora: ¿De dónde vino esta ira? ¿Es real esta ansiedad, o un futuro que inventó mi mente? Sin esta atención, los viejos hábitos nos arrastran de forma automática. Con Prosochē se abre un espacio — entre el estímulo y la reacción. En ese espacio está la libertad: en vez de reaccionar, puedes elegir. Por eso los estoicos aconsejan fijar una intención por la mañana, detenerse a respirar durante el día y repasar el día por la noche. Todo entrena el mismo músculo: el de permanecer consciente.' },
    example: { tr: '' },
    practice: {
      tr: 'Gün içinde bir kez dur, üç nefes al ve sor: şu an zihnimde ne var?',
      en: 'Once during the day, stop, take three breaths and ask: what is in my mind right now?',
      de: 'Halte einmal am Tag inne, atme dreimal und frage: Was ist gerade in meinem Kopf?',
      ru: 'Один раз за день остановись, сделай три вдоха и спроси: что сейчас у меня в голове?',
      fr: "Une fois dans la journée, arrête-toi, prends trois respirations et demande : qu'y a-t-il dans mon esprit maintenant ?",
      es: 'Una vez al día, detente, respira tres veces y pregunta: ¿qué hay en mi mente ahora?' } },

  { latin: 'Apatheia', icon: '◯', color: 'rgba(140,170,150,0.15)',
    name: { tr: 'Tutkulardan Arınma', en: 'Freedom from Passions', de: 'Freiheit von Leidenschaften', ru: 'Свобода от страстей', fr: 'Libération des passions', es: 'Liberación de las pasiones' },
    desc: {
      tr: 'Duygusuzluk değil — öfke, aşırı korku ve hırs gibi yıkıcı tutkuların esiri olmadan, dingin bir ruhla yaşamak.\n\nApatheia sık sık yanlış anlaşılır: hissizlik ya da soğukluk sanılır. Oysa anlamı, yıkıcı tutkuların (pathos) seni yönetmesine izin vermemektir. Stoacı sevgiyi, sevinci, şefkati reddetmez — bunlar sağlıklı, akılla uyumlu duygulardır. Reddettiği şey, kontrolsüz öfke, tüketen kıskançlık, felç eden korku gibi seni kendinden eden tutkulardır. Bunlar çoğu zaman yanlış yargılardan doğar: "Bu olmazsa mahvolurum" gibi. Yargıyı düzelttiğinde, tutku da yatışır. Apatheia bir duvar örmek değil; fırtınanın ortasında sakin bir merkez bulmaktır. Hisset — ama hislerinin seni sürüklemesine izin verme.',
      en: 'Not numbness — living with a calm soul, free from the grip of destructive passions like rage, excessive fear and greed.\n\nApatheia is often misunderstood as coldness or insensitivity. Its real meaning is not letting destructive passions (pathos) rule you. The Stoic does not reject love, joy or compassion — these are healthy emotions in tune with reason. What it rejects are the passions that take you out of yourself: uncontrolled anger, consuming envy, paralyzing fear. These often arise from false judgments, like "if this fails, I am ruined." Correct the judgment and the passion subsides too. Apatheia is not building a wall; it is finding a calm center in the midst of the storm. Feel — but do not let your feelings sweep you away.',
      de: 'Keine Gefühllosigkeit — mit ruhiger Seele leben, frei vom Griff zerstörerischer Leidenschaften wie Wut, übermäßiger Furcht und Gier.\n\nApatheia wird oft als Kälte oder Unempfindlichkeit missverstanden. Ihre wahre Bedeutung ist, zerstörerische Leidenschaften (pathos) nicht über sich herrschen zu lassen. Der Stoiker weist Liebe, Freude, Mitgefühl nicht zurück — das sind gesunde, mit der Vernunft im Einklang stehende Gefühle. Zurückgewiesen werden die Leidenschaften, die dich aus dir selbst reißen: unbeherrschter Zorn, verzehrender Neid, lähmende Furcht. Sie entspringen oft falschen Urteilen wie „Wenn das scheitert, bin ich verloren.“ Korrigierst du das Urteil, legt sich auch die Leidenschaft. Apatheia heißt nicht, eine Mauer zu bauen; es heißt, mitten im Sturm eine ruhige Mitte zu finden. Fühle — aber lass dich von deinen Gefühlen nicht fortreißen.',
      ru: 'Не бесчувствие — жить со спокойной душой, не во власти разрушительных страстей: гнева, чрезмерного страха и жадности.\n\nАпатейю часто понимают неверно — как холодность или бесчувственность. Её настоящий смысл — не давать разрушительным страстям (пафос) править тобой. Стоик не отвергает любовь, радость, сострадание — это здоровые, согласные с разумом чувства. Отвергает он страсти, что выводят тебя из себя: неуёмный гнев, гложущую зависть, парализующий страх. Они часто рождаются из ложных суждений, вроде «если это не выйдет, я погиб». Исправь суждение — утихнет и страсть. Апатейя — не возвести стену, а найти спокойный центр посреди бури. Чувствуй — но не позволяй чувствам уносить тебя.',
      fr: "Non l'insensibilité — vivre avec une âme paisible, libre de l'emprise des passions destructrices comme la rage, la peur excessive et l'avidité.\n\nApatheia est souvent mal comprise, prise pour de la froideur ou de l'insensibilité. Son vrai sens est de ne pas laisser les passions destructrices (pathos) te gouverner. Le stoïcien ne rejette pas l'amour, la joie, la compassion — ce sont des émotions saines, accordées à la raison. Il rejette les passions qui te font sortir de toi-même : la colère incontrôlée, l'envie dévorante, la peur paralysante. Elles naissent souvent de jugements faux, comme « si cela échoue, je suis perdu ». Corrige le jugement et la passion s'apaise. Apatheia n'est pas dresser un mur ; c'est trouver un centre calme au milieu de la tempête. Ressens — mais ne laisse pas tes émotions t'emporter.",
      es: 'No insensibilidad — vivir con un alma serena, libre del dominio de pasiones destructivas como la ira, el miedo excesivo y la codicia.\n\nLa apatheia suele malinterpretarse como frialdad o insensibilidad. Su verdadero sentido es no dejar que las pasiones destructivas (pathos) te gobiernen. El estoico no rechaza el amor, la alegría ni la compasión — son emociones sanas, acordes con la razón. Rechaza las pasiones que te sacan de ti mismo: la ira incontrolada, la envidia que consume, el miedo que paraliza. A menudo nacen de juicios falsos, como «si esto falla, estoy perdido». Corrige el juicio y la pasión también se calma. La apatheia no es levantar un muro; es hallar un centro tranquilo en medio de la tormenta. Siente — pero no dejes que tus sentimientos te arrastren.' },
    example: { tr: '' },
    practice: {
      tr: 'Güçlü bir duygu yükseldiğinde sor: bu hissin altındaki yargı doğru mu?',
      en: 'When a strong emotion rises, ask: is the judgment beneath this feeling true?',
      de: 'Wenn ein starkes Gefühl aufsteigt, frage: Ist das Urteil unter diesem Gefühl wahr?',
      ru: 'Когда поднимается сильное чувство, спроси: верно ли суждение под этим чувством?',
      fr: "Quand une émotion forte monte, demande : le jugement sous ce sentiment est-il vrai ?",
      es: 'Cuando surja una emoción fuerte, pregunta: ¿es verdadero el juicio bajo este sentimiento?' } },

  { latin: 'Oikeiōsis', icon: '⊚', color: 'rgba(180,140,120,0.15)',
    name: { tr: 'Şefkat Halkaları', en: 'Circles of Belonging', de: 'Kreise der Zugehörigkeit', ru: 'Круги принадлежности', fr: "Cercles d'appartenance", es: 'Círculos de pertenencia' },
    desc: {
      tr: 'Ahlaki ilginin kendinden başlayıp halkalar halinde tüm insanlığa genişlemesi. Önce kendin, sonra yakının, sonra herkes.\n\nHierokles bunu iç içe halkalar olarak anlatır. En içte sen varsın. Onu saran halka ailen, sonra dostların, sonra şehrin, en dışta tüm insanlık. Stoacı pratik, dış halkaları yavaşça içe çekmektir: uzaktaki bir yabancıya, yakın biriymiş gibi şefkat gösterebilmek. Bu duygusal bir zorlama değil, doğal bir genişlemedir — çünkü hepimiz aynı evrensel aklın (Logos) parçasıyız. Sympatheia "her şey birbirine bağlı" derse, Oikeiōsis "öyleyse herkese kendinin bir uzantısı gibi davran" der. Erdemlerden Adalet, kökünü buradan alır. Kendine iyi bak — ama dünyayı da kendi sınırının dışında sanma.',
      en: 'The widening of moral concern from yourself outward in rings to all humanity. First yourself, then those close to you, then everyone.\n\nHierocles describes this as nested circles. At the very center is you. The ring around you is your family, then your friends, then your city, and at the outermost all of humanity. Stoic practice is slowly drawing the outer rings inward: being able to show a distant stranger the kindness you would show someone close. This is not emotional forcing but a natural expansion — because we are all parts of the same universal reason (Logos). If Sympatheia says "everything is connected," Oikeiōsis says "then treat everyone as an extension of yourself." Justice, among the virtues, takes root here. Take care of yourself — but do not imagine the world lies outside your own boundary.',
      de: 'Die Ausweitung der moralischen Anteilnahme von dir selbst nach außen in Ringen bis zur ganzen Menschheit. Zuerst du selbst, dann die Nahen, dann alle.\n\nHierokles beschreibt dies als ineinander liegende Kreise. Ganz innen bist du. Der Ring um dich ist deine Familie, dann deine Freunde, dann deine Stadt, ganz außen die ganze Menschheit. Stoische Praxis heißt, die äußeren Ringe langsam nach innen zu ziehen: einem fernen Fremden die Güte zu zeigen, die du einem Nahen zeigen würdest. Das ist kein Zwang des Gefühls, sondern eine natürliche Ausweitung — denn wir alle sind Teile derselben universalen Vernunft (Logos). Sagt Sympatheia „alles ist verbunden“, so sagt Oikeiōsis „dann behandle jeden wie eine Erweiterung deiner selbst“. Die Gerechtigkeit unter den Tugenden wurzelt hier. Sorge für dich — aber wähne die Welt nicht außerhalb deiner eigenen Grenze.',
      ru: 'Расширение нравственной заботы от себя наружу — кольцами ко всему человечеству. Сначала ты сам, потом близкие, потом все.\n\nГиерокл описывает это как вложенные круги. В самом центре — ты. Кольцо вокруг тебя — семья, затем друзья, затем город, на самом краю — всё человечество. Стоическая практика — медленно стягивать внешние круги внутрь: суметь проявить к далёкому незнакомцу ту доброту, что проявил бы к близкому. Это не насилие над чувством, а естественное расширение — ведь все мы части единого вселенского разума (Логоса). Если Сюмпатейя говорит «всё связано», то Ойкейосис говорит «тогда относись к каждому как к продолжению себя». Справедливость среди добродетелей коренится здесь. Заботься о себе — но не думай, что мир лежит за пределами твоей границы.',
      fr: "L'élargissement de la sollicitude morale, de toi vers l'extérieur, par cercles, jusqu'à toute l'humanité. D'abord toi, puis tes proches, puis tous.\n\nHiéroclès le décrit comme des cercles emboîtés. Au centre, il y a toi. Le cercle autour de toi est ta famille, puis tes amis, puis ta cité, et tout au bord, l'humanité entière. La pratique stoïcienne consiste à ramener lentement les cercles extérieurs vers l'intérieur : pouvoir montrer à un inconnu lointain la bonté que tu montrerais à un proche. Ce n'est pas une contrainte des sentiments, mais une expansion naturelle — car nous sommes tous des parts d'une même raison universelle (Logos). Si Sympatheia dit « tout est lié », Oikeiōsis dit « alors traite chacun comme une extension de toi-même ». La justice, parmi les vertus, prend racine ici. Prends soin de toi — mais n'imagine pas que le monde se trouve hors de ta propre limite.",
      es: 'La ampliación de la preocupación moral desde ti mismo hacia fuera, en anillos, hasta toda la humanidad. Primero tú, luego los cercanos, luego todos.\n\nHierocles lo describe como círculos anidados. En el centro estás tú. El anillo a tu alrededor es tu familia, luego tus amigos, luego tu ciudad y, en el borde, toda la humanidad. La práctica estoica es ir acercando lentamente los anillos exteriores hacia dentro: poder mostrar a un extraño lejano la bondad que mostrarías a alguien cercano. No es una fuerza emocional, sino una expansión natural — porque todos somos partes de la misma razón universal (Logos). Si Sympatheia dice «todo está conectado», Oikeiōsis dice «entonces trata a todos como una extensión de ti mismo». La justicia, entre las virtudes, echa raíz aquí. Cuídate — pero no imagines que el mundo queda fuera de tu propio límite.' },
    example: { tr: '' },
    practice: {
      tr: 'Bugün bir yabancıya, yakınına göstereceğin sabrı göster.',
      en: 'Today, show a stranger the patience you would show someone close.',
      de: 'Zeige heute einem Fremden die Geduld, die du einem Nahestehenden zeigen würdest.',
      ru: 'Сегодня прояви к незнакомцу терпение, какое проявил бы к близкому.',
      fr: "Aujourd'hui, montre à un inconnu la patience que tu montrerais à un proche.",
      es: 'Hoy, muestra a un extraño la paciencia que mostrarías a alguien cercano.' } },

  { latin: 'Ataraxia', icon: '▽', color: 'rgba(110,140,180,0.15)',
    name: { tr: 'Sarsılmaz Dinginlik', en: 'Unshakable Serenity', de: 'Unerschütterliche Gelassenheit', ru: 'Невозмутимая безмятежность', fr: 'Sérénité inébranlable', es: 'Serenidad inquebrantable' },
    desc: {
      tr: 'Dış olaylar ne olursa olsun bozulmayan iç huzur. Erdemli yaşamın getirdiği sakin, sağlam zihin hâli.\n\nAtaraxia, "rahatsız olmama" anlamına gelir — ama tembellik ya da kayıtsızlık değil. Aksine, dünyayla tam temas hâlinde kalıp yine de sarsılmamaktır. Eudaimonia "iyi yaşamın" bütünüyse, Ataraxia o yaşamın içindeki zihinsel dinginliktir: övgü geldiğinde şişmeyen, yergi geldiğinde çökmeyen, kayıp karşısında yıkılmayan bir denge. Bu hâl bir hediye değil, pratikle kazanılır — kontrol edemediğini bırakmayı, yargılarını düzeltmeyi ve şu ana dönmeyi tekrar tekrar deneyerek. Dalgalar hep olacak; Ataraxia, onların altındaki derin, durgun suyu bulmaktır. Fırtına yüzeyde kalır, sen derinde sakin durursun.',
      en: 'Inner peace that holds whatever outer events occur. The calm, steady state of mind that a virtuous life brings.\n\nAtaraxia means "freedom from disturbance" — but not laziness or indifference. On the contrary, it is staying in full contact with the world and yet remaining unshaken. If Eudaimonia is the whole of "the good life," Ataraxia is the mental stillness within that life: a balance that does not swell when praise comes, does not collapse when blame comes, does not break in the face of loss. This state is not a gift; it is earned through practice — by trying, again and again, to release what you cannot control, correct your judgments and return to the present. The waves will always come; Ataraxia is finding the deep, still water beneath them. The storm stays on the surface, while you remain calm in the depths.',
      de: 'Innerer Frieden, der hält, was auch immer äußerlich geschieht. Der ruhige, feste Geisteszustand, den ein tugendhaftes Leben bringt.\n\nAtaraxia bedeutet „Ungestörtheit“ — aber nicht Trägheit oder Gleichgültigkeit. Im Gegenteil: in vollem Kontakt mit der Welt zu bleiben und doch unerschüttert. Ist Eudaimonia das Ganze des „guten Lebens“, so ist Ataraxia die geistige Stille darin: ein Gleichgewicht, das bei Lob nicht anschwillt, bei Tadel nicht zusammenbricht, bei Verlust nicht zerbricht. Dieser Zustand ist kein Geschenk; er wird durch Übung erworben — indem du immer wieder versuchst, loszulassen, was du nicht beherrschst, deine Urteile zu korrigieren und in die Gegenwart zurückzukehren. Die Wellen werden immer kommen; Ataraxia heißt, das tiefe, stille Wasser unter ihnen zu finden. Der Sturm bleibt an der Oberfläche, du bleibst in der Tiefe ruhig.',
      ru: 'Внутренний покой, что держится, что бы ни происходило вовне. Спокойное, устойчивое состояние ума, которое приносит добродетельная жизнь.\n\nАтараксия означает «невозмутимость» — но не лень и не безразличие. Напротив, это оставаться в полном соприкосновении с миром и всё же не быть поколебленным. Если эвдемония — это всё «благой жизни», то атараксия — душевная тишина внутри неё: равновесие, что не раздувается от похвалы, не рушится от хулы, не ломается перед потерей. Это состояние — не дар; оно добывается практикой: снова и снова пытаясь отпустить неподвластное, исправить суждения и вернуться в настоящее. Волны будут всегда; атараксия — найти глубокую, тихую воду под ними. Буря остаётся на поверхности, а ты остаёшься спокоен в глубине.',
      fr: "Une paix intérieure qui tient quels que soient les événements extérieurs. L'état d'esprit calme et ferme qu'apporte une vie vertueuse.\n\nAtaraxia signifie « absence de trouble » — mais non la paresse ni l'indifférence. Au contraire, c'est rester en plein contact avec le monde et pourtant demeurer inébranlable. Si l'Eudaimonia est l'ensemble de « la belle vie », l'Ataraxia en est la quiétude mentale : un équilibre qui ne s'enfle pas sous l'éloge, ne s'effondre pas sous le blâme, ne se brise pas devant la perte. Cet état n'est pas un don ; il s'acquiert par la pratique — en essayant, encore et encore, de lâcher ce que tu ne maîtrises pas, de corriger tes jugements et de revenir au présent. Les vagues viendront toujours ; l'Ataraxia, c'est trouver l'eau profonde et calme sous elles. La tempête reste en surface, tandis que tu demeures serein dans les profondeurs.",
      es: 'Paz interior que se mantiene pase lo que pase fuera. El estado de mente calmo y firme que trae una vida virtuosa.\n\nAtaraxia significa «ausencia de perturbación» — pero no pereza ni indiferencia. Al contrario, es permanecer en pleno contacto con el mundo y aun así no ser sacudido. Si la Eudaimonia es el todo de «la buena vida», la Ataraxia es la quietud mental dentro de esa vida: un equilibrio que no se hincha cuando llega el elogio, no se hunde cuando llega la crítica, no se quiebra ante la pérdida. Este estado no es un regalo; se gana con la práctica — intentando, una y otra vez, soltar lo que no puedes controlar, corregir tus juicios y volver al presente. Las olas siempre vendrán; la Ataraxia es hallar el agua profunda y serena bajo ellas. La tormenta queda en la superficie, mientras tú permaneces en calma en lo hondo.' },
    example: { tr: '' },
    practice: {
      tr: 'Bir şey seni sarstığında sor: bu, on yıl sonra önemli olacak mı?',
      en: 'When something shakes you, ask: will this matter ten years from now?',
      de: 'Wenn dich etwas erschüttert, frage: Wird das in zehn Jahren noch wichtig sein?',
      ru: 'Когда что-то выбивает тебя из колеи, спроси: будет ли это важно через десять лет?',
      fr: "Quand quelque chose t'ébranle, demande : cela comptera-t-il encore dans dix ans ?",
      es: 'Cuando algo te sacuda, pregunta: ¿esto importará dentro de diez años?' } },
];

export interface Concept { latin: string; icon: string; color: string; name: string; desc: string; example: string; practice: string; }

export function getConcepts(lang: Lang): Concept[] {
  return CONCEPTS_RAW.map((c) => ({ latin: c.latin, icon: c.icon, color: c.color, name: pick(c.name, lang), desc: pick(c.desc, lang), example: pick(c.example, lang), practice: c.practice ? pick(c.practice, lang) : '' }));
}

export function getDailyConcept(lang: Lang): Concept {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return getConcepts(lang)[dayOfYear % CONCEPTS_RAW.length];
}

// ─── Egzersizler ──────────────────────────────────────────
interface RawExercise { id: string; min: number; name: L; desc: L; }

export const MORNING_RAW: RawExercise[] = [
  { id: 'neg_vis', min: 3,
    name: { tr: 'Negatif Görselleştirme', en: 'Negative Visualization', de: 'Negative Visualisierung', ru: 'Негативная визуализация', fr: 'Visualisation négative', es: 'Visualización negativa' },
    desc: {
      tr: 'Bugün kaybedebileceklerini düşün — sağlık, sevdiklerin, işin. Sahip olduklarının değerini hisset.',
      en: 'Imagine what you could lose today — health, loved ones, work. Feel the value of what you have.',
      de: 'Stell dir vor, was du heute verlieren könntest — Gesundheit, Liebste, Arbeit. Spüre den Wert dessen, was du hast.',
      ru: 'Представь, что можешь потерять сегодня — здоровье, близких, работу. Почувствуй ценность того, что есть.',
      fr: "Imagine ce que tu pourrais perdre aujourd'hui — santé, êtres chers, travail. Ressens la valeur de ce que tu as.",
      es: 'Imagina lo que podrías perder hoy — salud, seres queridos, trabajo. Siente el valor de lo que tienes.' } },
  { id: 'intention', min: 2,
    name: { tr: 'Sabah Niyeti', en: 'Morning Intention', de: 'Morgenvorsatz', ru: 'Утренний настрой', fr: 'Intention du matin', es: 'Intención matutina' },
    desc: {
      tr: 'Bugün kontrolümde olan tek şey kendi tepkilerim ve kararlarım. Dışarıdaki her şey benim değil.',
      en: 'Today the only things in my control are my responses and choices. All else is not mine.',
      de: 'Heute liegen nur meine Reaktionen und Entscheidungen in meiner Macht. Alles andere gehört mir nicht.',
      ru: 'Сегодня в моей власти лишь мои реакции и решения. Всё внешнее — не моё.',
      fr: "Aujourd'hui, les seules choses qui dépendent de moi sont mes réactions et mes choix. Tout le reste ne m'appartient pas.",
      es: 'Hoy lo único en mi poder son mis reacciones y decisiones. Todo lo demás no es mío.' } },
  { id: 'memento', min: 2,
    name: { tr: 'Memento Mori', en: 'Memento Mori', de: 'Memento Mori', ru: 'Memento Mori', fr: 'Memento Mori', es: 'Memento Mori' },
    desc: {
      tr: 'Bu gün tekrar gelmeyecek. Nasıl yaşamak istiyorsun? Ne bırakmak istiyorsun?',
      en: 'This day will not return. How do you want to live it? What do you want to leave behind?',
      de: 'Dieser Tag kehrt nicht wieder. Wie willst du ihn leben? Was willst du hinterlassen?',
      ru: 'Этот день не вернётся. Как ты хочешь его прожить? Что хочешь оставить?',
      fr: "Ce jour ne reviendra pas. Comment veux-tu le vivre ? Que veux-tu laisser derrière toi ?",
      es: 'Este día no volverá. ¿Cómo quieres vivirlo? ¿Qué quieres dejar tras de ti?' } },
];

export const EVENING_RAW: RawExercise[] = [
  { id: 'review', min: 5,
    name: { tr: 'Günün Muhasebesi', en: 'Review of the Day', de: 'Rückschau des Tages', ru: 'Итоги дня', fr: 'Bilan de la journée', es: 'Balance del día' },
    desc: {
      tr: 'Bugün kontrolündeki şeylerde nasıl davrandın? Nerede daha iyi olabilirdin?',
      en: 'How did you act in what was in your control today? Where could you have done better?',
      de: 'Wie hast du heute in dem gehandelt, was in deiner Macht lag? Wo hättest du besser sein können?',
      ru: 'Как ты сегодня действовал в подвластном тебе? Где мог бы быть лучше?',
      fr: "Comment as-tu agi aujourd'hui dans ce qui dépendait de toi ? Où aurais-tu pu mieux faire ?",
      es: '¿Cómo actuaste hoy en lo que estaba en tu poder? ¿Dónde podrías haberlo hecho mejor?' } },
  { id: 'gratitude', min: 3,
    name: { tr: 'Stoacı Şükran', en: 'Stoic Gratitude', de: 'Stoische Dankbarkeit', ru: 'Стоическая благодарность', fr: 'Gratitude stoïcienne', es: 'Gratitud estoica' },
    desc: {
      tr: 'Bugün sıradan görünen ama aslında değerli olan üç şeyi hatırla.',
      en: 'Recall three things that seemed ordinary today but were truly valuable.',
      de: 'Erinnere dich an drei Dinge, die heute gewöhnlich schienen, aber wertvoll waren.',
      ru: 'Вспомни три вещи, что казались сегодня обычными, но были по-настоящему ценны.',
      fr: "Rappelle-toi trois choses qui semblaient ordinaires aujourd'hui mais étaient vraiment précieuses.",
      es: 'Recuerda tres cosas que hoy parecían corrientes pero fueron verdaderamente valiosas.' } },
];

export interface Exercise { id: string; duration: string; name: string; desc: string; category: 'morning' | 'evening'; }

export function getExercises(lang: Lang, minUnit: string): { morning: Exercise[]; evening: Exercise[] } {
  const map = (e: RawExercise, category: 'morning' | 'evening'): Exercise => ({
    id: e.id, duration: `${e.min} ${minUnit}`, name: pick(e.name, lang), desc: pick(e.desc, lang), category,
  });
  return {
    morning: MORNING_RAW.map((e) => map(e, 'morning')),
    evening: EVENING_RAW.map((e) => map(e, 'evening')),
  };
}

// İlerleme ekranı için sade egzersiz adı listesi
export function getExerciseNames(lang: Lang): { id: string; name: string; category: 'morning' | 'evening' }[] {
  return [
    ...MORNING_RAW.map((e) => ({ id: e.id, name: pick(e.name, lang), category: 'morning' as const })),
    ...EVENING_RAW.map((e) => ({ id: e.id, name: pick(e.name, lang), category: 'evening' as const })),
  ];
}

// ─── Koç ──────────────────────────────────────────────────
export const COACH_SUGGESTIONS: Record<Lang, string[]> = {
  tr: ['İşte başarısız oldum', 'Kaygı içindeyim', 'Birileri beni eleştiriyor', 'Geleceğim belirsiz', 'Öfkeyi nasıl yönetirim?'],
  en: ['I failed at work', "I'm anxious", 'Someone is criticizing me', 'My future is uncertain', 'How do I manage anger?'],
  de: ['Ich bin bei der Arbeit gescheitert', 'Ich bin ängstlich', 'Jemand kritisiert mich', 'Meine Zukunft ist ungewiss', 'Wie bändige ich Wut?'],
  ru: ['Я провалился на работе', 'Меня одолевает тревога', 'Меня критикуют', 'Моё будущее неопределённо', 'Как справиться с гневом?'],
  fr: ["J'ai échoué au travail", "Je suis anxieux", 'On me critique', "Mon avenir est incertain", 'Comment gérer la colère ?'],
  es: ['Fracasé en el trabajo', 'Tengo ansiedad', 'Alguien me critica', 'Mi futuro es incierto', '¿Cómo manejo la ira?'],
};

export const COACH_INITIAL: Record<Lang, string> = {
  tr: 'Merhaba. Bugün sana nasıl yardımcı olabilirim? Yaşadığın zorluğu veya hissettiğin duyguyu bana anlat — birlikte Stoacı bir bakış açısı geliştirelim.\n\n[ALINTI: "Kendine dönük yolculuk, tüm yolculukların en uzunudur." — Seneca, Epistulae]',
  en: 'Hello. How can I help you today? Tell me about the difficulty you face or the emotion you feel — together we will develop a Stoic perspective.\n\n[ALINTI: "The journey toward oneself is the longest of all journeys." — Seneca, Moral Letters]',
  de: 'Hallo. Wie kann ich dir heute helfen? Erzähl mir von der Schwierigkeit, der du begegnest, oder dem Gefühl, das dich bewegt — gemeinsam entwickeln wir eine stoische Sicht.\n\n[ALINTI: "Die Reise zu sich selbst ist die längste aller Reisen." — Seneca, Briefe an Lucilius]',
  ru: 'Здравствуй. Чем я могу помочь тебе сегодня? Расскажи о трудности, с которой ты столкнулся, или о чувстве, что тебя тревожит, — вместе мы выработаем стоический взгляд.\n\n[ALINTI: "Путь к самому себе — самый длинный из всех путей." — Сенека, Нравственные письма]',
  fr: "Bonjour. Comment puis-je t'aider aujourd'hui ? Parle-moi de la difficulté que tu rencontres ou de l'émotion que tu ressens — ensemble, développons une perspective stoïcienne.\n\n[ALINTI: \"La route vers soi-même est la plus longue de toutes.\" — Sénèque, Lettres à Lucilius]",
  es: 'Hola. ¿Cómo puedo ayudarte hoy? Cuéntame la dificultad que enfrentas o la emoción que sientes — juntos desarrollaremos una perspectiva estoica.\n\n[ALINTI: "El viaje hacia uno mismo es el más largo de todos." — Séneca, Cartas a Lucilio]',
};

const LANG_NAME: Record<Lang, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'русском языке', fr: 'français', es: 'español' };

export function coachSystemPrompt(lang: Lang): string {
  const langInstr: Record<Lang, string> = {
    tr: 'Tüm yanıtlarını Türkçe yaz.',
    en: 'Write all your responses in English.',
    de: 'Schreibe alle deine Antworten auf Deutsch.',
    ru: 'Пиши все свои ответы на русском языке.',
    fr: 'Écris toutes tes réponses en français.',
    es: 'Escribe todas tus respuestas en español.',
  };
  return `You are Stoikos — a wisdom guide bringing ancient Stoic philosophy into modern life.

Your task:
- Address the user's problems, worries, or emotions from a Stoic perspective
- Turn the teachings of Marcus Aurelius, Epictetus, and Seneca into practical advice
- End every reply with a fitting Stoic quote
- Keep replies short, focused, and deep — guidance, not a sermon

Core Stoic concepts:
- Dichotomy of Control: what is in your control vs. what is not
- Negative Visualization: imagining loss
- Memento Mori: remembering mortality
- Amor Fati: loving your fate
- Premeditatio Malorum: foreseeing adversity

Reply format:
1. Begin with empathy (1-2 sentences)
2. Offer a Stoic frame (2-3 sentences)
3. Give practical advice (1-2 sentences)
4. Add a quote in EXACTLY this format (keep the literal tag "ALINTI"): [ALINTI: "quote text" — Author, Source]

IMPORTANT: ${langInstr[lang]} Use a warm but strong tone. The literal tag must remain "ALINTI" even though the quote text is in ${LANG_NAME[lang]}.`;
}

// ─── Ses (önceden üretilen statik klipler) ────────────────
const ALL_LANGS: Lang[] = ['tr', 'en', 'de', 'ru'];

export function quoteAudioKey(id: string, lang: Lang): string {
  return `q${id}-${lang}`;
}
export function conceptAudioKey(latin: string, lang: Lang): string {
  return `c${latin.replace(/[^a-zA-Z]/g, '').toLowerCase()}-${lang}`;
}

// Üretim script'i için: seslendirilecek tüm sabit metinler (dil bilgisiyle)
export function getAudioItems(): { key: string; lang: Lang; text: string }[] {
  const items: { key: string; lang: Lang; text: string }[] = [];
  for (const q of QUOTES_RAW) {
    for (const lang of ALL_LANGS) {
      items.push({ key: quoteAudioKey(q.id, lang), lang, text: `${q.text[lang]} — ${authorName(q.authorId, lang)}` });
    }
  }
  for (const c of CONCEPTS_RAW) {
    for (const lang of ALL_LANGS) {
      items.push({ key: conceptAudioKey(c.latin, lang), lang, text: `${c.latin}. ${c.name[lang]}. ${c.desc[lang]}` });
    }
  }
  return items;
}
