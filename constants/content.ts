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
  { id: '37', authorId: 'marcus', sourceId: 'meditations', theme: 'sabah', text: { tr: 'Bugün huysuzlukla karşılaşacaksın. Hazır ol — ama kırılma.', en: 'Today you will encounter rudeness. Be ready — but do not break.', de: 'Heute wirst du auf Unfreundlichkeit stoßen. Sei bereit — aber brich nicht.', ru: 'Сегодня ты встретишь грубость. Будь готов — но не сломайся.', fr: "Aujourd'hui tu croiseras de la rudesse. Tiens-toi prêt — mais ne te brise pas.", es: 'Hoy encontrarás rudeza. Prepárate — pero no te quiebres.' } },
  { id: '38', authorId: 'marcus', sourceId: 'meditations', theme: 'olum', text: { tr: 'Her işi son işinmiş gibi yap. Telaşsız, savruk değil, kendinden kaçmadan.', en: 'Do every task as if it were your last. Without panic, without carelessness, without fleeing yourself.', de: 'Tu jede Arbeit, als wäre es deine letzte. Ohne Hast, ohne Nachlässigkeit, ohne dich selbst zu fliehen.', ru: 'Делай каждое дело, как будто оно последнее. Без суеты, без небрежности, без бегства от себя.', fr: "Fais chaque tâche comme si c'était la dernière. Sans panique, sans négligence, sans fuir toi-même.", es: 'Haz cada tarea como si fuera la última. Sin pánico, sin descuido, sin huir de ti mismo.' } },
  { id: '39', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Kendi ruhunu değiştirmek, dünyayı değiştirmekten zordur — ama tek gerçek iş budur.', en: 'To change your own soul is harder than to change the world — but it is the only real task.', de: 'Die eigene Seele zu ändern ist schwerer, als die Welt zu ändern — aber es ist die einzige wirkliche Aufgabe.', ru: 'Изменить собственную душу труднее, чем изменить мир, — но это единственная настоящая работа.', fr: "Changer sa propre âme est plus difficile que changer le monde — mais c'est la seule vraie tâche.", es: 'Cambiar tu propia alma es más difícil que cambiar el mundo — pero es la única tarea real.' } },
  { id: '40', authorId: 'marcus', sourceId: 'meditations', theme: 'kontrol', text: { tr: 'Sana olan değil, ona nasıl baktığın acıtır. Bakışını değiştir.', en: 'It is not what happens to you, but how you look at it that hurts. Change your view.', de: 'Nicht was dir geschieht schmerzt, sondern wie du darauf blickst. Ändere deinen Blick.', ru: 'Больно не то, что с тобой случается, а то, как ты на это смотришь. Измени взгляд.', fr: "Ce n'est pas ce qui t'arrive qui blesse, c'est ta façon de le regarder. Change ton regard.", es: 'No es lo que te sucede lo que duele, sino cómo lo miras. Cambia tu mirada.' } },
  { id: '41', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Mutluluk dışarıda aranmaz. O, kendi zihninin bir kararıdır.', en: 'Happiness is not sought outside. It is a decision of your own mind.', de: 'Glück wird nicht außen gesucht. Es ist eine Entscheidung des eigenen Geistes.', ru: 'Счастье не ищут снаружи. Оно — решение собственного ума.', fr: "Le bonheur ne se cherche pas à l'extérieur. C'est une décision de ton propre esprit.", es: 'La felicidad no se busca afuera. Es una decisión de tu propia mente.' } },
  { id: '42', authorId: 'marcus', sourceId: 'meditations', theme: 'sabah', text: { tr: 'Sabah kalkmak istemediğinde sor: Ben yaşamak için mi yaratıldım, yoksa örtü altında ısınmak için mi?', en: 'When you do not want to get up in the morning, ask: was I made to live, or to lie warm under blankets?', de: 'Wenn du morgens nicht aufstehen willst, frage: Bin ich zum Leben geschaffen oder um mich unter der Decke zu wärmen?', ru: 'Когда не хочется вставать утром, спроси: я создан для жизни или для того, чтобы греться под одеялом?', fr: "Quand tu ne veux pas te lever le matin, demande : suis-je fait pour vivre, ou pour rester au chaud sous les couvertures ?", es: 'Cuando no quieras levantarte por la mañana, pregunta: ¿fui hecho para vivir, o para calentarme bajo las mantas?' } },
  { id: '43', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'İnsanlar inzivaya kaçar. Oysa en sakin sığınak, kendi içindir.', en: 'People flee to retreats. Yet the most tranquil refuge is within yourself.', de: 'Menschen flüchten in Abgeschiedenheit. Doch der ruhigste Zufluchtsort ist im eigenen Inneren.', ru: 'Люди убегают в уединение. Но самое тихое убежище — внутри тебя самого.', fr: "Les gens fuient vers la retraite. Pourtant, le refuge le plus paisible est en toi-même.", es: 'Las personas huyen a retiros. Pero el refugio más tranquilo está dentro de ti mismo.' } },
  { id: '44', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Kalan ömrünü, başkalarının ne dediğini düşünerek harcama.', en: 'Do not spend your remaining life thinking about what others say.', de: 'Verbringe dein verbleibendes Leben nicht damit, darüber nachzudenken, was andere sagen.', ru: 'Не трать остаток жизни на размышления о том, что говорят другие.', fr: "Ne dépense pas le reste de ta vie à penser à ce que disent les autres.", es: 'No gastes tu vida restante pensando en lo que dicen los demás.' } },
  { id: '45', authorId: 'marcus', sourceId: 'meditations', theme: 'eylem', text: { tr: 'Engel, yolun kendisi olur. Önündeki taş, basamağındır.', en: 'The obstacle becomes the way. The stone before you is your stepping stone.', de: 'Das Hindernis wird zum Weg. Der Stein vor dir ist deine Stufe.', ru: 'Препятствие становится путём. Камень перед тобой — это твоя ступень.', fr: "L'obstacle devient le chemin. La pierre devant toi est ton marchepied.", es: 'El obstáculo se convierte en el camino. La piedra ante ti es tu escalón.' } },
  { id: '46', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Geçmiş ve gelecek senin değil. Yalnızca şu an elinde.', en: 'The past and the future are not yours. Only the present is in your hands.', de: 'Vergangenheit und Zukunft gehören dir nicht. Nur der Augenblick liegt in deinen Händen.', ru: 'Прошлое и будущее — не твои. Только настоящее у тебя в руках.', fr: "Le passé et l'avenir ne t'appartiennent pas. Seul le présent est entre tes mains.", es: 'El pasado y el futuro no son tuyos. Solo el presente está en tus manos.' } },
  { id: '47', authorId: 'marcus', sourceId: 'meditations', theme: 'cesaret', text: { tr: 'Bir şey zor diye yapılamaz sanma. İnsana mümkün olan, sana da mümkündür.', en: 'Do not think something cannot be done just because it is hard. What is possible for a human is possible for you.', de: 'Glaube nicht, etwas sei nicht zu tun, nur weil es schwer ist. Was einem Menschen möglich ist, ist auch dir möglich.', ru: 'Не думай, что что-то невозможно только потому, что оно трудно. Что возможно для человека — возможно и для тебя.', fr: "Ne pense pas qu'une chose est impossible parce qu'elle est difficile. Ce qui est possible à un être humain l'est aussi pour toi.", es: 'No creas que algo no puede hacerse por ser difícil. Lo que es posible para un ser humano es posible para ti.' } },
  { id: '48', authorId: 'marcus', sourceId: 'meditations', theme: 'ofke', text: { tr: 'Öfkenin sana verdiği zarar, onu doğuran şeyden büyüktür.', en: 'The harm anger does to you is greater than the harm that caused it.', de: 'Der Schaden, den dir der Zorn zufügt, ist größer als der Schaden, der ihn hervorgerufen hat.', ru: 'Вред, который причиняет тебе гнев, больше, чем вред от того, что его вызвало.', fr: "Le tort que la colère te cause est plus grand que le tort qui l'a provoquée.", es: 'El daño que la ira te hace es mayor que el daño que la causó.' } },
  { id: '49', authorId: 'marcus', sourceId: 'meditations', theme: 'sadelik', text: { tr: 'Yalın yaşa. Çoğu şey gereksiz; çıkar onları, huzur kalır.', en: 'Live simply. Most things are unnecessary; remove them and peace remains.', de: 'Lebe schlicht. Vieles ist unnötig; nimm es fort, und Frieden bleibt.', ru: 'Живи просто. Большинство вещей лишние; убери их — останется покой.', fr: "Vis simplement. La plupart des choses sont inutiles ; retire-les, et la paix demeure.", es: 'Vive con sencillez. La mayoría de las cosas son innecesarias; elimínalas y quedará la paz.' } },
  { id: '50', authorId: 'marcus', sourceId: 'meditations', theme: 'kabul', text: { tr: 'Kimseye kin tutma. İnsanlar bilmeden hata eder — sen bilerek bağışla.', en: 'Hold no grudge against anyone. People err in ignorance — you forgive in knowledge.', de: 'Hege keinen Groll gegen jemanden. Menschen irren aus Unwissenheit — du vergibst bewusst.', ru: 'Не держи ни на кого обиды. Люди ошибаются по незнанию — ты прощай намеренно.', fr: "Ne garde aucune rancœur contre personne. Les gens se trompent par ignorance — toi, pardonne en connaissance de cause.", es: 'No guardes rencor a nadie. Las personas yerran por ignorancia — tú perdona conscientemente.' } },
  { id: '51', authorId: 'marcus', sourceId: 'meditations', theme: 'kader', text: { tr: 'Evrenin bir parçasısın. Akışına diren, yorulursun; uy, hafifle.', en: 'You are part of the universe. Resist its flow and you tire; align with it and you lighten.', de: 'Du bist ein Teil des Universums. Widerstehe seinem Fluss, und du erschöpfst dich; richte dich danach, und du wirst leichter.', ru: 'Ты — часть вселенной. Сопротивляйся её течению — устанешь; следуй ему — станет легче.', fr: "Tu fais partie de l'univers. Résiste à son flux et tu t'épuises ; accorde-toi à lui et tu t'allèges.", es: 'Eres parte del universo. Resiste su flujo y te cansas; síguelo y te aligeras.' } },
  { id: '52', authorId: 'marcus', sourceId: 'meditations', theme: 'ic-huzur', text: { tr: 'Ne düşünürsen, ruhun o renge boyanır. Düşüncelerini seç.', en: 'Whatever you think, your soul takes on that color. Choose your thoughts.', de: 'Was immer du denkst, deine Seele nimmt diese Farbe an. Wähle deine Gedanken.', ru: 'О чём думаешь — таким цветом окрашивается твоя душа. Выбирай свои мысли.', fr: "Quoi que tu penses, ton âme prend cette couleur. Choisis tes pensées.", es: 'Lo que pienses, tu alma tomará ese color. Elige tus pensamientos.' } },
  { id: '53', authorId: 'marcus', sourceId: 'meditations', theme: 'olum', text: { tr: 'Ölüm doğa kadar olağan. Korkma; doğan her şey döner.', en: 'Death is as natural as nature. Do not fear it; all that is born returns.', de: 'Der Tod ist so natürlich wie die Natur. Fürchte ihn nicht; alles, was geboren wurde, kehrt zurück.', ru: 'Смерть так же естественна, как природа. Не бойся её; всё рождённое возвращается.', fr: "La mort est aussi naturelle que la nature. Ne la crains pas ; tout ce qui naît revient.", es: 'La muerte es tan natural como la naturaleza. No la temas; todo lo que nace regresa.' } },
  { id: '54', authorId: 'marcus', sourceId: 'meditations', theme: 'zaman', text: { tr: 'Bugünü kurtar. Yarın senin değil, belki hiç gelmeyecek.', en: 'Save today. Tomorrow is not yours — it may never come.', de: 'Rette den heutigen Tag. Morgen gehört dir nicht — vielleicht kommt es nie.', ru: 'Спаси сегодняшний день. Завтра не твоё — оно может не наступить.', fr: "Sauve aujourd'hui. Demain ne t'appartient pas — peut-être ne viendra-t-il jamais.", es: 'Salva el día de hoy. El mañana no es tuyo — quizás no llegue nunca.' } },
  { id: '55', authorId: 'marcus', sourceId: 'meditations', theme: 'ofke', text: { tr: 'Başkasının kusuruna kızdığında, kendi benzer kusuruna bak.', en: "When you are angry at another's fault, look at your own similar fault.", de: 'Wenn du über den Fehler eines anderen ärgerst, schau auf deinen eigenen ähnlichen Fehler.', ru: 'Когда злишься на чужой изъян, посмотри на собственный похожий.', fr: "Quand tu t'irrites du défaut d'autrui, regarde ton propre défaut similaire.", es: 'Cuando te irrites por el defecto de otro, mira tu propio defecto similar.' } },
  { id: '56', authorId: 'marcus', sourceId: 'meditations', theme: 'sukran', text: { tr: 'İyilik yap ve unut. Karşılık bekleyen, iyilik değil ticaret yapar.', en: 'Do good and forget it. One who expects a return is doing trade, not kindness.', de: 'Tu Gutes und vergiss es. Wer eine Gegenleistung erwartet, treibt Handel, nicht Güte.', ru: 'Делай добро и забывай. Кто ждёт отдачи, занимается торговлей, а не добродетелью.', fr: "Fais le bien et oublie-le. Celui qui attend une contrepartie fait du commerce, pas de la bonté.", es: 'Haz el bien y olvídalo. Quien espera retribución hace negocios, no bondad.' } },
  { id: '57', authorId: 'marcus', sourceId: 'meditations', theme: 'cesaret', text: { tr: 'Sınırların çoğu zihnindedir. Sınırı koyan da kaldıran da sensin.', en: 'Most of your limits are in your mind. The one who set them can also lift them.', de: 'Die meisten deiner Grenzen sind in deinem Kopf. Derjenige, der sie gesetzt hat, kann sie auch aufheben.', ru: 'Большинство твоих границ — в уме. Кто их поставил, тот может и убрать.', fr: "La plupart de tes limites sont dans ton esprit. Celui qui les a posées peut aussi les lever.", es: 'La mayoría de tus límites están en tu mente. Quien los puso también puede quitarlos.' } },
  { id: '58', authorId: 'marcus', sourceId: 'meditations', theme: 'sukran', text: { tr: 'Sahip olduklarını, hiç yokmuş da yeni kavuşmuşsun gibi düşün.', en: 'Think of what you have as if you had never had it and had just received it.', de: 'Denke an das, was du hast, als hättest du es nie gehabt und es gerade erst erhalten.', ru: 'Думай о том, что имеешь, как будто никогда этого не было и ты только что это получил.', fr: "Pense à ce que tu possèdes comme si tu ne l'avais jamais eu et venais juste de le recevoir.", es: 'Piensa en lo que tienes como si nunca lo hubieras tenido y acabaras de recibirlo.' } },
  { id: '59', authorId: 'marcus', sourceId: 'meditations', theme: 'kontrol', text: { tr: 'Dış olaylar seni sarsamaz; onlara verdiğin yargı sarsar. Yargıyı bırak.', en: 'Outer events cannot shake you; the judgment you give them can. Release the judgment.', de: 'Äußere Ereignisse können dich nicht erschüttern; das Urteil, das du ihnen gibst, kann es. Lass das Urteil los.', ru: 'Внешние события не могут поколебать тебя; это делает суждение, которое ты им выносишь. Отпусти суждение.', fr: "Les événements extérieurs ne peuvent pas t'ébranler ; c'est le jugement que tu leur portes qui le fait. Lâche le jugement.", es: 'Los sucesos externos no pueden sacudirte; lo que te sacude es el juicio que les das. Suelta el juicio.' } },
  { id: '60', authorId: 'marcus', sourceId: 'meditations', theme: 'disiplin', text: { tr: 'Acele etme, ama durma da. Sakin bir kararlılıkla yürü.', en: 'Do not hurry, but do not stop either. Walk with calm determination.', de: 'Beeile dich nicht, aber steh auch nicht still. Geh mit ruhiger Entschlossenheit.', ru: 'Не торопись, но и не останавливайся. Иди с тихой решимостью.', fr: "Ne te dépêche pas, mais ne t'arrête pas non plus. Avance avec une tranquille détermination.", es: 'No te apresures, pero no te detengas tampoco. Camina con serena determinación.' } },
  { id: '61', authorId: 'marcus', sourceId: 'meditations', theme: 'eylem', text: { tr: 'Hayat kısa. Tek meyvesi: doğru bir karakter ve topluma yararlı işler.', en: 'Life is short. Its only fruit: an upright character and deeds useful to the community.', de: 'Das Leben ist kurz. Seine einzige Frucht: ein aufrechter Charakter und der Gesellschaft nützliche Taten.', ru: 'Жизнь коротка. Единственный её плод: прямой характер и дела, полезные обществу.', fr: "La vie est courte. Son seul fruit : un caractère droit et des actes utiles à la communauté.", es: 'La vida es corta. Su único fruto: un carácter recto y obras útiles a la comunidad.' } },
  // Seneca (md#28 "Kayıplarını değil..." mevcut id6 ile aynı → eklenmedi)
  { id: '62', authorId: 'seneca', sourceId: 'brevity', theme: 'zaman', text: { tr: 'Paranı kıskançlıkla korursun da zamanını herkese dağıtırsın. Oysa kıt olan zamandır.', en: 'You guard your money jealously yet give your time to everyone. Yet it is time that is scarce.', de: 'Du hütest dein Geld eifersüchtig, verschenkst aber deine Zeit an jeden. Dabei ist die Zeit das Knappe.', ru: 'Деньги ты бережёшь ревниво, а время раздаёшь всем. Но именно время — в дефиците.', fr: "Tu gardes ton argent jalousement et distribues ton temps à tout le monde. Or c'est le temps qui est rare.", es: 'Guardas tu dinero celosamente pero regalas tu tiempo a todos. Sin embargo, es el tiempo lo que escasea.' } },
  { id: '63', authorId: 'seneca', sourceId: 'letters', theme: 'yas', text: { tr: 'Sevdiklerin senin değil, sana emanet. Geri vermeden önce ödünç aldığını hatırla.', en: 'Your loved ones are not yours; they are entrusted to you. Remember you borrowed them before giving them back.', de: 'Deine Liebsten gehören dir nicht; sie sind dir anvertraut. Bedenke, dass du sie geliehen hast, bevor du sie zurückgibst.', ru: 'Близкие — не твои; они тебе доверены. Помни, что ты взял их взаймы, прежде чем отдать обратно.', fr: "Tes proches ne t'appartiennent pas ; ils te sont confiés. Souviens-toi que tu les as empruntés avant de les rendre.", es: 'Tus seres queridos no son tuyos; te son confiados. Recuerda que los tomaste prestados antes de devolverlos.' } },
  { id: '64', authorId: 'seneca', sourceId: 'letters', theme: 'kaygi', text: { tr: 'Acıyı çekmeden önce çekersek, iki kez acımış oluruz.', en: 'If we suffer pain before we suffer it, we have suffered it twice.', de: 'Wenn wir den Schmerz leiden, bevor wir ihn erleiden, haben wir ihn zweimal gelitten.', ru: 'Если мы страдаем от боли прежде, чем она наступила, мы страдаем дважды.', fr: "Si nous souffrons la douleur avant de la subir, nous l'avons subie deux fois.", es: 'Si sufrimos el dolor antes de sufrirlo, lo hemos sufrido dos veces.' } },
  { id: '65', authorId: 'seneca', sourceId: 'letters', theme: 'eylem', text: { tr: 'Rüzgârın yönünü bilmeyene hiçbir liman yaramaz.', en: 'No harbor is useful to the one who does not know which direction the wind is blowing.', de: 'Kein Hafen nützt dem, der nicht weiß, in welche Richtung der Wind weht.', ru: 'Никакая гавань не поможет тому, кто не знает, в какую сторону дует ветер.', fr: "Aucun port n'est utile à celui qui ne sait pas de quel côté souffle le vent.", es: 'Ningún puerto es útil para quien no sabe en qué dirección sopla el viento.' } },
  { id: '66', authorId: 'seneca', sourceId: 'letters', theme: 'kaygi', text: { tr: 'Korktuğun şeyi incele. Çoğu zaman korku, olaydan büyüktür.', en: 'Examine what you fear. Most of the time, the fear is greater than the event.', de: 'Prüfe, was dich ängstigt. Meistens ist die Furcht größer als das Ereignis.', ru: 'Исследуй то, чего боишься. Чаще всего страх больше самого события.', fr: "Examine ce que tu crains. La plupart du temps, la peur est plus grande que l'événement.", es: 'Examina lo que temes. La mayoría de las veces, el miedo es mayor que el suceso.' } },
  { id: '67', authorId: 'seneca', sourceId: 'letters', theme: 'sadelik', text: { tr: 'Zenginlik, az şeyle yetinmeyi bilmektir — çok şeye sahip olmak değil.', en: 'Wealth is knowing how to be content with little — not owning a great deal.', de: 'Reichtum bedeutet zu wissen, wie man mit wenig zufrieden ist — nicht vieles zu besitzen.', ru: 'Богатство — это умение довольствоваться малым, а не владение многим.', fr: "La richesse, c'est savoir se contenter de peu — non posséder beaucoup.", es: 'La riqueza es saber contentarse con poco — no poseer mucho.' } },
  { id: '68', authorId: 'seneca', sourceId: 'letters', theme: 'olum', text: { tr: 'Her gün sonun olabilir gibi yaşa; ama yarın hiç gelmeyecekmiş gibi de korkma.', en: 'Live each day as if it could be your last; but do not fear as if tomorrow will never come.', de: 'Lebe jeden Tag, als könnte er dein letzter sein; fürchte aber nicht, als käme das Morgen nie.', ru: 'Живи каждый день, как если бы он мог стать последним; но не бойся, словно завтра никогда не наступит.', fr: "Vis chaque jour comme s'il pouvait être le dernier ; mais ne crains pas comme si le lendemain ne devait jamais venir.", es: 'Vive cada día como si pudiera ser el último; pero no temas como si el mañana nunca fuera a llegar.' } },
  { id: '69', authorId: 'seneca', sourceId: 'letters', theme: 'disiplin', text: { tr: 'Yaşamayı, yaşamı bitirene dek öğreniriz.', en: 'We learn to live until the end of life.', de: 'Wir lernen zu leben, bis das Leben endet.', ru: 'Мы учимся жить до самого конца жизни.', fr: "Nous apprenons à vivre jusqu'à la fin de la vie.", es: 'Aprendemos a vivir hasta que termina la vida.' } },
  { id: '70', authorId: 'seneca', sourceId: 'letters', theme: 'cesaret', text: { tr: 'Talih kiminle gideceğini bilir: cesurla yürür, korkağı sürükler.', en: 'Fortune knows whom to go with: it walks with the brave and drags the coward.', de: 'Das Glück weiß, mit wem es geht: es schreitet mit dem Mutigen und schleift den Feigling.', ru: 'Судьба знает, с кем идти: она шагает с храбрым и тащит труса.', fr: "La fortune sait avec qui marcher : elle avance avec le courageux et traîne le lâche.", es: 'La fortuna sabe con quién ir: camina con el valiente y arrastra al cobarde.' } },
  { id: '71', authorId: 'seneca', sourceId: 'letters', theme: 'ic-huzur', text: { tr: 'Bilge, elindekiyle zengindir. Aptal, eksiğiyle yoksul.', en: 'The wise person is rich with what he has. The fool is poor with what he lacks.', de: 'Der Weise ist reich mit dem, was er hat. Der Tor ist arm mit dem, was ihm fehlt.', ru: 'Мудрец богат тем, что имеет. Глупец беден тем, чего ему не хватает.', fr: "Le sage est riche de ce qu'il a. L'insensé est pauvre de ce qu'il lui manque.", es: 'El sabio es rico con lo que tiene. El necio es pobre con lo que le falta.' } },
  { id: '72', authorId: 'seneca', sourceId: 'letters', theme: 'kabul', text: { tr: 'Hiçbir şey bizim değil; her şey ödünç. Geri istendiğinde şikâyet etme.', en: 'Nothing is ours; everything is borrowed. Do not complain when it is asked back.', de: 'Nichts gehört uns; alles ist geliehen. Beklage dich nicht, wenn es zurückgefordert wird.', ru: 'Ничто не наше; всё взято взаймы. Не жалуйся, когда просят вернуть.', fr: "Rien n'est à nous ; tout est emprunté. Ne te plains pas quand on le réclame.", es: 'Nada es nuestro; todo es prestado. No te quejes cuando te lo pidan de vuelta.' } },
  { id: '73', authorId: 'seneca', sourceId: 'letters', theme: 'dostluk', text: { tr: 'Çok kişiyle değil, doğru kişiyle vakit geçir. Kalite, kalabalığı yener.', en: 'Spend time not with many people, but with the right person. Quality beats quantity.', de: 'Verbringe Zeit nicht mit vielen Menschen, sondern mit den richtigen. Qualität schlägt Menge.', ru: 'Проводи время не со многими людьми, а с нужными. Качество превосходит количество.', fr: "Passe du temps non avec beaucoup de gens, mais avec la bonne personne. La qualité l'emporte sur la quantité.", es: 'Pasa tiempo no con muchas personas, sino con la persona adecuada. La calidad supera la cantidad.' } },
  { id: '74', authorId: 'seneca', sourceId: 'onAnger', theme: 'ofke', text: { tr: 'Öfke, kısa süreli bir deliliktir. Bir an bekle — akıl geri gelsin.', en: 'Anger is a brief madness. Wait a moment — let reason return.', de: 'Zorn ist ein kurzer Wahnsinn. Warte einen Moment — lass die Vernunft zurückkehren.', ru: 'Гнев — мимолётное безумие. Подожди мгновение — пусть разум вернётся.', fr: "La colère est une folie passagère. Attends un instant — laisse la raison revenir.", es: 'La ira es una locura breve. Espera un momento — deja que la razón regrese.' } },
  { id: '75', authorId: 'seneca', sourceId: 'letters', theme: 'kabul', text: { tr: 'Geleceği merak etme. Onu olduğu gibi karşıla — ister tatlı, ister acı.', en: 'Do not fret about the future. Meet it as it comes — sweet or bitter.', de: 'Grüble nicht über die Zukunft. Begegne ihr, wie sie kommt — süß oder bitter.', ru: 'Не беспокойся о будущем. Встречай его как есть — сладким или горьким.', fr: "Ne t'inquiète pas de l'avenir. Accueille-le tel qu'il vient — doux ou amer.", es: 'No te preocupes por el futuro. Recíbelo tal como venga — dulce o amargo.' } },
  { id: '76', authorId: 'seneca', sourceId: 'letters', theme: 'disiplin', text: { tr: 'En büyük güç, kendine hâkim olmaktır.', en: 'The greatest power is mastery over yourself.', de: 'Die größte Macht ist die Herrschaft über sich selbst.', ru: 'Величайшая сила — власть над самим собой.', fr: "Le plus grand pouvoir, c'est la maîtrise de soi-même.", es: 'El mayor poder es el dominio sobre uno mismo.' } },
  { id: '77', authorId: 'seneca', sourceId: 'letters', theme: 'zaman', text: { tr: 'Bir gün bile, dikkatle yaşanırsa, koca bir ömre bedeldir.', en: 'Even a single day, lived attentively, is worth a whole life.', de: 'Selbst ein einziger Tag, aufmerksam gelebt, ist ein ganzes Leben wert.', ru: 'Даже один день, прожитый внимательно, стоит целой жизни.', fr: "Même un seul jour, vécu avec attention, vaut toute une vie.", es: 'Incluso un solo día, vivido con atención, vale toda una vida.' } },
  { id: '78', authorId: 'seneca', sourceId: 'brevity', theme: 'zaman', text: { tr: 'Yol uzun değil — biz oyalanıyoruz. Ömür kısa değil, biz savuruyoruz.', en: 'The road is not long — we linger. Life is not short — we squander it.', de: 'Der Weg ist nicht lang — wir trödeln. Das Leben ist nicht kurz — wir verschwenden es.', ru: 'Дорога не длинная — это мы мешкаем. Жизнь не короткая — это мы её транжирим.', fr: "La route n'est pas longue — c'est nous qui traînons. La vie n'est pas courte — c'est nous qui la gaspillons.", es: 'El camino no es largo — somos nosotros quienes nos entretenemos. La vida no es corta — somos nosotros quienes la derrochamos.' } },
  { id: '79', authorId: 'seneca', sourceId: 'letters', theme: 'sadelik', text: { tr: 'Yoksulluk az şeye sahip olmak değil, çok şeye aç olmaktır.', en: 'Poverty is not having little, but craving much.', de: 'Armut bedeutet nicht, wenig zu haben, sondern nach viel zu gieren.', ru: 'Бедность — не в том, чтобы иметь мало, а в том, чтобы жаждать многого.', fr: "La pauvreté n'est pas d'avoir peu, mais d'avoir faim de beaucoup.", es: 'La pobreza no es tener poco, sino anhelar mucho.' } },
  { id: '80', authorId: 'seneca', sourceId: 'letters', theme: 'kader', text: { tr: 'Kaderi kabul et; o seni zaten taşıyor. Diren, sadece yorulursun.', en: 'Accept fate; it is already carrying you. Resist, and you only tire yourself.', de: 'Nimm das Schicksal an; es trägt dich bereits. Widerstehe, und du erschöpfst dich nur.', ru: 'Прими судьбу; она уже несёт тебя. Сопротивляйся — только устанешь.', fr: "Accepte le destin ; il te porte déjà. Résiste, et tu ne feras que t'épuiser.", es: 'Acepta el destino; ya te está llevando. Resiste, y solo te cansas.' } },
  { id: '81', authorId: 'seneca', sourceId: 'letters', theme: 'dostluk', text: { tr: 'Dostluk fayda için değildir. Fayda için sevilen, fayda bitince bırakılır.', en: 'Friendship is not for gain. One loved for gain is abandoned when the gain ends.', de: 'Freundschaft ist nicht für den Nutzen. Wer um des Nutzens willen geliebt wird, wird verlassen, wenn der Nutzen endet.', ru: 'Дружба — не ради выгоды. Того, кого любят ради выгоды, бросают, когда выгода кончается.', fr: "L'amitié n'est pas pour le profit. Celui qu'on aime pour le profit est abandonné quand le profit cesse.", es: 'La amistad no es para beneficio. Quien es amado por beneficio es abandonado cuando el beneficio termina.' } },
  { id: '82', authorId: 'seneca', sourceId: 'letters', theme: 'cesaret', text: { tr: 'Her yeni başlangıç, bir önceki cesaretin meyvesidir.', en: 'Every new beginning is the fruit of a previous act of courage.', de: 'Jeder neue Anfang ist die Frucht eines vorherigen Mutstücks.', ru: 'Каждое новое начало — плод предыдущего мужества.', fr: "Chaque nouveau commencement est le fruit d'un précédent acte de courage.", es: 'Cada nuevo comienzo es el fruto de un acto de valor anterior.' } },
  { id: '83', authorId: 'seneca', sourceId: 'letters', theme: 'olum', text: { tr: 'Ne kadar yaşadığın değil, nasıl yaşadığın önemli.', en: 'What matters is not how long you lived, but how you lived.', de: 'Was zählt ist nicht, wie lange du gelebt hast, sondern wie du gelebt hast.', ru: 'Важно не то, сколько ты прожил, а то, как ты жил.', fr: "Ce qui compte, c'est non pas combien de temps tu as vécu, mais comment tu as vécu.", es: 'Lo que importa no es cuánto viviste, sino cómo viviste.' } },
  { id: '84', authorId: 'seneca', sourceId: 'onAnger', theme: 'ofke', text: { tr: 'Kızgınken hiçbir karar verme. Dalga geçince denize bak.', en: 'Make no decision when angry. Wait for the wave to pass, then look at the sea.', de: 'Triff keine Entscheidungen, wenn du wütend bist. Warte, bis die Welle vorbei ist, dann blick aufs Meer.', ru: 'Не принимай решений в гневе. Дождись, пока волна пройдёт, тогда смотри на море.', fr: "Ne prends aucune décision quand tu es en colère. Attends que la vague passe, puis regarde la mer.", es: 'No tomes ninguna decisión cuando estés enojado. Espera que pase la ola, luego mira el mar.' } },
  { id: '85', authorId: 'seneca', sourceId: 'letters', theme: 'sukran', text: { tr: 'Şükret — ama yokken de huzurlu kalabilecek kadar az şeye bağlan.', en: 'Be grateful — but be attached to so little that you can remain at peace even without it.', de: 'Sei dankbar — aber hänge so wenig an Dingen, dass du auch ohne sie in Frieden bleiben kannst.', ru: 'Будь благодарен — но привязывайся к столь немногому, чтобы оставаться в покое даже без этого.', fr: "Sois reconnaissant — mais attache-toi à si peu que tu puisses rester en paix même sans cela.", es: 'Sé agradecido — pero apégate a tan poco que puedas permanecer en paz incluso sin ello.' } },
  // Epiktetos
  { id: '86', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Bazı şeyler senin elinde, bazıları değil. Huzur, ikisini ayırdığın an başlar.', en: 'Some things are in your power, some are not. Peace begins the moment you distinguish between them.', de: 'Einiges liegt in deiner Macht, anderes nicht. Frieden beginnt in dem Augenblick, in dem du beides unterscheidest.', ru: 'Одни вещи в твоей власти, другие нет. Мир начинается в тот миг, когда ты их различаешь.', fr: "Certaines choses sont en ton pouvoir, d'autres non. La paix commence au moment où tu les distingues.", es: 'Algunas cosas están en tu poder, otras no. La paz comienza en el momento en que las distingues.' } },
  { id: '87', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'ofke', text: { tr: 'Seni öfkelendiren olay değil, ona verdiğin anlam. Tepkiye bir an tanı.', en: 'It is not the event that angers you, but the meaning you give it. Give your response a moment.', de: 'Nicht das Ereignis macht dich wütend, sondern die Bedeutung, die du ihm gibst. Gib deiner Reaktion einen Moment.', ru: 'Тебя злит не событие, а смысл, который ты ему придаёшь. Дай своей реакции мгновение.', fr: "Ce n'est pas l'événement qui te met en colère, mais le sens que tu lui donnes. Accorde un instant à ta réaction.", es: 'No es el suceso lo que te enoja, sino el significado que le das. Dale un momento a tu respuesta.' } },
  { id: '88', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kaygi', text: { tr: 'İnsanı üzen şeyler değil, şeyler hakkındaki düşünceleridir.', en: 'People are not troubled by things, but by their thoughts about things.', de: 'Menschen werden nicht durch Dinge beunruhigt, sondern durch ihre Gedanken über die Dinge.', ru: 'Людей расстраивают не вещи, а мысли о вещах.', fr: "Ce ne sont pas les choses qui troublent les gens, mais leurs pensées sur les choses.", es: 'A las personas no las afligen las cosas, sino sus pensamientos sobre las cosas.' } },
  { id: '89', authorId: 'epictetus', sourceId: 'discourses', theme: 'ic-huzur', text: { tr: 'Hayatını değiştirmek istiyorsan, önce düşünceni değiştir.', en: 'If you want to change your life, first change your thought.', de: 'Wenn du dein Leben ändern willst, ändere zuerst deinen Gedanken.', ru: 'Если хочешь изменить жизнь — сначала измени мысль.', fr: "Si tu veux changer ta vie, change d'abord ta pensée.", es: 'Si quieres cambiar tu vida, cambia primero tu pensamiento.' } },
  { id: '90', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'yas', text: { tr: "Sahip olduğun hiçbir şeyi 'kaybettim' deme; 'geri verdim' de.", en: "Of nothing you have say 'I lost it'; say 'I gave it back.'", de: "Sag von nichts, was du hattest, 'Ich habe es verloren'; sag 'Ich habe es zurückgegeben.'", ru: "Ни о чём из того, что у тебя было, не говори «я потерял»; говори «я вернул».", fr: "De rien de ce que tu possèdes ne dis 'Je l'ai perdu' ; dis 'Je l'ai rendu.'", es: "De nada de lo que tienes digas 'Lo perdí'; di 'Lo devolví'." } },
  { id: '91', authorId: 'epictetus', sourceId: 'discourses', theme: 'sadelik', text: { tr: 'İki kulağın, bir ağzın var. Bunu unutma.', en: 'You have two ears and one mouth. Do not forget this.', de: 'Du hast zwei Ohren und einen Mund. Vergiss das nicht.', ru: 'У тебя два уха и один рот. Не забывай об этом.', fr: "Tu as deux oreilles et une bouche. N'oublie pas cela.", es: 'Tienes dos oídos y una boca. No lo olvides.' } },
  { id: '92', authorId: 'epictetus', sourceId: 'discourses', theme: 'ic-huzur', text: { tr: 'Özgürlük, istediğini elde etmekle değil, isteklerini terbiye etmekle gelir.', en: 'Freedom comes not from getting what you want, but from taming what you want.', de: 'Freiheit kommt nicht davon, zu bekommen, was du willst, sondern davon, deine Wünsche zu zähmen.', ru: 'Свобода приходит не от того, чтобы получить желаемое, а от того, чтобы укротить свои желания.', fr: "La liberté vient non d'obtenir ce qu'on veut, mais de discipliner ses désirs.", es: 'La libertad no viene de obtener lo que quieres, sino de domar lo que quieres.' } },
  { id: '93', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Kimse seni rızan olmadan incitemez. İncinmeyi de sen seçersin.', en: 'No one can hurt you without your consent. You also choose to be hurt.', de: 'Niemand kann dir ohne deine Zustimmung schaden. Du wählst auch, verletzt zu werden.', ru: 'Никто не может обидеть тебя без твоего согласия. Ты тоже выбираешь быть обиженным.', fr: "Personne ne peut te blesser sans ton consentement. C'est aussi toi qui choisis d'être blessé.", es: 'Nadie puede hacerte daño sin tu consentimiento. Tú también eliges ser herido.' } },
  { id: '94', authorId: 'epictetus', sourceId: 'discourses', theme: 'eylem', text: { tr: 'Önce ne olmak istediğine karar ver. Sonra yapman gerekeni yap.', en: 'First decide what you want to be. Then do what you must.', de: 'Entscheide zuerst, was du sein willst. Dann tue, was nötig ist.', ru: 'Сначала реши, кем хочешь быть. Потом делай то, что нужно.', fr: "Décide d'abord ce que tu veux être. Puis fais ce que tu dois.", es: 'Decide primero qué quieres ser. Luego haz lo que debes.' } },
  { id: '95', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'ic-huzur', text: { tr: 'Başkalarının seni kınamasına değil, kendi vicdanına bak.', en: 'Look not at others condemning you, but at your own conscience.', de: 'Achte nicht auf das Urteil anderer, sondern auf dein eigenes Gewissen.', ru: 'Смотри не на то, как тебя осуждают другие, а на собственную совесть.', fr: "Ne regarde pas les autres te condamner, mais ta propre conscience.", es: 'No mires a los demás condenarte, sino tu propia conciencia.' } },
  { id: '96', authorId: 'epictetus', sourceId: 'discourses', theme: 'cesaret', text: { tr: 'Felsefenin meyvesi, hiçbir koşulda sarsılmayan bir ruhtur.', en: 'The fruit of philosophy is a soul that no circumstance can shake.', de: 'Die Frucht der Philosophie ist eine Seele, die keine Umstände erschüttern können.', ru: 'Плод философии — душа, которую не может поколебать ни одно обстоятельство.', fr: "Le fruit de la philosophie est une âme qu'aucune circonstance ne peut ébranler.", es: 'El fruto de la filosofía es un alma que ninguna circunstancia puede sacudir.' } },
  { id: '97', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kabul', text: { tr: 'Olayların olmasını istediğin gibi değil, oldukları gibi iste. Huzur böyle gelir.', en: 'Wish events not as you want them, but as they are. Peace comes this way.', de: 'Wünsche die Ereignisse nicht so, wie du sie willst, sondern so, wie sie sind. So kommt der Frieden.', ru: 'Желай событий не такими, какими хочешь, а такими, каковы они есть. Так приходит мир.', fr: "Désire les événements non comme tu les veux, mais tels qu'ils sont. La paix vient ainsi.", es: 'Desea los sucesos no como quieres que sean, sino como son. La paz llega así.' } },
  { id: '98', authorId: 'epictetus', sourceId: 'discourses', theme: 'disiplin', text: { tr: 'Küçük şeylerde ustalaş. Büyük denge, küçük disiplinlerden doğar.', en: 'Master small things. Great balance is born from small disciplines.', de: 'Meistere die kleinen Dinge. Großes Gleichgewicht entsteht aus kleinen Disziplinen.', ru: 'Осваивай малое. Великое равновесие рождается из малых дисциплин.', fr: "Maîtrise les petites choses. Le grand équilibre naît de petites disciplines.", es: 'Domina las cosas pequeñas. El gran equilibrio nace de pequeñas disciplinas.' } },
  { id: '99', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'cesaret', text: { tr: 'Hasta beden, hür bir iradeye engel değildir — sakat olan bedenin değil, seçimindir.', en: 'A sick body is no obstacle to a free will — what is lame is not the body but the choice.', de: 'Ein kranker Körper ist kein Hindernis für einen freien Willen — was lahmt ist nicht der Körper, sondern die Entscheidung.', ru: 'Больное тело не мешает свободной воле — хромает не тело, а выбор.', fr: "Un corps malade n'est pas un obstacle à une volonté libre — ce qui boite, c'est non le corps mais le choix.", es: 'Un cuerpo enfermo no es obstáculo para una voluntad libre — lo que cojea no es el cuerpo sino la elección.' } },
  { id: '100', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'sadelik', text: { tr: 'Konuşmadan önce sus. Çoğu pişmanlık, fazladan söylenen sözdür.', en: 'Be silent before speaking. Most regrets are words spoken one too many.', de: 'Schweige, bevor du sprichst. Die meisten Reue entstehen durch ein Wort zu viel.', ru: 'Помолчи перед тем, как говорить. Большинство сожалений — это лишние слова.', fr: "Tais-toi avant de parler. La plupart des regrets sont des mots de trop.", es: 'Calla antes de hablar. La mayoría de los arrepentimientos son palabras de más.' } },
  { id: '101', authorId: 'epictetus', sourceId: 'discourses', theme: 'cesaret', text: { tr: 'Sınavlar olmadan güç olmaz. Zorluk, erdeminin antrenörüdür.', en: 'Without trials there is no strength. Difficulty is the trainer of your virtue.', de: 'Ohne Prüfungen gibt es keine Stärke. Schwierigkeit ist der Trainer deiner Tugend.', ru: 'Без испытаний нет силы. Трудность — тренер твоей добродетели.', fr: "Sans épreuves, pas de force. La difficulté est l'entraîneur de ta vertu.", es: 'Sin pruebas no hay fuerza. La dificultad es el entrenador de tu virtud.' } },
  { id: '102', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kontrol', text: { tr: 'Başkasının işine karışma; kendi bahçeni ek. Yeter de artar.', en: "Do not meddle in another's affairs; tend your own garden. That is more than enough.", de: 'Misch dich nicht in die Angelegenheiten anderer; bestelle deinen eigenen Garten. Das reicht und mehr.', ru: 'Не вмешивайся в чужие дела; возделывай свой сад. Этого более чем достаточно.', fr: "Ne te mêle pas des affaires d'autrui ; cultive ton propre jardin. C'est amplement suffisant.", es: 'No te entrometas en los asuntos de otros; cultiva tu propio jardín. Eso es más que suficiente.' } },
  { id: '103', authorId: 'epictetus', sourceId: 'discourses', theme: 'kabul', text: { tr: 'Kaybından korkmadığın şey, gerçekten senindir.', en: 'What you do not fear losing is truly yours.', de: 'Was du nicht fürchtest zu verlieren, gehört dir wirklich.', ru: 'То, потери чего ты не боишься, — действительно твоё.', fr: "Ce dont tu ne crains pas la perte t'appartient vraiment.", es: 'Lo que no temes perder es verdaderamente tuyo.' } },
  { id: '104', authorId: 'epictetus', sourceId: 'discourses', theme: 'disiplin', text: { tr: 'Bekle ve sus. Olgunlaşmamış meyveyi koparmak, ham bırakır.', en: 'Wait and be silent. Picking unripe fruit leaves it raw.', de: 'Warte und schweige. Unreife Früchte zu pflücken lässt sie roh.', ru: 'Жди и молчи. Срывать незрелый плод — значит оставлять его сырым.', fr: "Attends et tais-toi. Cueillir un fruit vert le laisse cru.", es: 'Espera y calla. Recoger fruta verde la deja cruda.' } },
  { id: '105', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'kabul', text: { tr: 'Sana ait olmayan için üzülme. Yağmura kızan, ıslanmaktan kurtulmaz.', en: 'Do not grieve for what is not yours. The one who rages at the rain does not escape getting wet.', de: 'Trauere nicht um das, was nicht dir gehört. Wer sich über den Regen ärgert, entkommt dem Nass nicht.', ru: 'Не горюй о том, что тебе не принадлежит. Гневающийся на дождь не избегает намокнуть.', fr: "Ne te chagrine pas pour ce qui ne t'appartient pas. Celui qui s'irrite contre la pluie n'échappe pas à se mouiller.", es: 'No te aflijas por lo que no es tuyo. Quien se enfurece con la lluvia no escapa de mojarse.' } },
  { id: '106', authorId: 'epictetus', sourceId: 'enchiridion', theme: 'eylem', text: { tr: 'İyi bir insan ol — bunu kanıtlamaya değil, olmaya çalış.', en: 'Be a good person — strive to be it, not to prove it.', de: 'Sei ein guter Mensch — strebe danach, es zu sein, nicht es zu beweisen.', ru: 'Будь хорошим человеком — стремись быть им, а не доказывать это.', fr: "Sois une bonne personne — efforce-toi de l'être, non de le prouver.", es: 'Sé una buena persona — esfuérzate en serlo, no en demostrarlo.' } },
  { id: '107', authorId: 'epictetus', sourceId: 'discourses', theme: 'sabah', text: { tr: 'Her sabah kendine sor: bugün hangi kötü huyumla savaşacağım?', en: 'Ask yourself every morning: which of my bad habits will I fight today?', de: 'Frag dich jeden Morgen: Mit welcher meiner schlechten Gewohnheiten kämpfe ich heute?', ru: 'Каждое утро спрашивай себя: с какой своей дурной привычкой я буду бороться сегодня?', fr: "Demande-toi chaque matin : lequel de mes mauvais penchants vais-je combattre aujourd'hui ?", es: 'Pregúntate cada mañana: ¿contra cuál de mis malos hábitos lucharé hoy?' } },
  // Musonius Rufus
  { id: '108', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Felsefeyi bilmek değil, yaşamak gerekir. Bilgi, alışkanlığa dönünce senin olur.', en: 'Philosophy must not be known but lived. Knowledge becomes yours when it turns into habit.', de: 'Philosophie muss nicht gewusst, sondern gelebt werden. Wissen gehört dir, wenn es zur Gewohnheit wird.', ru: 'Философию нужно не знать, а жить ею. Знание становится твоим, когда превращается в привычку.', fr: "Il faut vivre la philosophie, non la connaître. Le savoir devient tien quand il se transforme en habitude.", es: 'La filosofía hay que vivirla, no solo conocerla. El conocimiento es tuyo cuando se convierte en hábito.' } },
  { id: '109', authorId: 'musonius', sourceId: 'lectures', theme: 'cesaret', text: { tr: 'Zor olanı seç. Kolaylık gevşetir, zorluk güçlendirir.', en: 'Choose the harder path. Ease loosens, difficulty strengthens.', de: 'Wähle das Schwierigere. Leichtigkeit erschlafft, Schwierigkeit stärkt.', ru: 'Выбирай трудное. Лёгкость расслабляет, трудность укрепляет.', fr: "Choisis le plus difficile. La facilité relâche, la difficulté fortifie.", es: 'Elige lo más difícil. La facilidad afloja, la dificultad fortalece.' } },
  { id: '110', authorId: 'musonius', sourceId: 'lectures', theme: 'olum', text: { tr: 'İyi yaşamak, çok yaşamaktan değerlidir.', en: 'To live well is worth more than to live long.', de: 'Gut zu leben ist mehr wert als lange zu leben.', ru: 'Жить хорошо ценнее, чем жить долго.', fr: "Bien vivre vaut plus que vivre longtemps.", es: 'Vivir bien vale más que vivir mucho.' } },
  { id: '111', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Bedenini de terbiye et; erdem yalnız zihinde değil, alışkanlıkta yaşar.', en: 'Discipline your body too; virtue lives not only in the mind but in habit.', de: 'Diszipliniere auch deinen Körper; Tugend lebt nicht nur im Geist, sondern in der Gewohnheit.', ru: 'Дисциплинируй и тело; добродетель живёт не только в уме, но и в привычке.', fr: "Discipline aussi ton corps ; la vertu ne vit pas seulement dans l'esprit, mais dans l'habitude.", es: 'Disciplina también tu cuerpo; la virtud no vive solo en la mente, sino en el hábito.' } },
  { id: '112', authorId: 'musonius', sourceId: 'lectures', theme: 'sadelik', text: { tr: 'Az ile yetinmeyi öğren. İhtiyacın azaldıkça özgürlüğün artar.', en: 'Learn to be content with little. The less you need, the more freedom you have.', de: 'Lerne, dich mit wenig zufriedenzugeben. Je weniger du brauchst, desto größer deine Freiheit.', ru: 'Учись довольствоваться малым. Чем меньше нужно, тем больше свободы.', fr: "Apprends à te contenter de peu. Moins tu as besoin, plus tu es libre.", es: 'Aprende a contentarte con poco. Cuanto menos necesitas, más libertad tienes.' } },
  { id: '113', authorId: 'musonius', sourceId: 'lectures', theme: 'cesaret', text: { tr: 'Acıya dayanmak öğrenilir. Her küçük dayanışma, seni büyütür.', en: 'Enduring pain is learned. Every small act of endurance makes you grow.', de: 'Schmerz zu ertragen wird gelernt. Jedes kleine Ausharren lässt dich wachsen.', ru: 'Терпеть боль — это навык. Каждое маленькое терпение делает тебя больше.', fr: "Supporter la douleur s'apprend. Chaque petite résistance te fait grandir.", es: 'Soportar el dolor se aprende. Cada pequeño acto de resistencia te hace crecer.' } },
  { id: '114', authorId: 'musonius', sourceId: 'lectures', theme: 'sadelik', text: { tr: 'Gerçek süs, giysi değil karakterdir.', en: 'True adornment is character, not clothing.', de: 'Echter Schmuck ist Charakter, nicht Kleidung.', ru: 'Настоящее украшение — характер, а не одежда.', fr: "La vraie parure, c'est le caractère, non le vêtement.", es: 'El verdadero adorno es el carácter, no la ropa.' } },
  { id: '115', authorId: 'musonius', sourceId: 'lectures', theme: 'disiplin', text: { tr: 'Öğrenmek kolay, uygulamak zordur. Değer, zor olandadır.', en: 'Learning is easy, applying is hard. The value lies in what is hard.', de: 'Lernen ist leicht, anwenden ist schwer. Der Wert liegt im Schwierigen.', ru: 'Учиться легко, применять трудно. Ценность — в трудном.', fr: "Apprendre est facile, appliquer est difficile. La valeur est dans ce qui est difficile.", es: 'Aprender es fácil, aplicar es difícil. El valor está en lo difícil.' } },
  { id: '116', authorId: 'musonius', sourceId: 'lectures', theme: 'eylem', text: { tr: 'Herkese adil davran — kazanç için değil, doğru olduğu için.', en: 'Treat everyone fairly — not for gain, but because it is right.', de: 'Behandle jeden fair — nicht des Vorteils wegen, sondern weil es richtig ist.', ru: 'Относись ко всем справедливо — не ради выгоды, а потому что это правильно.', fr: "Traite chacun avec équité — non pour le profit, mais parce que c'est juste.", es: 'Trata a todos con justicia — no por ganancia, sino porque es lo correcto.' } },
  { id: '117', authorId: 'musonius', sourceId: 'lectures', theme: 'ic-huzur', text: { tr: 'Sağlıklı bir ruh, sade bir hayatta yeşerir.', en: 'A healthy soul flourishes in a simple life.', de: 'Eine gesunde Seele gedeiht in einem einfachen Leben.', ru: 'Здоровая душа расцветает в простой жизни.', fr: "Une âme saine s'épanouit dans une vie simple.", es: 'Un alma sana florece en una vida sencilla.' } },
  // Kleanthes
  { id: '118', authorId: 'cleanthes', sourceId: 'hymnZeus', theme: 'kader', text: { tr: 'Kader razı olanı yürütür, direneni sürükler.', en: 'Fate leads the willing and drags the unwilling.', de: 'Das Schicksal führt den Willigen und schleift den Unwilligen.', ru: 'Судьба ведёт согласного и тащит несогласного.', fr: "Le destin conduit celui qui consent et traîne celui qui résiste.", es: 'El destino conduce al que consiente y arrastra al que se resiste.' } },
  { id: '119', authorId: 'cleanthes', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Akışa uy. Evren seni zaten taşıyor — sadece bırak.', en: 'Align with the flow. The universe is already carrying you — just let go.', de: 'Richte dich nach dem Fluss. Das Universum trägt dich bereits — lass einfach los.', ru: 'Следуй течению. Вселенная уже несёт тебя — просто отпусти.', fr: "Accorde-toi au flux. L'univers te porte déjà — laisse-toi simplement aller.", es: 'Síguete al flujo. El universo ya te lleva — simplemente suéltate.' } },
  { id: '120', authorId: 'cleanthes', sourceId: 'fragments', theme: 'cesaret', text: { tr: 'Erdem, güçlü bir ruhun değişmez duruşudur.', en: 'Virtue is the unwavering posture of a strong soul.', de: 'Tugend ist die unveränderliche Haltung einer starken Seele.', ru: 'Добродетель — неизменная позиция сильной души.', fr: "La vertu est la posture invariable d'une âme forte.", es: 'La virtud es la postura inquebrantable de un alma fuerte.' } },
  { id: '121', authorId: 'cleanthes', sourceId: 'fragments', theme: 'disiplin', text: { tr: 'İyiyi seçmek alışkanlık ister. Her gün biraz daha.', en: 'Choosing the good requires habit. A little more each day.', de: 'Das Gute zu wählen erfordert Gewohnheit. Jeden Tag ein bisschen mehr.', ru: 'Выбирать доброе — это привычка. Каждый день чуть больше.', fr: "Choisir le bien requiert de l'habitude. Un peu plus chaque jour.", es: 'Elegir el bien requiere hábito. Un poco más cada día.' } },
  { id: '122', authorId: 'cleanthes', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Düzen her yerde. Kaos sandığın şey, görmediğin uyumdur.', en: 'Order is everywhere. What you think is chaos is a harmony you do not yet see.', de: 'Ordnung ist überall. Was du für Chaos hältst, ist eine Harmonie, die du noch nicht siehst.', ru: 'Порядок везде. То, что ты считаешь хаосом, — это гармония, которую ты не видишь.', fr: "L'ordre est partout. Ce que tu crois être le chaos est une harmonie que tu ne vois pas encore.", es: 'El orden está en todas partes. Lo que crees que es caos es una armonía que aún no ves.' } },
  // Hierokles
  { id: '123', authorId: 'hierocles', sourceId: 'ethicalElements', theme: 'dostluk', text: { tr: 'Önce kendine, sonra yakınına, sonra herkese — şefkat halkalar halinde büyür.', en: 'First to yourself, then to those close to you, then to everyone — compassion grows in rings.', de: 'Zuerst zu dir, dann zum Nächsten, dann zu allen — Mitgefühl wächst in Ringen.', ru: 'Сначала к себе, потом к близким, потом ко всем — сострадание растёт кольцами.', fr: "D'abord à toi-même, ensuite à tes proches, puis à tous — la compassion grandit en cercles.", es: 'Primero a ti mismo, luego a los cercanos, luego a todos — la compasión crece en anillos.' } },
  { id: '124', authorId: 'hierocles', sourceId: 'ethicalElements', theme: 'dostluk', text: { tr: 'Komşunu uzak biri gibi değil, kendinin uzantısı gibi gör.', en: 'See your neighbor not as a stranger, but as an extension of yourself.', de: 'Sieh deinen Nachbarn nicht als Fremden, sondern als Erweiterung deiner selbst.', ru: 'Смотри на соседа не как на чужого, а как на продолжение себя.', fr: "Vois ton prochain non comme un étranger, mais comme une extension de toi-même.", es: 'Ve a tu prójimo no como alguien lejano, sino como una extensión de ti mismo.' } },
  { id: '125', authorId: 'hierocles', sourceId: 'fragments', theme: 'dostluk', text: { tr: 'Aile, erdemin ilk okuludur. Orada öğrenemezsen, dışarıda zor.', en: 'Family is the first school of virtue. If you cannot learn there, it is hard elsewhere.', de: 'Familie ist die erste Schule der Tugend. Wenn du dort nicht lernen kannst, wird es draußen schwer.', ru: 'Семья — первая школа добродетели. Если там не научишься, снаружи трудно.', fr: "La famille est la première école de la vertu. Si tu ne peux y apprendre, c'est difficile ailleurs.", es: 'La familia es la primera escuela de la virtud. Si no puedes aprender allí, fuera es difícil.' } },
  { id: '126', authorId: 'hierocles', sourceId: 'fragments', theme: 'kabul', text: { tr: 'İnsanlık tek beden. Birinin acısı, hepimizin acısıdır.', en: 'Humanity is one body. The pain of one is the pain of all.', de: 'Die Menschheit ist ein einziger Körper. Der Schmerz eines Einzelnen ist der Schmerz aller.', ru: 'Человечество — единое тело. Боль одного — боль всех.', fr: "L'humanité est un seul corps. La douleur de l'un est la douleur de tous.", es: 'La humanidad es un solo cuerpo. El dolor de uno es el dolor de todos.' } },
  { id: '127', authorId: 'hierocles', sourceId: 'fragments', theme: 'eylem', text: { tr: 'Görevini sevgiyle yap. Zorunluluk, gönülle hafifler.', en: 'Do your duty with love. Obligation lightens when done willingly.', de: 'Tu deine Pflicht mit Liebe. Pflicht wird leichter, wenn man sie gern tut.', ru: 'Исполняй свой долг с любовью. Обязанность легчает, когда выполняется охотно.', fr: "Accomplis ton devoir avec amour. L'obligation s'allège quand elle est faite de bon cœur.", es: 'Haz tu deber con amor. La obligación se aligera cuando se hace de buen grado.' } },
  // Zenon (Kıbrıslı)
  { id: '128', authorId: 'zeno', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'İyi akış hâlindeki bir hayat — mutluluk budur, başka değil.', en: 'A life flowing smoothly — that is happiness, nothing else.', de: 'Ein Leben in gleichmäßigem Fluss — das ist Glück, nichts anderes.', ru: 'Жизнь, текущая ровно, — это счастье и ничто иное.', fr: "Une vie qui coule sans heurts — c'est le bonheur, rien d'autre.", es: 'Una vida que fluye sin tropiezos — eso es la felicidad, nada más.' } },
  { id: '129', authorId: 'zeno', sourceId: 'fragments', theme: 'sadelik', text: { tr: 'Doğaya uygun yaşa. Geri kalan gürültüdür.', en: 'Live in accord with nature. Everything else is noise.', de: 'Lebe im Einklang mit der Natur. Der Rest ist Lärm.', ru: 'Живи в согласии с природой. Всё остальное — шум.', fr: "Vis en accord avec la nature. Le reste n'est que bruit.", es: 'Vive conforme a la naturaleza. Lo demás es ruido.' } },
  { id: '130', authorId: 'zeno', sourceId: 'fragments', theme: 'sadelik', text: { tr: 'Az konuş, çok dinle. Doğa bunu kulak ve dille zaten söylüyor.', en: 'Speak little, listen much. Nature says this already through ears and tongue.', de: 'Rede wenig, höre viel. Die Natur sagt dies bereits durch Ohren und Zunge.', ru: 'Говори мало, слушай много. Природа уже говорит это ушами и языком.', fr: "Parle peu, écoute beaucoup. La nature le dit déjà par les oreilles et la langue.", es: 'Habla poco, escucha mucho. La naturaleza ya lo dice con oídos y lengua.' } },
  { id: '131', authorId: 'zeno', sourceId: 'fragments', theme: 'disiplin', text: { tr: 'İki kez düşün, bir kez konuş. Söz, atılan ok gibidir.', en: 'Think twice, speak once. A word is like an arrow once released.', de: 'Denke zweimal, sprich einmal. Ein Wort ist wie ein abgeschossener Pfeil.', ru: 'Подумай дважды, скажи однажды. Слово — как пущенная стрела.', fr: "Réfléchis deux fois, parle une fois. La parole est comme une flèche tirée.", es: 'Piensa dos veces, habla una. La palabra es como una flecha lanzada.' } },
  { id: '132', authorId: 'zeno', sourceId: 'fragments', theme: 'eylem', text: { tr: 'Mutluluk, küçük adımların toplamıdır — ama küçük bir şey değildir.', en: 'Happiness is the sum of small steps — but it is not a small thing.', de: 'Glück ist die Summe kleiner Schritte — aber keine Kleinigkeit.', ru: 'Счастье — это сумма маленьких шагов, но оно не маленькое.', fr: "Le bonheur est la somme de petits pas — mais ce n'est pas une petite chose.", es: 'La felicidad es la suma de pequeños pasos — pero no es algo pequeño.' } },
  // Khrysippos
  { id: '133', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Bilge, talihin her yüzüne hazırdır — gülüşüne de, kaşına da.', en: 'The wise person is ready for every face of fortune — its smile and its frown.', de: 'Der Weise ist auf jedes Gesicht des Schicksals vorbereitet — auf sein Lächeln wie auf sein Stirnrunzeln.', ru: 'Мудрец готов к любому лицу судьбы — и к улыбке, и к хмурости.', fr: "Le sage est prêt à chaque visage de la fortune — son sourire comme son froncement de sourcils.", es: 'El sabio está preparado para cada cara de la fortuna — su sonrisa y su ceño.' } },
  { id: '134', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kontrol', text: { tr: 'Mantığını yitirme. Duygu fırtınadır; akıl, dümendir.', en: 'Do not lose your reason. Emotion is the storm; reason is the helm.', de: 'Verliere deine Vernunft nicht. Gefühl ist der Sturm; Vernunft das Steuer.', ru: 'Не теряй разума. Чувство — это буря; разум — руль.', fr: "Ne perds pas ta raison. L'émotion est la tempête ; la raison, le gouvernail.", es: 'No pierdas la razón. La emoción es la tormenta; la razón, el timón.' } },
  { id: '135', authorId: 'chrysippus', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'Erdem yeter. Mutluluk için fazlasına ihtiyacın yok.', en: 'Virtue is enough. You need nothing more for happiness.', de: 'Tugend genügt. Du brauchst nichts mehr für Glück.', ru: 'Добродетели достаточно. Для счастья тебе больше ничего не нужно.', fr: "La vertu suffit. Tu n'as besoin de rien de plus pour le bonheur.", es: 'La virtud es suficiente. No necesitas nada más para la felicidad.' } },
  { id: '136', authorId: 'chrysippus', sourceId: 'fragments', theme: 'kader', text: { tr: 'Evrende tesadüf yok. Her şey bir nedenin çocuğu.', en: 'There is no chance in the universe. Everything is the child of a cause.', de: 'Im Universum gibt es keinen Zufall. Alles ist das Kind einer Ursache.', ru: 'В вселенной нет случайности. Всё — дитя причины.', fr: "Il n'y a pas de hasard dans l'univers. Tout est l'enfant d'une cause.", es: 'No hay azar en el universo. Todo es hijo de una causa.' } },
  // Cato (Genç) — md#102 "Doğru olanı yap..." mevcut id34 ile aynı → eklenmedi
  { id: '137', authorId: 'cato', sourceId: 'attributed', theme: 'cesaret', text: { tr: 'Eğilmektense kırılmayı seç — ama gereksiz yere değil.', en: 'Choose to break rather than to bend — but not needlessly.', de: 'Wähle es zu brechen statt zu biegen — aber nicht unnötig.', ru: 'Выбирай сломаться, но не согнуться — но не без нужды.', fr: "Choisis de te briser plutôt que de plier — mais pas inutilement.", es: 'Elige quebrarte antes que doblarte — pero no innecesariamente.' } },
  { id: '138', authorId: 'cato', sourceId: 'attributed', theme: 'cesaret', text: { tr: 'Bir insanın değeri, baskı altında ne yaptığıyla ölçülür.', en: "A person's worth is measured by what they do under pressure.", de: 'Der Wert eines Menschen wird daran gemessen, was er unter Druck tut.', ru: 'Ценность человека измеряется тем, что он делает под давлением.', fr: "La valeur d'un être humain se mesure à ce qu'il fait sous pression.", es: 'El valor de una persona se mide por lo que hace bajo presión.' } },
  // Posidonius
  { id: '139', authorId: 'posidonius', sourceId: 'fragments', theme: 'kabul', text: { tr: 'Evreni anla, kendini anlarsın. İkisi aynı dokunun parçası.', en: 'Understand the universe and you understand yourself. Both are part of the same fabric.', de: 'Verstehe das Universum, und du wirst dich selbst verstehen. Beide sind Teil desselben Geflechts.', ru: 'Пойми вселенную — поймёшь себя. Оба — часть одной ткани.', fr: "Comprends l'univers et tu te comprendras toi-même. Les deux font partie du même tissu.", es: 'Comprende el universo y te comprenderás a ti mismo. Ambos son parte del mismo tejido.' } },
  { id: '140', authorId: 'posidonius', sourceId: 'fragments', theme: 'ic-huzur', text: { tr: 'Bilgi, ruhu hastalıktan arındıran tek ilaçtır.', en: 'Knowledge is the only medicine that purifies the soul of sickness.', de: 'Wissen ist das einzige Heilmittel, das die Seele von Krankheit reinigt.', ru: 'Знание — единственное лекарство, очищающее душу от болезни.', fr: "Le savoir est le seul remède qui purifie l'âme de la maladie.", es: 'El conocimiento es el único remedio que purifica el alma de la enfermedad.' } },
  { id: '141', authorId: 'posidonius', sourceId: 'fragments', theme: 'kontrol', text: { tr: 'Tutkular bedenden doğar; akılla terbiye edilir.', en: 'Passions are born from the body; they are tamed by reason.', de: 'Leidenschaften entstehen im Körper; sie werden durch Vernunft gezähmt.', ru: 'Страсти рождаются из тела; разумом они укрощаются.', fr: "Les passions naissent du corps ; elles sont domptées par la raison.", es: 'Las pasiones nacen del cuerpo; son domadas por la razón.' } },
  // Stoacı Gelenek — genel miras
  { id: '142', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Sakinlik bir kaçış değil, seçilmiş bir duruştur.', en: 'Calm is not an escape but a chosen stance.', de: 'Ruhe ist keine Flucht, sondern eine gewählte Haltung.', ru: 'Спокойствие — не бегство, а выбранная позиция.', fr: "Le calme n'est pas une fuite, mais une posture choisie.", es: 'La calma no es una huida, sino una postura elegida.' } },
  { id: '143', authorId: 'tradition', sourceId: 'tradition', theme: 'kontrol', text: { tr: 'Fırtınayı durduramazsın ama yelkenini ayarlayabilirsin.', en: 'You cannot stop the storm, but you can adjust your sail.', de: 'Du kannst den Sturm nicht aufhalten, aber du kannst dein Segel richten.', ru: 'Ты не можешь остановить бурю, но можешь настроить парус.', fr: "Tu ne peux pas arrêter la tempête, mais tu peux ajuster ta voile.", es: 'No puedes detener la tormenta, pero puedes ajustar tu vela.' } },
  { id: '144', authorId: 'tradition', sourceId: 'tradition', theme: 'sadelik', text: { tr: 'Az şeye ihtiyaç duyan, hür adama en yakın olandır.', en: 'The one who needs little is closest to a free person.', de: 'Wer wenig braucht, steht dem freien Menschen am nächsten.', ru: 'Тот, кто нуждается в малом, ближе всего к свободному человеку.', fr: "Celui qui a besoin de peu est le plus proche d'un homme libre.", es: 'Quien necesita poco es quien más se acerca a un hombre libre.' } },
  { id: '145', authorId: 'tradition', sourceId: 'tradition', theme: 'zaman', text: { tr: 'Bugün için yaşa — ama yarını da hor görme.', en: 'Live for today — but do not despise tomorrow either.', de: 'Lebe für heute — aber verachte auch das Morgen nicht.', ru: 'Живи сегодняшним — но и завтра не презирай.', fr: "Vis pour aujourd'hui — mais ne méprise pas non plus le lendemain.", es: 'Vive para hoy — pero no desprecies tampoco el mañana.' } },
  { id: '146', authorId: 'tradition', sourceId: 'tradition', theme: 'kaygi', text: { tr: 'Kontrol edemediğin şeye harcadığın endişe, çalınan zamandır.', en: 'The worry you spend on what you cannot control is stolen time.', de: 'Die Sorge, die du auf das Unkontrollierbare verwendest, ist gestohlene Zeit.', ru: 'Беспокойство, которое ты тратишь на то, что не можешь контролировать, — украденное время.', fr: "L'inquiétude que tu consacres à ce que tu ne peux contrôler est du temps volé.", es: 'La preocupación que gastas en lo que no puedes controlar es tiempo robado.' } },
  { id: '147', authorId: 'tradition', sourceId: 'tradition', theme: 'yas', text: { tr: 'Yas, sevginin gölgesidir. Gölgeye değil, ışığa bak.', en: 'Grief is the shadow of love. Look not at the shadow but at the light.', de: 'Trauer ist der Schatten der Liebe. Schau nicht auf den Schatten, sondern auf das Licht.', ru: 'Горе — тень любви. Смотри не на тень, а на свет.', fr: "Le deuil est l'ombre de l'amour. Regarde non l'ombre, mais la lumière.", es: 'El duelo es la sombra del amor. Mira no la sombra, sino la luz.' } },
  { id: '148', authorId: 'tradition', sourceId: 'tradition', theme: 'cesaret', text: { tr: 'Cesaret korkusuzluk değil, korkuya rağmen yürümektir.', en: 'Courage is not the absence of fear, but walking despite it.', de: 'Mut ist nicht Furchtlosigkeit, sondern das Gehen trotz der Furcht.', ru: 'Мужество — не отсутствие страха, а движение вперёд вопреки ему.', fr: "Le courage n'est pas l'absence de peur, mais d'avancer malgré elle.", es: 'El valor no es la ausencia de miedo, sino caminar a pesar de él.' } },
  { id: '149', authorId: 'tradition', sourceId: 'tradition', theme: 'sukran', text: { tr: 'Şükran, sahip olduğunu iki kez yaşamaktır.', en: 'Gratitude is living what you have twice over.', de: 'Dankbarkeit bedeutet, das, was man hat, zweimal zu erleben.', ru: 'Благодарность — это дважды прожить то, что имеешь.', fr: "La gratitude, c'est vivre deux fois ce que l'on a.", es: 'La gratitud es vivir dos veces lo que tienes.' } },
  // Karma — günlük ritim & pratik
  { id: '150', authorId: 'tradition', sourceId: 'tradition', theme: 'sabah', text: { tr: 'Sabah niyetini kur, akşam gününü tart. Arada sadece yürü.', en: 'Set your intention in the morning, weigh your day in the evening. In between, just walk.', de: 'Setze morgens deinen Vorsatz, wiege abends deinen Tag. Dazwischen gehe einfach.', ru: 'Утром поставь намерение, вечером взвесь день. Между ними — просто иди.', fr: "Pose ton intention le matin, pèse ta journée le soir. Entre les deux, marche simplement.", es: 'Establece tu intención por la mañana, sopesa el día por la noche. En medio, simplemente camina.' } },
  { id: '151', authorId: 'tradition', sourceId: 'tradition', theme: 'kontrol', text: { tr: 'Bugün kontrolünde olan tek şey: bir sonraki seçimin.', en: 'The only thing in your control today: your next choice.', de: 'Das Einzige, was heute in deiner Macht liegt: deine nächste Entscheidung.', ru: 'Единственное, что сегодня в твоей власти: твой следующий выбор.', fr: "La seule chose en ton pouvoir aujourd'hui : ton prochain choix.", es: 'Lo único en tu poder hoy: tu próxima elección.' } },
  { id: '152', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Acele bir karar, yavaş bir pişmanlıktır.', en: 'A hasty decision is a slow regret.', de: 'Eine hastige Entscheidung ist eine langsame Reue.', ru: 'Поспешное решение — медленное сожаление.', fr: "Une décision hâtive est un lent regret.", es: 'Una decisión apresurada es un arrepentimiento lento.' } },
  { id: '153', authorId: 'tradition', sourceId: 'tradition', theme: 'kaygi', text: { tr: 'Kötü haber geldiğinde sor: bu gerçekten benim elimde mi?', en: 'When bad news comes, ask: is this truly in my hands?', de: 'Wenn schlechte Nachrichten kommen, frage: Liegt das wirklich in meinen Händen?', ru: 'Когда приходят плохие новости, спроси: действительно ли это в моих руках?', fr: "Quand une mauvaise nouvelle arrive, demande : est-ce vraiment entre mes mains ?", es: 'Cuando lleguen malas noticias, pregunta: ¿está esto realmente en mis manos?' } },
  { id: '154', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Nefes al. Bu an, sahip olduğun tek gerçek.', en: 'Breathe. This moment is the only reality you have.', de: 'Atme. Dieser Augenblick ist die einzige Wirklichkeit, die du besitzt.', ru: 'Дыши. Этот миг — единственная реальность, которая у тебя есть.', fr: "Respire. Cet instant est la seule réalité que tu possèdes.", es: 'Respira. Este momento es la única realidad que tienes.' } },
  { id: '155', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Karşılaştırma hırsızdır — huzurunu çalar. Kendi yoluna bak.', en: 'Comparison is a thief — it steals your peace. Look at your own path.', de: 'Vergleich ist ein Dieb — er stiehlt deinen Frieden. Schau auf deinen eigenen Weg.', ru: 'Сравнение — вор: оно крадёт твой покой. Смотри на свой путь.', fr: "La comparaison est un voleur — elle te dérobe la paix. Regarde ton propre chemin.", es: 'La comparación es un ladrón — roba tu paz. Mira tu propio camino.' } },
  { id: '156', authorId: 'tradition', sourceId: 'tradition', theme: 'kabul', text: { tr: 'Bir şeyi değiştiremiyorsan, ona karşı tutumunu değiştir.', en: 'If you cannot change something, change your attitude toward it.', de: 'Wenn du etwas nicht ändern kannst, ändere deine Einstellung dazu.', ru: 'Если не можешь что-то изменить, измени своё отношение к этому.', fr: "Si tu ne peux pas changer quelque chose, change ton attitude envers cela.", es: 'Si no puedes cambiar algo, cambia tu actitud hacia ello.' } },
  { id: '157', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Akşam üç soru: Ne iyi yaptım? Nerede yanıldım? Yarın nasıl daha iyi?', en: 'Three questions at evening: What did I do well? Where did I go wrong? How to be better tomorrow?', de: 'Drei Fragen am Abend: Was habe ich gut gemacht? Wo habe ich geirrt? Wie besser sein morgen?', ru: 'Три вопроса вечером: что я сделал хорошо? Где ошибся? Как быть лучше завтра?', fr: "Trois questions le soir : Qu'ai-je bien fait ? Où me suis-je trompé ? Comment être meilleur demain ?", es: 'Tres preguntas al anochecer: ¿Qué hice bien? ¿Dónde me equivoqué? ¿Cómo ser mejor mañana?' } },
  { id: '158', authorId: 'tradition', sourceId: 'tradition', theme: 'ic-huzur', text: { tr: 'Övgüye de yergiye de aynı sükûnetle bak. İkisi de geçer.', en: 'Look at praise and blame with the same equanimity. Both shall pass.', de: 'Betrachte Lob und Tadel mit derselben Gelassenheit. Beides geht vorüber.', ru: 'Смотри на похвалу и хулу с одним и тем же спокойствием. Оба пройдут.', fr: "Regarde l'éloge et le blâme avec la même équanimité. Les deux passent.", es: 'Mira el elogio y la crítica con la misma ecuanimidad. Ambos pasan.' } },
  { id: '159', authorId: 'tradition', sourceId: 'tradition', theme: 'sukran', text: { tr: 'Sahip olduğunu bir an için kaybettiğini düşün — sonra geri kazandığını. İşte şükran.', en: 'Imagine for a moment that you have lost what you have — then that you got it back. That is gratitude.', de: 'Stell dir für einen Moment vor, du hättest verloren, was du hast — dann, dass du es zurückgewonnen hast. Das ist Dankbarkeit.', ru: 'Представь на миг, что потерял то, что имеешь, — а потом снова обрёл. Вот это и есть благодарность.', fr: "Imagine un instant que tu as perdu ce que tu possèdes — puis que tu l'as récupéré. Voilà la gratitude.", es: 'Imagina por un momento que has perdido lo que tienes — luego que lo has recuperado. Eso es la gratitud.' } },
  { id: '160', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Mükemmel olmaya değil, biraz daha iyi olmaya çalış.', en: 'Strive not to be perfect, but to be a little better.', de: 'Strebe nicht nach Vollkommenheit, sondern danach, ein wenig besser zu sein.', ru: 'Стремись не к совершенству, а к тому, чтобы стать чуть лучше.', fr: "Ne cherche pas à être parfait, mais à être un peu meilleur.", es: 'No te esfuerces por ser perfecto, sino por ser un poco mejor.' } },
  { id: '161', authorId: 'tradition', sourceId: 'tradition', theme: 'ofke', text: { tr: 'Öfke yükseldiğinde, on say. Sayarken çoğu öfke düşer.', en: 'When anger rises, count to ten. Most anger falls while you count.', de: 'Wenn Zorn aufsteigt, zähle bis zehn. Die meiste Wut vergeht beim Zählen.', ru: 'Когда поднимается гнев, сосчитай до десяти. Большинство гнева проходит, пока считаешь.', fr: "Quand la colère monte, compte jusqu'à dix. La plupart de la colère retombe pendant que tu comptes.", es: 'Cuando la ira sube, cuenta hasta diez. La mayoría de la ira cae mientras cuentas.' } },
  { id: '162', authorId: 'tradition', sourceId: 'tradition', theme: 'zaman', text: { tr: 'Geçmişe takılma, geleceğe kaçma. Hayat tam buradadır.', en: 'Do not dwell on the past, do not flee to the future. Life is right here.', de: 'Hänge nicht an der Vergangenheit fest, fliehe nicht in die Zukunft. Das Leben ist genau hier.', ru: 'Не застревай в прошлом, не беги в будущее. Жизнь прямо здесь.', fr: "Ne t'accroche pas au passé, ne fuis pas vers l'avenir. La vie est juste ici.", es: 'No te aferres al pasado, no huyas al futuro. La vida está justo aquí.' } },
  { id: '163', authorId: 'tradition', sourceId: 'tradition', theme: 'eylem', text: { tr: 'Yapabileceğinin en iyisini yap, gerisini sakince bırak.', en: 'Do the best you can, and calmly leave the rest.', de: 'Tu das Beste, was du kannst, und lass den Rest gelassen los.', ru: 'Делай всё, что в твоих силах, и спокойно отпускай остальное.', fr: "Fais de ton mieux et laisse le reste calmement.", es: 'Haz lo mejor que puedas y suelta el resto con calma.' } },
  { id: '164', authorId: 'tradition', sourceId: 'tradition', theme: 'disiplin', text: { tr: 'Her gün küçük bir zafer: söz verdiğin şeyi yapmak.', en: 'Every day a small victory: doing what you promised yourself.', de: 'Jeden Tag ein kleiner Sieg: tun, was du dir versprochen hast.', ru: 'Каждый день маленькая победа: делать то, что обещал себе.', fr: "Chaque jour une petite victoire : faire ce qu'on s'est promis.", es: 'Cada día una pequeña victoria: hacer lo que te prometiste.' } },
];

export interface Quote { id: string; authorId: string; text: string; author: string; source: string; theme?: string; }

export function getQuotes(lang: Lang): Quote[] {
  return QUOTES_RAW.map((q) => ({
    id: q.id,
    authorId: q.authorId,
    text: pick(q.text, lang),
    author: authorName(q.authorId, lang),
    source: sourceName(q.sourceId, lang),
    theme: q.theme,
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

// ─── Filozoflar (Bilgelik > "Filozoflar" sekmesi) ─────────
// id'ler AUTHORS ile aynı → alıntıdaki yazar adına dokununca kart açılır.
// İçerik TR; diğer diller eksikse pick() TR'ye düşer (sonra çevrilecek).
// name AUTHORS'tan türer (zaten 6 dilli). Sembol: sade monogram harf.
interface RawPhilosopher { id: string; symbol: string; color: string; era: L; oneLiner: L; story: L; contribution: L; }

const PHILOSOPHERS_RAW: RawPhilosopher[] = [
  {
    id: 'marcus', symbol: 'M', color: 'rgba(212,146,74,0.13)',
    era: { tr: 'MS 121–180 · Roma İmparatoru', en: 'AD 121–180 · Roman Emperor', de: 'n. Chr. 121–180 · Römischer Kaiser', ru: '121–180 н. э. · Римский император', fr: '121–180 apr. J.-C. · Empereur romain', es: '121–180 d. C. · Emperador romano' },
    oneLiner: { tr: 'Dünyanın en güçlü adamıyken, geceleri kendine alçakgönüllülük notları tuttu.', en: 'The most powerful man in the world, who wrote himself notes on humility at night.', de: 'Der mächtigste Mann der Welt, der sich nachts Notizen über Demut schrieb.', ru: 'Самый могущественный человек в мире, который ночью писал себе заметки о смирении.', fr: "L'homme le plus puissant du monde, qui s'écrivait des notes sur l'humilité la nuit.", es: 'El hombre más poderoso del mundo, que se escribía notas sobre la humildad por la noche.' },
    story: { tr: 'Tarihin en güçlü adamlarından biriydi — Roma İmparatoru, o çağda bilinen dünyanın yarısının hükümdarı. Ama geceleri, savaş çadırında kendine notlar tutuyordu: nasıl daha sabırlı, daha adil, daha az öfkeli olabileceğine dair. Bu notları kimsenin okumasını istememişti; sadece kendine yazıyordu. Ölümünden sonra bulunan o defter, bugün Meditationes (Düşünceler) adıyla felsefenin en sevilen eserlerinden biri oldu.', en: 'He was one of the most powerful men in history — the Roman Emperor, ruler of half the known world. Yet at night, in a campaign tent, he kept private notes for himself: on how to be more patient, more just, less angry. He never intended anyone to read them; he wrote only for himself. That notebook, found after his death, became one of the most beloved works in philosophy, known today as the Meditations.', de: 'Er war einer der mächtigsten Männer der Geschichte — der Römische Kaiser, Herrscher über die Hälfte der bekannten Welt. Doch nachts, im Feldzeltlager, schrieb er sich private Notizen: wie er geduldiger, gerechter und weniger zornig sein könnte. Niemanden sollte er lesen — er schrieb nur für sich. Dieses Notizbuch, nach seinem Tod gefunden, wurde eines der geliebtesten Werke der Philosophie, bekannt als die Meditationen.', ru: 'Он был одним из самых могущественных людей в истории — Римский Император, правитель половины известного мира. Но ночью, в походной палатке, он вёл личные записи для себя: как стать терпеливее, справедливее, менее гневным. Он никогда не предназначал их для чужих глаз — писал только для себя. Эта тетрадь, найденная после его смерти, стала одним из самых любимых философских произведений, известных сегодня как «Размышления».', fr: "Il était l'un des hommes les plus puissants de l'histoire — l'Empereur romain, souverain de la moitié du monde connu. Pourtant la nuit, dans une tente de campagne, il tenait des notes privées pour lui-même : comment être plus patient, plus juste, moins en colère. Il n'avait jamais eu l'intention que quiconque les lise ; il n'écrivait que pour lui. Ce carnet, retrouvé après sa mort, est devenu l'une des œuvres philosophiques les plus aimées, connue aujourd'hui sous le nom de Pensées pour moi-même.", es: 'Era uno de los hombres más poderosos de la historia — el Emperador romano, gobernante de la mitad del mundo conocido. Sin embargo, por la noche, en una tienda de campaña, llevaba notas privadas para sí mismo: sobre cómo ser más paciente, más justo, menos iracundo. Nunca pretendió que nadie las leyera; escribía solo para sí. Ese cuaderno, hallado tras su muerte, se convirtió en una de las obras más amadas de la filosofía, conocida hoy como las Meditaciones.' },
    contribution: { tr: 'Gücün ve servetin insanı mutlu etmediğini, asıl işin kendi karakterini terbiye etmek olduğunu — hem de bunu söyleyebilecek son kişi olan bir imparatorun ağzından — gösterdi.', en: 'He showed that power and wealth do not make a person happy, and that the real work is to discipline one\'s own character — and he showed it as an emperor, the last person you would expect to say such things.', de: 'Er zeigte, dass Macht und Reichtum den Menschen nicht glücklich machen, und dass die eigentliche Arbeit darin besteht, den eigenen Charakter zu disziplinieren — und das sagte er als Kaiser, der letzte, den man so etwas erwarten würde.', ru: 'Он показал, что власть и богатство не делают человека счастливым, и что настоящая работа — дисциплинировать собственный характер. И показал это как Император — последний человек, от которого ожидаешь подобных слов.', fr: "Il a montré que le pouvoir et la richesse ne rendent pas l'homme heureux, et que le vrai travail est de discipliner son propre caractère — et il l'a montré en tant qu'empereur, la dernière personne dont on attendrait de tels propos.", es: 'Demostró que el poder y la riqueza no hacen feliz a una persona, y que el verdadero trabajo es disciplinar el propio carácter — y lo hizo siendo emperador, la última persona de quien se esperaría tal cosa.' },
  },
  {
    id: 'epictetus', symbol: 'E', color: 'rgba(159,176,196,0.12)',
    era: { tr: 'MS 50–135 · Köle doğdu, özgür bir bilge oldu', en: 'AD 50–135 · Born a slave, became a free sage', de: 'n. Chr. 50–135 · Als Sklave geboren, wurde ein freier Weiser', ru: '50–135 н. э. · Родился рабом, стал свободным мудрецом', fr: '50–135 apr. J.-C. · Né esclave, devenu sage libre', es: '50–135 d. C. · Nacido esclavo, se convirtió en sabio libre' },
    oneLiner: { tr: 'Bir köleydi; ama özgürlüğün zincirlerle değil, zihinle ilgili olduğunu öğretti.', en: 'A slave who taught that freedom is a matter of the mind, not of chains.', de: 'Ein Sklave, der lehrte, dass Freiheit eine Frage des Geistes ist, nicht der Ketten.', ru: 'Раб, который учил, что свобода — дело ума, а не цепей.', fr: "Un esclave qui enseigna que la liberté est une affaire d'esprit, non de chaînes.", es: 'Un esclavo que enseñó que la libertad es cuestión de mente, no de cadenas.' },
    story: { tr: 'Marcus Aurelius dünyanın en güçlü adamıyken, Epiktetos köle olarak doğdu. Bir efendinin malıydı; rivayete göre efendisi bacağını kırdığında sakin sakin "kırılacağını söylemiştim" demişti. Sonradan özgürlüğüne kavuştu ve bir okul kurdu. Hiçbir şey yazmadı — bildiğimiz her şeyi öğrencisi not aldı. Ona göre özgürlük, zincirlerin olmaması değil, kimsenin elinden alamayacağı tek şeyin — kendi zihnin ve seçimlerin — farkında olmaktı.', en: 'While Marcus Aurelius was the most powerful man in the world, Epictetus was born a slave. He was the property of a master; when his master broke his leg, legend says he calmly remarked, "I told you it would break." He later gained his freedom and founded a school. He wrote nothing — everything we know was recorded by his student. For him, freedom was not the absence of chains but the awareness of the one thing no one can take from you: your own mind and choices.', de: 'Während Marcus Aurelius der mächtigste Mann der Welt war, wurde Epiktet als Sklave geboren. Er war das Eigentum eines Herrn; als dieser sein Bein brach, soll er ruhig gesagt haben: „Ich sagte dir, es würde brechen." Später gewann er seine Freiheit und gründete eine Schule. Er schrieb nichts — alles, was wir wissen, wurde von seinem Schüler aufgezeichnet. Für ihn war Freiheit nicht das Fehlen von Ketten, sondern das Bewusstsein für das Einzige, das niemand einem nehmen kann: den eigenen Geist und die eigenen Entscheidungen.', ru: 'Пока Марк Аврелий был самым могущественным человеком в мире, Эпиктет родился рабом. Он был собственностью хозяина; когда тот сломал ему ногу, по преданию, Эпиктет спокойно заметил: «Я говорил тебе, что она сломается». Впоследствии он обрёл свободу и основал школу. Он ничего не писал — всё, что мы знаем, было записано его учеником. Для него свобода — не отсутствие цепей, а осознание единственного, чего никто не может у тебя отнять: собственного ума и выборов.', fr: "Tandis que Marc Aurèle était l'homme le plus puissant du monde, Épictète est né esclave. Il était la propriété d'un maître ; quand celui-ci lui brisa la jambe, la légende dit qu'il remarqua calmement : « Je t'avais dit qu'elle se briserait. » Il obtint plus tard sa liberté et fonda une école. Il n'écrivit rien — tout ce que nous savons fut consigné par son élève. Pour lui, la liberté n'était pas l'absence de chaînes, mais la conscience de la seule chose que personne ne peut vous prendre : votre propre esprit et vos choix.", es: 'Mientras Marco Aurelio era el hombre más poderoso del mundo, Epicteto nació esclavo. Era propiedad de un amo; cuando este le rompió la pierna, cuenta la leyenda que respondió con calma: "Te dije que se rompería." Más tarde obtuvo su libertad y fundó una escuela. No escribió nada — todo lo que sabemos lo anotó su alumno. Para él, la libertad no era la ausencia de cadenas, sino la conciencia de lo único que nadie puede arrebatarte: tu propia mente y tus elecciones.' },
    contribution: { tr: 'Kontrol ikilemini — "bazı şeyler bize bağlıdır, bazıları değil" — felsefenin kalbine yerleştirdi. Bir kölenin özgürlüğü herkesten iyi anlatması ise başlı başına bir derstir.', en: 'He placed the dichotomy of control — "some things depend on us, some do not" — at the heart of philosophy. And the fact that a slave could explain freedom better than anyone else is itself a lesson.', de: 'Er stellte die Dichotomie der Kontrolle — „Einiges hängt von uns ab, anderes nicht" — ins Herz der Philosophie. Und dass ein Sklave Freiheit besser erklären konnte als jeder andere, ist selbst eine Lektion.', ru: 'Он поставил дихотомию контроля — «одно зависит от нас, другое нет» — в сердце философии. А то, что раб мог объяснить свободу лучше, чем кто-либо другой, само по себе является уроком.', fr: "Il a placé la dichotomie du contrôle — « certaines choses dépendent de nous, d'autres non » — au cœur de la philosophie. Et le fait qu'un esclave ait pu expliquer la liberté mieux que quiconque est lui-même une leçon.", es: 'Colocó la dicotomía del control — «algunas cosas dependen de nosotros, otras no» — en el corazón de la filosofía. Y el hecho de que un esclavo pudiera explicar la libertad mejor que nadie es en sí mismo una lección.' },
  },
  {
    id: 'seneca', symbol: 'S', color: 'rgba(196,169,106,0.13)',
    era: { tr: 'MÖ 4 – MS 65 · Devlet adamı, yazar, sürgün', en: '4 BC – AD 65 · Statesman, writer, exile', de: '4 v. Chr. – 65 n. Chr. · Staatsmann, Schriftsteller, Verbannter', ru: '4 до н. э. – 65 н. э. · Государственный деятель, писатель, изгнанник', fr: '4 av. J.-C. – 65 apr. J.-C. · Homme d\'État, écrivain, exilé', es: '4 a. C. – 65 d. C. · Estadista, escritor, exiliado' },
    oneLiner: { tr: 'Hem çok zengin hem çok eleştirilen bir adamdı; servet ile erdem arasındaki gerilimi yaşadı.', en: 'Both very rich and much criticized; he lived the tension between wealth and virtue.', de: 'Zugleich sehr reich und viel kritisiert; er lebte die Spannung zwischen Reichtum und Tugend.', ru: 'Очень богатый и много критикуемый; он жил в напряжении между богатством и добродетелью.', fr: 'À la fois très riche et très critiqué ; il vécut la tension entre richesse et vertu.', es: 'Muy rico y muy criticado a la vez; vivió la tensión entre riqueza y virtud.' },
    story: { tr: 'Romalı bir devlet adamı ve dönemin en ünlü yazarıydı. Bir süre sürgüne gönderildi, sonra geri çağrılıp imparator Nero\'nun danışmanı oldu — tehlikeli bir görev. Çok zengindi ve bu yüzden "yoksulluğu öv ama saraylarda yaşa" diye eleştirildi. Kendisi de bu çelişkinin farkındaydı; "bilge değilim, iyileşmeye çalışan bir hastayım" derdi. Sonunda Nero ondan ölmesini istedi ve o, sakince kendi sonunu karşıladı.', en: "He was a Roman statesman and the most celebrated writer of his age. He was sent into exile for a time, then recalled to become the advisor of Emperor Nero — a dangerous post. He was enormously wealthy and was criticized for it: 'You praise poverty but live in palaces.' He was aware of the contradiction himself; he would say, 'I am not a sage, I am a patient trying to recover.' In the end Nero ordered his death and he met it calmly.", de: 'Er war ein römischer Staatsmann und der berühmteste Schriftsteller seiner Zeit. Er wurde eine Zeit lang verbannt, dann zurückgerufen und wurde Berater von Kaiser Nero — ein gefährlicher Posten. Er war sehr wohlhabend und wurde deshalb kritisiert: „Du lobst die Armut, aber lebst in Palästen." Er war sich des Widerspruchs selbst bewusst; er pflegte zu sagen: „Ich bin kein Weiser, ich bin ein Patient, der zu genesen versucht." Am Ende beorderte Nero seinen Tod und er begegnete ihm ruhig.', ru: 'Он был римским государственным деятелем и самым известным писателем своего времени. Его отправили в изгнание, затем вернули и назначили советником императора Нерона — опасная должность. Он был очень богат, и за это его критиковали: «Ты хвалишь бедность, но живёшь во дворцах». Он сам осознавал это противоречие; он говорил: «Я не мудрец, я больной, который пытается выздороветь». В конце концов Нерон приказал ему умереть, и он встретил смерть спокойно.', fr: "Il était un homme d'État romain et l'écrivain le plus célèbre de son époque. Il fut envoyé en exil pendant un temps, puis rappelé pour devenir conseiller de l'empereur Néron — un poste dangereux. Il était très riche et critiqué pour cela : « Tu loues la pauvreté mais tu vis dans des palais. » Il était lui-même conscient de la contradiction ; il disait : « Je ne suis pas un sage, je suis un malade qui essaie de guérir. » À la fin, Néron lui ordonna de mourir et il y fit face calmement.", es: "Era un estadista romano y el escritor más célebre de su época. Fue enviado al exilio durante un tiempo, luego llamado de vuelta para convertirse en consejero del emperador Nerón — un puesto peligroso. Era enormemente rico y fue criticado por ello: «Elogias la pobreza pero vives en palacios». Él mismo era consciente de la contradicción; solía decir: «No soy un sabio, soy un paciente que intenta recuperarse». Al final Nerón le ordenó morir y él lo afrontó con calma." },
    contribution: { tr: 'Stoacılığı soyut bir teoriden günlük hayata indirdi. Zaman, öfke, kayıp ve ölüm üzerine yazdığı mektuplar, felsefenin en pratik, en insani metinleridir.', en: 'He brought Stoicism down from abstract theory into daily life. His letters on time, anger, loss and death are among the most practical and most human texts in all of philosophy.', de: 'Er brachte den Stoizismus von der abstrakten Theorie in den Alltag. Seine Briefe über Zeit, Zorn, Verlust und Tod gehören zu den praktischsten und menschlichsten Texten der gesamten Philosophie.', ru: 'Он перевёл стоицизм из абстрактной теории в повседневную жизнь. Его письма о времени, гневе, потере и смерти — одни из самых практичных и человечных текстов во всей философии.', fr: "Il fit descendre le stoïcisme de la théorie abstraite dans la vie quotidienne. Ses lettres sur le temps, la colère, la perte et la mort comptent parmi les textes les plus pratiques et les plus humains de toute la philosophie.", es: 'Llevó el estoicismo de la teoría abstracta a la vida cotidiana. Sus cartas sobre el tiempo, la ira, la pérdida y la muerte se cuentan entre los textos más prácticos y más humanos de toda la filosofía.' },
  },
  {
    id: 'musonius', symbol: 'R', color: 'rgba(184,150,120,0.12)',
    era: { tr: 'MS ~30–100 · "Romalı Sokrates"', en: 'c. AD 30–100 · "The Roman Socrates"', de: 'ca. 30–100 n. Chr. · „Der römische Sokrates"', ru: 'ок. 30–100 н. э. · «Римский Сократ»', fr: 'v. 30–100 apr. J.-C. · « Le Socrate romain »', es: 'c. 30–100 d. C. · «El Sócrates romano»' },
    oneLiner: { tr: 'Felsefe konuşulmaz, yaşanır dedi — ve sürgünde bile öğretmeye devam etti.', en: 'He said philosophy is lived, not spoken — and taught even in exile.', de: 'Er sagte, Philosophie werde gelebt, nicht gesprochen — und lehrte sogar im Exil.', ru: 'Он говорил, что философию живут, а не произносят, — и учил даже в изгнании.', fr: "Il disait que la philosophie se vit et ne se dit pas — et enseigna même en exil.", es: 'Dijo que la filosofía se vive, no se habla — y enseñó incluso en el exilio.' },
    story: { tr: 'Epiktetos\'un hocasıydı. Döneminde o kadar saygındı ki "Romalı Sokrates" denirdi. Siyasi sürgünlere gönderildi ama bunu bile bir ders fırsatı saydı — çorak bir adada öğretmeye devam etti. Felsefenin laf değil eylem olduğunda ısrar etti; kadınların da erkekler kadar felsefe öğrenmesi gerektiğini savunması, çağına göre cesur bir duruştu.', en: "He was the teacher of Epictetus. In his time he was so respected that he was called 'the Roman Socrates.' He was sent into political exile but turned even that into an opportunity for teaching — he continued to instruct on a barren island. He insisted that philosophy is action, not words, and his argument that women need philosophy just as much as men was a bold stance for his era.", de: 'Er war der Lehrer von Epiktet. In seiner Zeit war er so angesehen, dass man ihn den „römischen Sokrates" nannte. Er wurde ins politische Exil geschickt, nutzte aber selbst das als Gelegenheit zum Unterrichten — er lehrte weiter auf einer öden Insel. Er bestand darauf, dass Philosophie Handlung ist, nicht Worte, und sein Eintreten dafür, dass Frauen Philosophie ebenso gut lernen sollten wie Männer, war für seine Zeit eine mutige Haltung.', ru: 'Он был учителем Эпиктета. В своё время он был настолько уважаем, что его называли «Римским Сократом». Его отправляли в политическую ссылку, но он и это обращал в возможность для обучения — продолжал учить на пустынном острове. Он настаивал, что философия — это действие, а не слова, а его утверждение, что женщины должны изучать философию наравне с мужчинами, было смелой позицией для своего времени.', fr: "Il était le maître d'Épictète. En son temps, il était si respecté qu'on l'appelait « le Socrate romain ». Il fut envoyé en exil politique, mais en fit une occasion d'enseignement — il continua à enseigner sur une île aride. Il insistait sur le fait que la philosophie est action, non paroles, et son argument que les femmes doivent apprendre la philosophie autant que les hommes était une position courageuse pour son époque.", es: 'Era el maestro de Epicteto. En su época era tan respetado que le llamaban «el Sócrates romano». Fue enviado al exilio político pero incluso eso lo convirtió en una oportunidad de enseñanza — siguió instruyendo en una isla árida. Insistió en que la filosofía es acción, no palabras, y su defensa de que las mujeres necesitan filosofía tanto como los hombres fue una postura audaz para su época.' },
    contribution: { tr: 'Felsefenin pratiğe, alışkanlığa ve bedensel disipline dökülmesi gerektiğini vurguladı: bilmek değil, yapmak.', en: 'He stressed that philosophy must be translated into practice, habit and bodily discipline: not knowing, but doing.', de: 'Er betonte, dass Philosophie in Praxis, Gewohnheit und körperliche Disziplin umgesetzt werden muss: nicht Wissen, sondern Handeln.', ru: 'Он подчёркивал, что философия должна воплощаться в практике, привычке и телесной дисциплине: не знать, а делать.', fr: "Il insistait sur le fait que la philosophie doit se traduire en pratique, en habitude et en discipline corporelle : non pas savoir, mais faire.", es: 'Subrayó que la filosofía debe traducirse en práctica, hábito y disciplina corporal: no saber, sino hacer.' },
  },
  {
    id: 'zeno', symbol: 'Z', color: 'rgba(140,170,150,0.12)',
    era: { tr: 'MÖ ~334–262 · Stoacılığın kurucusu', en: 'c. 334–262 BC · Founder of Stoicism', de: 'ca. 334–262 v. Chr. · Begründer des Stoizismus', ru: 'ок. 334–262 до н. э. · Основатель стоицизма', fr: 'v. 334–262 av. J.-C. · Fondateur du stoïcisme', es: 'c. 334–262 a. C. · Fundador del estoicismo' },
    oneLiner: { tr: 'Bir gemi kazasında her şeyini kaybetti — ve felsefeyi buldu.', en: 'He lost everything in a shipwreck — and found philosophy.', de: 'Er verlor alles bei einem Schiffbruch — und fand die Philosophie.', ru: 'Он потерял всё в кораблекрушении — и нашёл философию.', fr: "Il perdit tout dans un naufrage — et trouva la philosophie.", es: 'Lo perdió todo en un naufragio — y encontró la filosofía.' },
    story: { tr: 'Zengin bir tüccardı. Bir deniz yolculuğunda gemisi battı, tüm serveti yok oldu. Atina\'da bir kitapçıda Sokrates\'i okurken "böyle biri nerede bulunur?" diye sordu; tam o sırada bir filozof geçiyordu. Her şeyini kaybetmesini sonradan "en kârlı yolculuğum" diye anardı. Atina\'da boyalı bir revakın (Stoa Poikile) altında ders verdi — "Stoacılık" adı buradan gelir.', en: "He was a wealthy merchant. On a sea voyage his ship sank and his entire fortune was lost. While reading about Socrates in an Athenian bookshop he asked, 'Where can I find someone like this?' — at that very moment a philosopher happened to pass by. He later recalled losing everything as 'my most profitable voyage.' He taught beneath a painted porch in Athens called the Stoa Poikile — and that is where the name 'Stoicism' comes from.", de: 'Er war ein wohlhabender Kaufmann. Auf einer Seereise sank sein Schiff und sein gesamtes Vermögen war verloren. Während er in einer athenischen Buchhandlung über Sokrates las, fragte er: „Wo kann ich jemanden wie diesen finden?" — in diesem Augenblick kam zufällig ein Philosoph vorbei. Er erinnerte sich später daran, alles verloren zu haben, als seine „gewinnbringendste Reise". Er lehrte unter einer bemalten Säulenhalle in Athen, der Stoa Poikile — und daher kommt der Name „Stoizismus".', ru: 'Он был богатым купцом. В морском путешествии его корабль затонул, и всё состояние пропало. Читая в афинской книжной лавке о Сократе, он спросил: «Где можно найти такого человека?» — в тот же момент мимо случайно проходил философ. Впоследствии он вспоминал потерю всего как «самое выгодное своё путешествие». Он учил под расписным портиком в Афинах — Стоей Пойкилой — откуда и произошло слово «стоицизм».', fr: "Il était un riche marchand. Lors d'un voyage en mer, son bateau coula et toute sa fortune fut perdue. Alors qu'il lisait sur Socrate dans une librairie athénienne, il demanda : « Où puis-je trouver quelqu'un comme lui ? » — à ce moment précis, un philosophe passa par là. Il se souvint plus tard d'avoir tout perdu comme de son « voyage le plus profitable ». Il enseignait sous un portique peint à Athènes appelé la Stoa Poikilè — et c'est de là que vient le nom « stoïcisme ».", es: 'Era un rico mercader. En un viaje por mar su barco se hundió y perdió toda su fortuna. Mientras leía sobre Sócrates en una librería ateniense preguntó: «¿Dónde puedo encontrar a alguien así?» — en ese preciso momento pasó un filósofo. Más tarde recordaría haber perdido todo como «mi viaje más provechoso». Enseñó bajo un pórtico pintado en Atenas llamado la Stoa Poikile — y de ahí viene el nombre «estoicismo».' },
    contribution: { tr: 'Felsefeyi kurdu. Erdemin tek gerçek iyilik, dış şeylerin ise kayıtsız olduğu temel fikrini ortaya koydu.', en: 'He founded the school. He laid down the core idea that virtue is the only true good and that external things are indifferent.', de: 'Er gründete die Schule. Er legte die Grundidee nieder, dass Tugend das einzige wahre Gut ist und äußere Dinge gleichgültig sind.', ru: 'Он основал школу. Он сформулировал основную идею о том, что добродетель — единственное истинное благо, а внешние вещи безразличны.', fr: "Il fonda l'école. Il posa l'idée centrale que la vertu est le seul vrai bien et que les choses extérieures sont indifférentes.", es: 'Fundó la escuela. Estableció la idea central de que la virtud es el único bien verdadero y que las cosas externas son indiferentes.' },
  },
  {
    id: 'cleanthes', symbol: 'K', color: 'rgba(170,160,130,0.12)',
    era: { tr: 'MÖ ~330–230 · Eski boksör, su taşıyıcısı', en: 'c. 330–230 BC · Former boxer, water-carrier', de: 'ca. 330–230 v. Chr. · Ehemaliger Boxer, Wasserträger', ru: 'ок. 330–230 до н. э. · Бывший боксёр, водонос', fr: 'v. 330–230 av. J.-C. · Ancien boxeur, porteur d\'eau', es: 'c. 330–230 a. C. · Antiguo boxeador, aguador' },
    oneLiner: { tr: 'Gündüz su taşıdı, gece felsefe öğrendi — azmin sembolü oldu.', en: 'He carried water by day and learned philosophy by night — a symbol of perseverance.', de: 'Er trug tagsüber Wasser und lernte nachts Philosophie — ein Symbol der Ausdauer.', ru: 'Днём носил воду, ночью учился философии — стал символом упорства.', fr: "Il portait de l'eau le jour et apprenait la philosophie la nuit — un symbole de persévérance.", es: 'Cargaba agua de día y aprendía filosofía de noche — se convirtió en símbolo de perseverancia.' },
    story: { tr: 'Zenon\'dan sonra okulun başına geçti. Eskiden boksördü ve o kadar yoksuldu ki geceleri felsefe öğrenebilmek için gündüz bahçelerde su taşıyıp para kazanıyordu. Zeki olmaktan çok azimliydi; yavaş ama sağlam öğrenirdi. Bu yüzden "ikinci sınıf zekâ, birinci sınıf karakter" örneği sayılır.', en: 'He took over the school after Zeno. He had been a boxer and was so poor that by day he hauled water in gardens to earn money so he could study philosophy at night. He was more tenacious than brilliant; he learned slowly but solidly. For that reason he is cited as an example of "second-rate intellect, first-rate character."', de: 'Er übernahm die Schule nach Zenon. Er war Boxer gewesen und so arm, dass er tagsüber in Gärten Wasser schleppte, um Geld zu verdienen, damit er nachts Philosophie studieren konnte. Er war mehr zäh als brillant; er lernte langsam, aber gründlich. Deshalb gilt er als Beispiel für „zweitklassigen Verstand, erstklassigen Charakter".', ru: 'Он возглавил школу после Зенона. Прежде он был боксёром и был так беден, что днём носил воду в садах, зарабатывая деньги, чтобы по ночам изучать философию. Он был скорее настойчивым, чем блестящим; учился медленно, но основательно. Поэтому его называют примером «второсортного ума, первосортного характера».', fr: "Il prit la tête de l'école après Zénon. Il avait été boxeur et était si pauvre qu'il portait de l'eau dans des jardins le jour pour gagner de l'argent afin d'étudier la philosophie la nuit. Il était plus tenace que brillant ; il apprenait lentement mais solidement. C'est pourquoi on le cite comme exemple d'« intelligence de second ordre, caractère de premier ordre ».", es: 'Tomó el mando de la escuela tras Zenón. Había sido boxeador y era tan pobre que de día cargaba agua en jardines para ganar dinero y así poder estudiar filosofía de noche. Era más tenaz que brillante; aprendía despacio pero con solidez. Por eso se le cita como ejemplo de «inteligencia de segunda clase, carácter de primera clase».' },
    contribution: { tr: 'Evrenin akılla (Logos) düzenlendiği fikrini derinleştirdi; ünlü "Zeus\'a İlahi"sinde kadere uyumu şiirleştirdi.', en: 'He deepened the idea that the universe is ordered by reason (Logos) and in his famous Hymn to Zeus turned acceptance of fate into poetry.', de: 'Er vertiefte die Idee, dass das Universum durch Vernunft (Logos) geordnet ist, und in seinem berühmten Zeus-Hymnus verwandelte er die Akzeptanz des Schicksals in Poesie.', ru: 'Он углубил идею о том, что вселенная упорядочена разумом (Логосом), а в своём знаменитом «Гимне Зевсу» превратил принятие судьбы в поэзию.', fr: "Il approfondissait l'idée que l'univers est ordonné par la raison (Logos) et, dans son célèbre Hymne à Zeus, il transforma l'acceptation du destin en poésie.", es: 'Profundizó la idea de que el universo está ordenado por la razón (Logos) y en su famoso Himno a Zeus convirtió la aceptación del destino en poesía.' },
  },
  {
    id: 'chrysippus', symbol: 'X', color: 'rgba(150,160,190,0.12)',
    era: { tr: 'MÖ ~279–206 · Stoacılığın "ikinci kurucusu"', en: 'c. 279–206 BC · The "second founder" of Stoicism', de: 'ca. 279–206 v. Chr. · Der „zweite Gründer" des Stoizismus', ru: 'ок. 279–206 до н. э. · «Второй основатель» стоицизма', fr: 'v. 279–206 av. J.-C. · Le « second fondateur » du stoïcisme', es: 'c. 279–206 a. C. · El «segundo fundador» del estoicismo' },
    oneLiner: { tr: 'O olmasaydı Stoacılık olmazdı, derler — sistemi mantıkla sağlamlaştırdı.', en: 'Without him there would be no Stoicism, they say — he secured the system with logic.', de: 'Ohne ihn gäbe es keinen Stoizismus, sagt man — er festigte das System mit Logik.', ru: 'Говорят, без него не было бы стоицизма — он укрепил систему логикой.', fr: "Sans lui il n'y aurait pas de stoïcisme, dit-on — il consolida le système par la logique.", es: 'Sin él no habría estoicismo, dicen — aseguró el sistema con la lógica.' },
    story: { tr: 'Uzun mesafe koşucusuyken felsefeye döndü. İnanılmaz üretkendi — 700\'den fazla eser yazdığı söylenir. Keskin mantığıyla Stoacılığı dağınık fikirlerden tutarlı bir sisteme dönüştürdü. "Khrysippos olmasaydı, Stoa olmazdı" sözü ününü özetler.', en: 'He turned to philosophy after a career as a long-distance runner. He was extraordinarily prolific — said to have written more than 700 works. With his sharp logic he transformed Stoicism from scattered ideas into a coherent system. The saying "Without Chrysippus, there would be no Stoa" sums up his reputation.', de: 'Er wandte sich der Philosophie zu, nachdem er Langstreckenläufer war. Er war außerordentlich produktiv — er soll mehr als 700 Werke geschrieben haben. Mit seiner scharfen Logik verwandelte er den Stoizismus von verstreuten Ideen in ein kohärentes System. Der Spruch „Ohne Chrysippos gäbe es keine Stoa" fasst seinen Ruf zusammen.', ru: 'Он обратился к философии после карьеры бегуна на длинные дистанции. Он был невероятно плодовит — говорят, написал более 700 произведений. Своей острой логикой он превратил стоицизм из разрозненных идей в стройную систему. Изречение «Без Хрисиппа не было бы Стои» суммирует его репутацию.', fr: "Il se tourna vers la philosophie après une carrière de coureur de fond. Il fut extraordinairement prolifique — on dit qu'il écrivit plus de 700 œuvres. Avec sa logique aiguisée, il transforma le stoïcisme d'idées éparses en un système cohérent. La formule « Sans Chrysippe, pas de Portique » résume sa réputation.", es: 'Se volvió hacia la filosofía tras una carrera como corredor de fondo. Era extraordinariamente prolífico — se dice que escribió más de 700 obras. Con su aguda lógica transformó el estoicismo de ideas dispersas en un sistema coherente. El dicho «Sin Crisipo no habría Estoa» resume su reputación.' },
    contribution: { tr: 'Stoacı mantığı ve fizik anlayışını sistemleştirdi; felsefeyi entelektüel olarak savunulabilir bir bütün hâline getirdi.', en: 'He systematized Stoic logic and natural philosophy, making the school into an intellectually defensible whole.', de: 'Er systematisierte die stoische Logik und Naturphilosophie und machte die Schule zu einem intellektuell verteidigbaren Ganzen.', ru: 'Он систематизировал стоическую логику и натурфилософию, превратив школу в интеллектуально защитимое целое.', fr: "Il systématisa la logique stoïcienne et la philosophie naturelle, faisant de l'école un tout intellectuellement défendable.", es: 'Sistematizó la lógica estoica y la filosofía natural, convirtiendo la escuela en un todo intelectualmente defendible.' },
  },
  {
    id: 'hierocles', symbol: 'H', color: 'rgba(200,150,150,0.12)',
    era: { tr: 'MS 2. yüzyıl · Şefkat halkalarının düşünürü', en: '2nd century AD · Thinker of the circles of concern', de: '2. Jh. n. Chr. · Denker der Mitgefühlskreise', ru: '2-й в. н. э. · Мыслитель кругов заботы', fr: 'IIe siècle apr. J.-C. · Penseur des cercles de sollicitude', es: 'Siglo II d. C. · Pensador de los círculos de compasión' },
    oneLiner: { tr: 'İnsan sevgisini iç içe halkalar olarak çizdi: kendinden başlayıp tüm insanlığa.', en: 'He drew human love as nested circles: from yourself out to all humanity.', de: 'Er zeichnete die menschliche Liebe als ineinandergeschachtelte Kreise: von dir selbst bis zur ganzen Menschheit.', ru: 'Он изобразил человеческую любовь как вложенные круги: от себя — ко всему человечеству.', fr: "Il dessina l'amour humain comme des cercles emboîtés : de soi-même jusqu'à toute l'humanité.", es: 'Dibujó el amor humano como círculos anidados: desde uno mismo hasta toda la humanidad.' },
    story: { tr: 'Hakkında az şey bilinir ama bıraktığı bir fikir felsefede iz bıraktı: oikeiosis. İnsanı merkezde, çevresinde iç içe halkalar olarak hayal etti — aile, dostlar, şehir, tüm insanlık. Erdemli yaşam, dıştaki halkaları yavaşça içe çekmek; yani uzaktaki bir yabancıya yakınınmış gibi şefkat gösterebilmektir.', en: 'Little is known about him, but one idea he left behind made a lasting mark in philosophy: oikeiosis. He pictured a person at the center surrounded by nested rings — family, friends, city, all of humanity. The virtuous life is slowly drawing the outer rings inward: being able to show a distant stranger the same compassion you would show someone close.', de: 'Über ihn ist wenig bekannt, aber eine Idee, die er hinterließ, hinterließ in der Philosophie einen bleibenden Eindruck: Oikeiōsis. Er stellte sich einen Menschen im Mittelpunkt vor, umgeben von ineinandergeschachtelten Ringen — Familie, Freunde, Stadt, die ganze Menschheit. Das tugendhafte Leben besteht darin, die äußeren Ringe langsam nach innen zu ziehen: einem fernen Fremden dieselbe Güte zeigen zu können wie jemandem Nahestehenden.', ru: 'О нём известно немного, но одна оставленная им идея оставила прочный след в философии: ойкейосис. Он представлял человека в центре, окружённого вложенными кольцами — семья, друзья, город, всё человечество. Добродетельная жизнь — это медленное втягивание внешних колец внутрь: способность проявить к далёкому незнакомцу то же сострадание, что и к близкому.', fr: "On sait peu de choses sur lui, mais une idée qu'il laissa marqua durablement la philosophie : l'oikeiōsis. Il imaginait une personne au centre entourée de cercles emboîtés — famille, amis, cité, toute l'humanité. La vie vertueuse consiste à ramener lentement les cercles extérieurs vers l'intérieur : pouvoir montrer à un étranger lointain la même compassion qu'à quelqu'un de proche.", es: 'Se sabe poco sobre él, pero una idea que dejó marcó duraderamente la filosofía: la oikeiōsis. Imaginó a una persona en el centro rodeada de anillos anidados — familia, amigos, ciudad, toda la humanidad. La vida virtuosa consiste en ir acercando lentamente los anillos exteriores hacia dentro: ser capaz de mostrar a un extraño lejano la misma compasión que a alguien cercano.' },
    contribution: { tr: 'Stoacılığın sosyal ve şefkatli yüzünü işledi; adaletin ve insan sevgisinin felsefedeki yerini güçlendirdi.', en: 'He worked the social and compassionate face of Stoicism, strengthening the place of justice and love for humanity in philosophy.', de: 'Er bearbeitete das soziale und mitfühlende Gesicht des Stoizismus und stärkte den Platz der Gerechtigkeit und der Menschenliebe in der Philosophie.', ru: 'Он разрабатывал социальное и сострадательное лицо стоицизма, укрепляя место справедливости и человеколюбия в философии.', fr: "Il travailla le visage social et compatissant du stoïcisme, renforçant la place de la justice et de l'amour de l'humanité dans la philosophie.", es: 'Trabajó la faceta social y compasiva del estoicismo, reforzando el lugar de la justicia y el amor a la humanidad en la filosofía.' },
  },
  {
    id: 'cato', symbol: 'C', color: 'rgba(190,160,110,0.13)',
    era: { tr: 'MÖ 95–46 · Romalı senatör, direnişin sembolü', en: '95–46 BC · Roman senator, symbol of resistance', de: '95–46 v. Chr. · Römischer Senator, Symbol des Widerstands', ru: '95–46 до н. э. · Римский сенатор, символ сопротивления', fr: '95–46 av. J.-C. · Sénateur romain, symbole de résistance', es: '95–46 a. C. · Senador romano, símbolo de resistencia' },
    oneLiner: { tr: 'Hiç eser yazmadı; Stoacılığı sözleriyle değil, dimdik duruşuyla anlattı.', en: 'He wrote nothing; he conveyed Stoicism not with words but with an unbending stance.', de: 'Er schrieb nichts; er vermittelte den Stoizismus nicht mit Worten, sondern mit einer unnachgiebigen Haltung.', ru: 'Он ничего не писал; он передал стоицизм не словами, а непреклонной позицией.', fr: "Il n'écrivit rien ; il transmit le stoïcisme non par des mots, mais par une attitude inflexible.", es: 'No escribió nada; transmitió el estoicismo no con palabras, sino con una postura inflexible.' },
    story: { tr: 'Romalı bir senatördü, dürüstlüğü ve satın alınamazlığıyla ünlüydü — rüşvetin sıradan olduğu bir çağda. Julius Caesar\'ın artan gücüne sonuna kadar direndi. Özgürlüğün bittiğini görünce, bir zorbaya boyun eğmektense kendi sonunu seçti. Bir kitap değil, bir duruş bıraktı; sonraki nesiller için Stoacı erdemin canlı örneği oldu.', en: 'He was a Roman senator, famous for his honesty and incorruptibility — in an age when bribery was commonplace. He resisted the rising power of Julius Caesar to the very end. When he saw that freedom was over, he chose his own end rather than submit to a tyrant. He left behind not a book but a stance, and became for future generations the living example of Stoic virtue.', de: 'Er war ein römischer Senator, berühmt für seine Ehrlichkeit und Unbestechlichkeit — in einem Zeitalter, in dem Bestechung an der Tagesordnung war. Er widerstand dem wachsenden Einfluss Julius Caesars bis zum Schluss. Als er erkannte, dass die Freiheit vorbei war, wählte er sein eigenes Ende, anstatt sich einem Tyrannen zu unterwerfen. Er hinterließ kein Buch, sondern eine Haltung, und wurde für spätere Generationen zum lebendigen Vorbild stoischer Tugend.', ru: 'Он был римским сенатором, знаменитым своей честностью и неподкупностью — в эпоху, когда взяточничество было обычным делом. Он сопротивлялся растущей власти Юлия Цезаря до самого конца. Увидев, что свободе пришёл конец, он выбрал собственную смерть, лишь бы не покориться тирану. Он оставил не книгу, а позицию, и стал для последующих поколений живым примером стоической добродетели.', fr: "Il était un sénateur romain, célèbre pour son honnêteté et son incorruptibilité — à une époque où la corruption était banale. Il résista jusqu'au bout à la montée en puissance de Jules César. Quand il vit que la liberté était terminée, il choisit sa propre fin plutôt que de se soumettre à un tyran. Il ne laissa pas un livre, mais une attitude, et devint pour les générations suivantes l'exemple vivant de la vertu stoïcienne.", es: 'Era un senador romano, famoso por su honestidad e incorruptibilidad — en una época en que el soborno era algo habitual. Resistió el poder creciente de Julio César hasta el final. Cuando vio que la libertad había terminado, eligió su propio fin antes que someterse a un tirano. Dejó no un libro sino una postura, y se convirtió para las generaciones futuras en el ejemplo vivo de la virtud estoica.' },
    contribution: { tr: 'Felsefeyi yazıyla değil yaşayarak kanıtladı. Cesaret, dürüstlük ve ilkelere bağlılığın somut bir timsali sayıldı.', en: 'He proved philosophy not by writing but by living it. He was regarded as the concrete embodiment of courage, honesty and fidelity to principles.', de: 'Er bewies Philosophie nicht durch Schreiben, sondern durch Lebendigkeit. Er galt als das konkrete Vorbild für Mut, Ehrlichkeit und Treue zu den Grundsätzen.', ru: 'Он доказал философию не писанием, а жизнью. Он считался конкретным воплощением мужества, честности и верности принципам.', fr: "Il prouva la philosophie non par l'écriture, mais en la vivant. Il fut considéré comme l'incarnation concrète du courage, de l'honnêteté et de la fidélité aux principes.", es: 'Probó la filosofía no escribiendo sino viviéndola. Fue considerado la encarnación concreta del valor, la honestidad y la fidelidad a los principios.' },
  },
  {
    id: 'posidonius', symbol: 'P', color: 'rgba(150,175,185,0.12)',
    era: { tr: 'MÖ ~135–51 · Filozof, bilim insanı, gezgin', en: 'c. 135–51 BC · Philosopher, scientist, traveler', de: 'ca. 135–51 v. Chr. · Philosoph, Wissenschaftler, Reisender', ru: 'ок. 135–51 до н. э. · Философ, учёный, путешественник', fr: 'v. 135–51 av. J.-C. · Philosophe, savant, voyageur', es: 'c. 135–51 a. C. · Filósofo, científico, viajero' },
    oneLiner: { tr: 'Hem yıldızları hem ruhu inceledi — bilgiyi tek bir bütün gördü.', en: 'He studied both the stars and the soul — he saw knowledge as one whole.', de: 'Er erforschte sowohl die Sterne als auch die Seele — er sah Wissen als ein Ganzes.', ru: 'Он изучал и звёзды, и душу — он видел знание как единое целое.', fr: "Il étudia à la fois les étoiles et l'âme — il voyait le savoir comme un tout.", es: 'Estudió tanto las estrellas como el alma — veía el conocimiento como un todo único.' },
    story: { tr: 'Çağının en bilgili insanlarından biriydi. Sadece felsefe değil; astronomi, coğrafya, tarih, meteoroloji üzerine çalıştı. Gel-git olaylarını Ay\'a bağlayan ilk düşünürlerdendi. Dünyayı dolaşıp gözlem yaptı. Ona göre felsefe, bilim ve doğa ayrı şeyler değil; evreni anlamak kendini anlamanın parçasıydı.', en: 'He was one of the most learned people of his age. He worked not only in philosophy but in astronomy, geography, history and meteorology. He was among the first thinkers to link tides to the Moon. He traveled the world making observations. For him, philosophy, science and nature were not separate things — understanding the universe was part of understanding oneself.', de: 'Er war einer der gelehrtesten Menschen seiner Zeit. Er arbeitete nicht nur in der Philosophie, sondern auch in Astronomie, Geographie, Geschichte und Meteorologie. Er gehörte zu den ersten Denkern, die Gezeiten mit dem Mond in Verbindung brachten. Er bereiste die Welt und machte Beobachtungen. Für ihn waren Philosophie, Wissenschaft und Natur keine getrennten Dinge — das Universum zu verstehen war Teil des Selbstverstehens.', ru: 'Он был одним из самых образованных людей своего времени. Он работал не только в философии, но и в астрономии, географии, истории и метеорологии. Он был среди первых мыслителей, связавших приливы с Луной. Он путешествовал по миру, делая наблюдения. Для него философия, наука и природа были не разными вещами — понимание вселенной было частью самопознания.', fr: "Il était l'un des hommes les plus savants de son époque. Il travailla non seulement en philosophie, mais aussi en astronomie, géographie, histoire et météorologie. Il fut parmi les premiers penseurs à relier les marées à la Lune. Il parcourut le monde en faisant des observations. Pour lui, philosophie, science et nature n'étaient pas des choses séparées — comprendre l'univers faisait partie de se comprendre soi-même.", es: 'Era una de las personas más sabias de su época. Trabajó no solo en filosofía, sino también en astronomía, geografía, historia y meteorología. Fue uno de los primeros pensadores en relacionar las mareas con la Luna. Recorrió el mundo haciendo observaciones. Para él, filosofía, ciencia y naturaleza no eran cosas separadas — comprender el universo era parte de comprenderse a uno mismo.' },
    contribution: { tr: 'Stoacılığı bilimle ve geniş bir evren anlayışıyla birleştirdi; "her şey birbirine bağlıdır" (sympatheia) fikrini güçlendirdi.', en: 'He united Stoicism with science and a broad understanding of the cosmos, strengthening the idea that "all things are connected" (sympatheia).', de: 'Er verband den Stoizismus mit der Wissenschaft und einem weiten Verständnis des Kosmos und stärkte die Idee, dass „alles miteinander verbunden ist" (Sympatheia).', ru: 'Он объединил стоицизм с наукой и широким пониманием космоса, укрепив идею о том, что «всё взаимосвязано» (sympatheia).', fr: "Il unit le stoïcisme à la science et à une large compréhension du cosmos, renforçant l'idée que « tout est lié » (sympatheia).", es: 'Unió el estoicismo con la ciencia y una amplia comprensión del cosmos, reforzando la idea de que «todo está conectado» (sympatheia).' },
  },
];

export interface Philosopher { id: string; name: string; symbol: string; color: string; era: string; oneLiner: string; story: string; contribution: string; }

export function getPhilosophers(lang: Lang): Philosopher[] {
  return PHILOSOPHERS_RAW.map((p) => ({
    id: p.id,
    name: authorName(p.id, lang),
    symbol: p.symbol,
    color: p.color,
    era: pick(p.era, lang),
    oneLiner: pick(p.oneLiner, lang),
    story: pick(p.story, lang),
    contribution: pick(p.contribution, lang),
  }));
}

// Alıntıdaki yazarın filozof kartı var mı? (söz → kart bağı için)
export const PHILOSOPHER_IDS: ReadonlySet<string> = new Set(PHILOSOPHERS_RAW.map((p) => p.id));

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
const ALL_LANGS: Lang[] = ['tr', 'en', 'de', 'ru', 'fr', 'es'];

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
      // Sesi kısa/tutarlı tut: yalnız özet (ilk paragraf), uzun "daha fazla" kısmı okunmaz.
      const summary = pick(c.desc, lang).split('\n\n')[0];
      items.push({ key: conceptAudioKey(c.latin, lang), lang, text: `${c.latin}. ${pick(c.name, lang)}. ${summary}` });
    }
  }
  return items;
}
