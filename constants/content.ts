import { Lang } from './i18n';

type L = Record<Lang, string>;

// ─── Yazarlar (kanıt düzeyine göre sıralı) ────────────────
export interface Author { id: string; name: L; }

export const AUTHORS: Author[] = [
  // Eseri/metni günümüze ulaşanlar
  { id: 'seneca',      name: { tr: 'Seneca',          en: 'Seneca',            de: 'Seneca',             ru: 'Сенека' } },
  { id: 'epictetus',   name: { tr: 'Epiktetos',       en: 'Epictetus',         de: 'Epiktet',            ru: 'Эпиктет' } },
  { id: 'marcus',      name: { tr: 'Marcus Aurelius', en: 'Marcus Aurelius',   de: 'Mark Aurel',         ru: 'Марк Аврелий' } },
  { id: 'musonius',    name: { tr: 'Musonius Rufus',  en: 'Musonius Rufus',    de: 'Musonius Rufus',     ru: 'Музоний Руф' } },
  { id: 'cleanthes',   name: { tr: 'Kleanthes',       en: 'Cleanthes',         de: 'Kleanthes',          ru: 'Клеанф' } },
  { id: 'hierocles',   name: { tr: 'Hierokles',       en: 'Hierocles',         de: 'Hierokles',          ru: 'Гиерокл' } },
  // Sözleri antik kaynaklarda belgelenenler
  { id: 'zeno',        name: { tr: 'Kıbrıslı Zenon',  en: 'Zeno of Citium',    de: 'Zenon von Kition',   ru: 'Зенон Китийский' } },
  { id: 'chrysippus',  name: { tr: 'Khrysippos',      en: 'Chrysippus',        de: 'Chrysippos',         ru: 'Хрисипп' } },
  { id: 'cato',        name: { tr: 'Genç Cato',       en: 'Cato the Younger',  de: 'Cato der Jüngere',   ru: 'Катон Младший' } },
  { id: 'athenodorus', name: { tr: 'Athenodoros',     en: 'Athenodorus',       de: 'Athenodoros',        ru: 'Афинодор' } },
  // Öğretisi fragmanlardan yeniden kurulanlar
  { id: 'panaetius',   name: { tr: 'Panaitios',       en: 'Panaetius',         de: 'Panaitios',          ru: 'Панэтий' } },
  { id: 'posidonius',  name: { tr: 'Poseidonios',     en: 'Posidonius',        de: 'Poseidonios',        ru: 'Посидоний' } },
  { id: 'ariston',     name: { tr: 'Sakızlı Ariston', en: 'Ariston of Chios',  de: 'Ariston von Chios',  ru: 'Аристон Хиосский' } },
  { id: 'diogenes_b',  name: { tr: 'Babilli Diogenes',en: 'Diogenes of Babylon',de: 'Diogenes von Babylon',ru: 'Диоген Вавилонский' } },
];

export function authorName(id: string, lang: Lang): string {
  return AUTHORS.find((a) => a.id === id)?.name[lang] ?? id;
}

// ─── Kaynaklar ────────────────────────────────────────────
const SOURCES: Record<string, L> = {
  meditations:    { tr: 'Meditationes',     en: 'Meditations',        de: 'Selbstbetrachtungen',  ru: 'Размышления' },
  enchiridion:    { tr: 'Enchiridion',      en: 'Enchiridion',        de: 'Handbüchlein',         ru: 'Энхиридион' },
  discourses:     { tr: 'Discourses',       en: 'Discourses',         de: 'Diatriben',            ru: 'Беседы' },
  letters:        { tr: 'Epistulae Morales',en: 'Moral Letters',      de: 'Briefe an Lucilius',   ru: 'Нравственные письма' },
  happyLife:      { tr: 'De Vita Beata',    en: 'On the Happy Life',  de: 'Vom glücklichen Leben',ru: 'О счастливой жизни' },
  fragments:      { tr: 'Fragmanlar',       en: 'Fragments',          de: 'Fragmente',            ru: 'Фрагменты' },
  laertius:       { tr: 'Diogenes Laertios',en: 'Diogenes Laërtius',  de: 'Diogenes Laertios',    ru: 'Диоген Лаэртский' },
  hymnZeus:       { tr: "Zeus'a İlahi",     en: 'Hymn to Zeus',       de: 'Zeus-Hymne',           ru: 'Гимн Зевсу' },
  lectures:       { tr: 'Söylevler',        en: 'Lectures',           de: 'Vorträge',             ru: 'Лекции' },
  onDuties:       { tr: 'Görevler Üzerine', en: 'On Duties',          de: 'Über die Pflichten',   ru: 'Об обязанностях' },
  plutarch:       { tr: 'Plutarkhos',       en: 'Plutarch',           de: 'Plutarch',             ru: 'Плутарх' },
  ethicalElements:{ tr: 'Etik Unsurlar',    en: 'Elements of Ethics', de: 'Elemente der Ethik',   ru: 'Основы этики' },
};

function sourceName(id: string, lang: Lang): string {
  return SOURCES[id]?.[lang] ?? id;
}

// ─── Alıntılar ────────────────────────────────────────────
interface RawQuote { id: string; authorId: string; sourceId: string; text: L; }

const QUOTES_RAW: RawQuote[] = [
  { id: '1', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Bugün ölebilirdin; bunun yerine hâlâ hayattasın. Bu zamanı bilgelikle kullan.',
    en: 'Today you could have died; instead you are still alive. Use this time wisely.',
    de: 'Heute hättest du sterben können; stattdessen lebst du noch. Nutze diese Zeit weise.',
    ru: 'Сегодня ты мог умереть; но ты всё ещё жив. Используй это время мудро.' } },
  { id: '2', authorId: 'epictetus', sourceId: 'enchiridion', text: {
    tr: 'İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir.',
    en: 'People are disturbed not by things, but by their opinions about things.',
    de: 'Nicht die Dinge beunruhigen die Menschen, sondern ihre Urteile über die Dinge.',
    ru: 'Людей беспокоят не вещи, а их мнения о вещах.' } },
  { id: '3', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Hayatını değiştirmek istiyorsan, düşüncelerini değiştir. Bu kadar basit, bu kadar zor.',
    en: 'If you want to change your life, change your thoughts. This simple, this hard.',
    de: 'Willst du dein Leben ändern, ändere deine Gedanken. So einfach, so schwer.',
    ru: 'Хочешь изменить свою жизнь — измени свои мысли. Так просто и так трудно.' } },
  { id: '4', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Kendine dönük yolculuk, tüm yolculukların en uzunudur.',
    en: 'The journey toward oneself is the longest of all journeys.',
    de: 'Die Reise zu sich selbst ist die längste aller Reisen.',
    ru: 'Путь к самому себе — самый длинный из всех путей.' } },
  { id: '5', authorId: 'epictetus', sourceId: 'discourses', text: {
    tr: 'Özgürlük, istediğini elde etmek değil; istemediğin şeyden korkmamaktır.',
    en: 'Freedom is not getting what you want, but ceasing to fear what you do not want.',
    de: 'Freiheit heißt nicht, zu bekommen, was man will, sondern das Unerwünschte nicht zu fürchten.',
    ru: 'Свобода — не в том, чтобы получать желаемое, а в том, чтобы не бояться нежеланного.' } },
  { id: '6', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Kayıplarını değil, sahip olduklarını say.',
    en: 'Count not your losses, but what you possess.',
    de: 'Zähle nicht deine Verluste, sondern das, was du besitzt.',
    ru: 'Считай не свои потери, а то, чем владеешь.' } },
  { id: '7', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Vakit en değerli şeydir; onu harcarken bile tasarruflu ol.',
    en: 'Time is the most precious thing; be frugal even as you spend it.',
    de: 'Zeit ist das Kostbarste; sei sparsam, selbst während du sie ausgibst.',
    ru: 'Время — самое драгоценное; будь бережлив, даже расходуя его.' } },
  { id: '8', authorId: 'epictetus', sourceId: 'enchiridion', text: {
    tr: 'Başkalarının söyledikleri onların kontrolünde; onlara nasıl tepki vereceğin senin.',
    en: 'What others say is in their control; how you respond is in yours.',
    de: 'Was andere sagen, liegt in ihrer Macht; wie du reagierst, in deiner.',
    ru: 'Что говорят другие — в их власти; как ты ответишь — в твоей.' } },
  { id: '9', authorId: 'seneca', sourceId: 'letters', text: {
    tr: 'Gelecek için kaygılanmak, henüz yaşanmamış bir acıyı iki kez yaşamaktır.',
    en: 'To worry about the future is to suffer a pain not yet born, twice.',
    de: 'Sich um die Zukunft zu sorgen heißt, ein noch ungeborenes Leid zweimal zu erleiden.',
    ru: 'Тревожиться о будущем — значит дважды пережить ещё не наступившую боль.' } },
  { id: '10', authorId: 'marcus', sourceId: 'meditations', text: {
    tr: 'Kendi ruhunu değiştirmek, dünyanın geri kalanını değiştirmekten daha zordur.',
    en: 'To change your own soul is harder than to change all the rest of the world.',
    de: 'Die eigene Seele zu ändern ist schwerer, als die ganze übrige Welt zu ändern.',
    ru: 'Изменить собственную душу труднее, чем изменить весь остальной мир.' } },
  { id: '11', authorId: 'seneca', sourceId: 'happyLife', text: {
    tr: 'Az isteyen çok sahiptir. Çok isteyen hiçbir zaman yeterince sahip değildir.',
    en: 'He who wants little has much. He who wants much never has enough.',
    de: 'Wer wenig will, hat viel. Wer viel will, hat nie genug.',
    ru: 'Кто желает малого, владеет многим. Кому нужно многое, тому всегда мало.' } },
  { id: '12', authorId: 'epictetus', sourceId: 'discourses', text: {
    tr: 'Bilgelik; neyin senin kontrolünde olduğunu, neyin olmadığını bilmektir.',
    en: 'Wisdom is knowing what is in your control and what is not.',
    de: 'Weisheit ist zu wissen, was in deiner Macht steht und was nicht.',
    ru: 'Мудрость — знать, что в твоей власти, а что нет.' } },

  { id: '13', authorId: 'zeno', sourceId: 'laertius', text: {
    tr: 'İki kulağımız ve tek bir ağzımız var; bu yüzden daha çok dinleyip daha az konuşmalıyız.',
    en: 'We have two ears and one mouth, so we should listen more and speak less.',
    de: 'Wir haben zwei Ohren und einen Mund, also sollten wir mehr hören und weniger reden.',
    ru: 'У нас два уха и один рот, поэтому слушать надо больше, а говорить меньше.' } },
  { id: '14', authorId: 'zeno', sourceId: 'fragments', text: {
    tr: 'İyi insanlar yasalardan değil, erdemden ötürü doğru davranır.',
    en: 'Good people act rightly not because of laws, but because of virtue.',
    de: 'Gute Menschen handeln recht nicht wegen der Gesetze, sondern aus Tugend.',
    ru: 'Добрые люди поступают правильно не из-за законов, а из добродетели.' } },
  { id: '15', authorId: 'zeno', sourceId: 'laertius', text: {
    tr: 'Doğayla uyum içinde yaşamak — işte hayatın amacı budur.',
    en: 'To live in agreement with nature — that is the goal of life.',
    de: 'Im Einklang mit der Natur zu leben — das ist das Ziel des Lebens.',
    ru: 'Жить в согласии с природой — вот цель жизни.' } },
  { id: '16', authorId: 'zeno', sourceId: 'fragments', text: {
    tr: 'Mutluluk, akışı düzgün bir yaşamdır.',
    en: 'Happiness is a smooth flow of life.',
    de: 'Glück ist ein gleichmäßiger Fluss des Lebens.',
    ru: 'Счастье — это ровное течение жизни.' } },

  { id: '17', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'Erdemli yaşamak için zenginliğe değil, yalnızca akla ihtiyacın var.',
    en: 'To live virtuously you need not wealth, but only reason.',
    de: 'Um tugendhaft zu leben, brauchst du keinen Reichtum, sondern nur Vernunft.',
    ru: 'Чтобы жить добродетельно, нужно не богатство, а лишь разум.' } },
  { id: '18', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'İyi yaşamayı öğrenmek, tüm hayatı öğrenmektir; çünkü her an doğru davranma fırsatıdır.',
    en: 'To learn to live well is to learn all of life, for every moment is a chance to act rightly.',
    de: 'Gut leben zu lernen heißt, das ganze Leben zu lernen; denn jeder Augenblick ist eine Gelegenheit, recht zu handeln.',
    ru: 'Учиться жить хорошо — значит учиться всей жизни, ведь каждый миг — повод поступить верно.' } },
  { id: '19', authorId: 'musonius', sourceId: 'lectures', text: {
    tr: 'Zorluğa katlanmayı seçen kişi, hazza teslim olandan daha özgürdür.',
    en: 'One who chooses to endure hardship is freer than one who surrenders to pleasure.',
    de: 'Wer Mühsal zu ertragen wählt, ist freier als der, der sich der Lust ergibt.',
    ru: 'Тот, кто выбирает терпеть трудность, свободнее того, кто отдаётся наслаждению.' } },

  { id: '20', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Yaşamak, erdemi öğrenmek için verilmiş bir okuldur.',
    en: 'To live is a school given to us for learning virtue.',
    de: 'Das Leben ist eine Schule, die uns zum Erlernen der Tugend gegeben ist.',
    ru: 'Жизнь — это школа, данная нам для обучения добродетели.' } },
  { id: '21', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Hiçbir şey rastlantı değildir; her şey aklın düzeni içinde olur.',
    en: 'Nothing happens by chance; everything occurs within the order of reason.',
    de: 'Nichts geschieht zufällig; alles geschieht in der Ordnung der Vernunft.',
    ru: 'Ничто не случайно; всё происходит в порядке разума.' } },
  { id: '22', authorId: 'chrysippus', sourceId: 'fragments', text: {
    tr: 'Bilge kişi hiçbir şeye muhtaç değildir, ama her şeyi kullanabilir.',
    en: 'The wise person needs nothing, yet can make use of everything.',
    de: 'Der Weise bedarf nichts, kann aber alles gebrauchen.',
    ru: 'Мудрец ни в чём не нуждается, но может воспользоваться всем.' } },

  { id: '23', authorId: 'cleanthes', sourceId: 'hymnZeus', text: {
    tr: 'Beni yönet ey Zeus, ve sen ey Kader, bana çizdiğiniz yola. Tereddütsüz izleyeceğim; istemesem bile gitmem gerekir.',
    en: 'Lead me, O Zeus, and you, O Destiny, upon the path you have set for me. I will follow without hesitation; even unwilling, I must go.',
    de: 'Führe mich, o Zeus, und du, o Schicksal, auf dem Weg, den ihr mir bestimmt habt. Ich folge ohne Zögern; selbst widerwillig muss ich gehen.',
    ru: 'Веди меня, о Зевс, и ты, о Рок, по пути, что вы мне начертали. Я последую без колебаний; даже не желая, я должен идти.' } },
  { id: '24', authorId: 'cleanthes', sourceId: 'fragments', text: {
    tr: 'İsteyeni kader yöneltir, istemeyeni sürükler.',
    en: 'The Fates guide the willing and drag the unwilling.',
    de: 'Den Willigen führt das Schicksal, den Unwilligen schleift es fort.',
    ru: 'Желающего судьба ведёт, нежелающего — тащит.' } },

  { id: '25', authorId: 'ariston', sourceId: 'fragments', text: {
    tr: 'Bilge kişi, hangi rolü oynarsa oynasın onu iyi oynayan usta bir oyuncuya benzer.',
    en: 'The wise person is like a skilled actor who plays well whatever role is given.',
    de: 'Der Weise gleicht einem geschickten Schauspieler, der jede Rolle gut spielt.',
    ru: 'Мудрец подобен искусному актёру, который хорошо играет любую доставшуюся роль.' } },
  { id: '26', authorId: 'ariston', sourceId: 'fragments', text: {
    tr: 'Erdem ile kötülük dışında her şey kayıtsızdır; gerisi ne iyi ne kötüdür.',
    en: 'Everything except virtue and vice is indifferent; the rest is neither good nor bad.',
    de: 'Alles außer Tugend und Laster ist gleichgültig; der Rest ist weder gut noch schlecht.',
    ru: 'Всё, кроме добродетели и порока, безразлично; остальное ни хорошо, ни плохо.' } },

  { id: '27', authorId: 'diogenes_b', sourceId: 'fragments', text: {
    tr: 'Doğayla uyumlu yaşamak, her seçimde sağduyuya kulak vermektir.',
    en: 'To live in accordance with nature is to heed good sense in every choice.',
    de: 'Im Einklang mit der Natur zu leben heißt, in jeder Wahl auf die Vernunft zu hören.',
    ru: 'Жить согласно природе — значит в каждом выборе слушать здравый смысл.' } },

  { id: '28', authorId: 'panaetius', sourceId: 'onDuties', text: {
    tr: 'Her insanın doğası gereği üstlendiği görevler vardır; erdem bunları eksiksiz yerine getirmektir.',
    en: 'Each person has duties given by nature; virtue is fulfilling them completely.',
    de: 'Jeder Mensch hat von Natur aus Pflichten; Tugend ist es, sie vollständig zu erfüllen.',
    ru: 'У каждого по природе есть обязанности; добродетель — исполнять их полностью.' } },
  { id: '29', authorId: 'panaetius', sourceId: 'onDuties', text: {
    tr: 'Onurlu olan ile yararlı olan asla çatışmaz; çatışıyor görünüyorsa, yanılıyoruzdur.',
    en: 'The honorable and the useful never truly conflict; if they seem to, we are mistaken.',
    de: 'Das Ehrenhafte und das Nützliche stehen nie im Widerstreit; scheint es so, irren wir.',
    ru: 'Достойное и полезное никогда не противоречат; если кажется, что да, — мы ошибаемся.' } },

  { id: '30', authorId: 'posidonius', sourceId: 'fragments', text: {
    tr: 'Tek bir evren vardır ve onu saran her şey karşılıklı bir sempati ile birbirine bağlıdır.',
    en: 'There is one universe, and all within it is bound together by mutual sympathy.',
    de: 'Es gibt ein Universum, und alles darin ist durch wechselseitige Sympathie verbunden.',
    ru: 'Вселенная едина, и всё в ней связано взаимным сочувствием.' } },
  { id: '31', authorId: 'posidonius', sourceId: 'fragments', text: {
    tr: 'Bir gün bilgelikle yaşadıysan, bütün bir ömrü yaşamış sayılırsın.',
    en: 'If you have lived one day with wisdom, you have lived a whole lifetime.',
    de: 'Hast du einen Tag mit Weisheit gelebt, so hast du ein ganzes Leben gelebt.',
    ru: 'Если ты прожил мудро хотя бы один день, ты прожил целую жизнь.' } },

  { id: '32', authorId: 'athenodorus', sourceId: 'plutarch', text: {
    tr: 'Öfkelendiğinde, konuşmadan ya da harekete geçmeden önce alfabenin tüm harflerini içinden say.',
    en: 'When angry, recite the whole alphabet to yourself before speaking or acting.',
    de: 'Wenn du zornig bist, sprich das ganze Alphabet im Stillen durch, bevor du redest oder handelst.',
    ru: 'Разгневавшись, мысленно повтори весь алфавит, прежде чем говорить или действовать.' } },

  { id: '33', authorId: 'cato', sourceId: 'plutarch', text: {
    tr: 'Özgür bir insan ancak kendi erdemiyle yenilebilir; düşmanıyla değil.',
    en: 'A free person can be conquered only by his own virtue, never by an enemy.',
    de: 'Ein freier Mensch kann nur durch seine eigene Tugend besiegt werden, nie durch einen Feind.',
    ru: 'Свободного человека можно победить лишь его собственной добродетелью, но не врагом.' } },
  { id: '34', authorId: 'cato', sourceId: 'plutarch', text: {
    tr: 'Doğru olanı yap; sonucu kadere bırak.',
    en: 'Do what is right; leave the outcome to fate.',
    de: 'Tu das Rechte; den Ausgang überlass dem Schicksal.',
    ru: 'Делай то, что правильно; исход оставь судьбе.' } },

  { id: '35', authorId: 'hierocles', sourceId: 'ethicalElements', text: {
    tr: 'Önce kendini, sonra aileni, sonra şehrini, en sonunda tüm insanlığı kucaklayan halkalar çiz; ve bu halkaları sürekli merkeze doğru çekmeye çalış.',
    en: 'Draw circles that embrace first yourself, then your family, your city, and finally all humanity; and keep drawing them toward the center.',
    de: 'Ziehe Kreise, die zuerst dich selbst, dann deine Familie, deine Stadt und schließlich die ganze Menschheit umfassen; und ziehe sie stets zur Mitte hin.',
    ru: 'Очерти круги, охватывающие сначала тебя, затем семью, город и, наконец, всё человечество; и постоянно стягивай их к центру.' } },
  { id: '36', authorId: 'hierocles', sourceId: 'ethicalElements', text: {
    tr: 'İnsan doğası gereği topluluk için yaratılmıştır; başkasına iyilik, kendine iyiliktir.',
    en: 'By nature the human being is made for community; kindness to another is kindness to oneself.',
    de: 'Von Natur aus ist der Mensch für die Gemeinschaft geschaffen; Güte gegen andere ist Güte gegen sich selbst.',
    ru: 'По природе человек создан для общности; добро другому — это добро себе.' } },
];

export interface Quote { id: string; authorId: string; text: string; author: string; source: string; }

export function getQuotes(lang: Lang): Quote[] {
  return QUOTES_RAW.map((q) => ({
    id: q.id,
    authorId: q.authorId,
    text: q.text[lang],
    author: authorName(q.authorId, lang),
    source: sourceName(q.sourceId, lang),
  }));
}

export function getTodaysQuote(lang: Lang): Quote {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const q = QUOTES_RAW[dayOfYear % QUOTES_RAW.length];
  return { id: q.id, authorId: q.authorId, text: q.text[lang], author: authorName(q.authorId, lang), source: sourceName(q.sourceId, lang) };
}

// ─── Kavramlar ────────────────────────────────────────────
interface RawConcept { latin: string; icon: string; color: string; name: L; desc: L; example: L; }

const CONCEPTS_RAW: RawConcept[] = [
  { latin: 'Amor Fati', icon: '♾', color: 'rgba(212,146,74,0.15)',
    name: { tr: 'Kaderini Sev', en: 'Love Your Fate', de: 'Liebe dein Schicksal', ru: 'Люби свою судьбу' },
    desc: {
      tr: 'Her olayı — acı veren ya da keyifli — olması gerektiği gibi kabul etmek. Dirençten değil kabulden güç doğar.',
      en: 'To accept every event — painful or pleasant — as it ought to be. Strength is born of acceptance, not resistance.',
      de: 'Jedes Ereignis — schmerzhaft oder angenehm — so anzunehmen, wie es sein soll. Kraft entsteht aus Annahme, nicht aus Widerstand.',
      ru: 'Принимать всякое событие — болезненное или приятное — таким, каким оно должно быть. Сила рождается из принятия, а не из сопротивления.' },
    example: {
      tr: 'İşini kaybettiğinde "Bu beni nasıl daha güçlü yapabilir?" diye sormak Amor Fati\'dir.',
      en: 'When you lose your job, asking "How can this make me stronger?" is Amor Fati.',
      de: 'Wenn du deine Arbeit verlierst und fragst „Wie kann mich das stärker machen?“, ist das Amor Fati.',
      ru: 'Потеряв работу, спросить «Как это сделает меня сильнее?» — это Amor Fati.' } },
  { latin: 'Memento Mori', icon: '⧗', color: 'rgba(180,120,80,0.15)',
    name: { tr: 'Ölümü Hatırla', en: 'Remember Death', de: 'Gedenke des Todes', ru: 'Помни о смерти' },
    desc: {
      tr: 'Ölümlülüğünü hatırlamak seni karamsarlığa değil, uyanıklığa iter. Sınırlı zamanın olduğunu bilmek her anı değerli kılar.',
      en: 'Remembering your mortality drives you not to gloom but to wakefulness. Knowing your time is limited makes each moment precious.',
      de: 'Sich der eigenen Sterblichkeit zu erinnern führt nicht zu Düsternis, sondern zu Wachheit. Zu wissen, dass die Zeit begrenzt ist, macht jeden Augenblick kostbar.',
      ru: 'Память о смертности ведёт не к унынию, а к бодрствованию. Зная, что время ограничено, ценишь каждое мгновение.' },
    example: {
      tr: '"Bu sabah uyandığımda ölmemiştim" — bu düşünce her günü bir hediye olarak görmeni sağlar.',
      en: '"This morning I woke and had not died" — this thought lets you see each day as a gift.',
      de: '„Heute Morgen erwachte ich und war nicht gestorben“ — dieser Gedanke lässt dich jeden Tag als Geschenk sehen.',
      ru: '«Сегодня утром я проснулся и не умер» — эта мысль помогает видеть каждый день как дар.' } },
  { latin: 'Premeditatio Malorum', icon: '◈', color: 'rgba(100,140,180,0.15)',
    name: { tr: 'Kötülükleri Önceden Düşün', en: 'Foresee Adversity', de: 'Das Übel vorausdenken', ru: 'Предвидеть невзгоды' },
    desc: {
      tr: 'Olası zorlukları zihinsel olarak prova etmek, onlarla karşılaştığında hazırlıklı olmanı sağlar. Bu korku değil, hazırlıktır.',
      en: 'Mentally rehearsing possible hardships prepares you to meet them. This is not fear, but readiness.',
      de: 'Mögliche Schwierigkeiten im Geist durchzuspielen bereitet dich darauf vor, ihnen zu begegnen. Das ist keine Furcht, sondern Bereitschaft.',
      ru: 'Мысленная репетиция возможных трудностей готовит к встрече с ними. Это не страх, а готовность.' },
    example: {
      tr: 'Bir sunum öncesi "Ya yanılırsam? Ya teknik aksaklık olursa?" diye sorup cevabını düşünmek.',
      en: 'Before a presentation, asking "What if I err? What if tech fails?" and preparing your answer.',
      de: 'Vor einer Präsentation zu fragen „Was, wenn ich mich irre? Was, wenn die Technik versagt?“ und die Antwort zu bedenken.',
      ru: 'Перед презентацией спросить «А если ошибусь? А если откажет техника?» и продумать ответ.' } },
  { latin: 'Dichotomy of Control', icon: '◎', color: 'rgba(80,160,120,0.15)',
    name: { tr: 'Kontrol Dairesi', en: 'Dichotomy of Control', de: 'Dichotomie der Kontrolle', ru: 'Дихотомия контроля' },
    desc: {
      tr: 'Her şeyi iki kategoriye ayır: kontrolündeki (düşünceler, kararlar, tepkiler) ve kontrolün dışındaki. Enerjini yalnızca birincisine ver.',
      en: 'Divide everything into two: what is in your control (thoughts, choices, responses) and what is not. Give your energy only to the first.',
      de: 'Teile alles in zwei: was in deiner Macht steht (Gedanken, Entscheidungen, Reaktionen) und was nicht. Gib deine Kraft nur dem Ersten.',
      ru: 'Раздели всё на две части: подвластное тебе (мысли, решения, реакции) и неподвластное. Отдавай силы только первому.' },
    example: {
      tr: 'Trafik sıkışıklığı kontrolünde değil. Ama sakin kalıp müzik dinlemek senin elinde.',
      en: 'Traffic is not in your control. But staying calm and listening to music is.',
      de: 'Der Stau liegt nicht in deiner Macht. Aber ruhig zu bleiben und Musik zu hören schon.',
      ru: 'Пробка не в твоей власти. Но оставаться спокойным и слушать музыку — в твоей.' } },
  { latin: 'Eudaimonia', icon: '✦', color: 'rgba(196,169,106,0.15)',
    name: { tr: 'İyi Yaşam', en: 'Flourishing', de: 'Gutes Leben', ru: 'Благоденствие' },
    desc: {
      tr: 'Stoacılıkta mutluluk dış koşullara değil, erdemli yaşamaya dayanır. Gerçek huzur sahip olduklarından değil, kim olduğundan gelir.',
      en: 'In Stoicism, happiness rests not on circumstances but on living virtuously. True peace comes from who you are, not what you own.',
      de: 'Im Stoizismus beruht Glück nicht auf Umständen, sondern auf tugendhaftem Leben. Wahrer Frieden kommt daher, wer du bist, nicht was du besitzt.',
      ru: 'В стоицизме счастье зиждется не на обстоятельствах, а на добродетельной жизни. Истинный покой — от того, кто ты, а не от того, чем владеешь.' },
    example: {
      tr: 'Zenginlik, ün veya güzellik olmadan da tam bir insan olunabilir — erdemi seçmek yeterli.',
      en: 'One can be a complete human without wealth, fame, or beauty — choosing virtue is enough.',
      de: 'Man kann ohne Reichtum, Ruhm oder Schönheit ein ganzer Mensch sein — die Tugend zu wählen genügt.',
      ru: 'Можно быть цельным человеком без богатства, славы и красоты — достаточно выбрать добродетель.' } },
  { latin: 'Sympatheia', icon: '∞', color: 'rgba(160,100,180,0.15)',
    name: { tr: 'Evrensel Bağ', en: 'Universal Connection', de: 'Universale Verbundenheit', ru: 'Всеобщая связь' },
    desc: {
      tr: 'Her şey birbirine bağlıdır. Başkalarına zarar vermek kendine zarar vermektir. Evrenin küçük ama önemli bir parçasısın.',
      en: 'All things are interconnected. To harm others is to harm yourself. You are a small but vital part of the whole.',
      de: 'Alles ist miteinander verbunden. Anderen zu schaden heißt, sich selbst zu schaden. Du bist ein kleiner, doch wichtiger Teil des Ganzen.',
      ru: 'Всё взаимосвязано. Вредить другим — значит вредить себе. Ты малая, но важная часть целого.' },
    example: {
      tr: 'Birine yardım ettiğinde sadece onu değil, bütünün dengesini iyileştiriyorsun.',
      en: 'When you help someone, you improve not just them but the balance of the whole.',
      de: 'Wenn du jemandem hilfst, verbesserst du nicht nur ihn, sondern das Gleichgewicht des Ganzen.',
      ru: 'Помогая кому-то, ты улучшаешь не только его, но и равновесие целого.' } },
  { latin: 'Logos', icon: '☉', color: 'rgba(150,150,90,0.15)',
    name: { tr: 'Evrensel Akıl', en: 'Universal Reason', de: 'Universale Vernunft', ru: 'Вселенский разум' },
    desc: {
      tr: 'Evreni yöneten bir düzen, bir akıl vardır. Akla uygun yaşamak, bu düzenle uyum içinde olmaktır.',
      en: 'There is an order, a reason, governing the universe. To live rationally is to be in harmony with it.',
      de: 'Es gibt eine Ordnung, eine Vernunft, die das Universum lenkt. Vernünftig zu leben heißt, mit ihr im Einklang zu sein.',
      ru: 'Вселенной правит порядок, разум. Жить разумно — значит быть в согласии с ним.' },
    example: {
      tr: 'Bir nehir gibi: akışa direnmek yerine onun mantığını anlamak huzur getirir.',
      en: 'Like a river: instead of fighting the current, understanding its logic brings peace.',
      de: 'Wie ein Fluss: Statt gegen die Strömung zu kämpfen, bringt es Frieden, ihre Logik zu verstehen.',
      ru: 'Как река: вместо борьбы с течением, понимание его логики приносит покой.' } },
];

export interface Concept { latin: string; icon: string; color: string; name: string; desc: string; example: string; }

export function getConcepts(lang: Lang): Concept[] {
  return CONCEPTS_RAW.map((c) => ({ latin: c.latin, icon: c.icon, color: c.color, name: c.name[lang], desc: c.desc[lang], example: c.example[lang] }));
}

export function getDailyConcept(lang: Lang): Concept {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return getConcepts(lang)[dayOfYear % CONCEPTS_RAW.length];
}

// ─── Egzersizler ──────────────────────────────────────────
interface RawExercise { id: string; min: number; name: L; desc: L; }

export const MORNING_RAW: RawExercise[] = [
  { id: 'neg_vis', min: 3,
    name: { tr: 'Negatif Görselleştirme', en: 'Negative Visualization', de: 'Negative Visualisierung', ru: 'Негативная визуализация' },
    desc: {
      tr: 'Bugün kaybedebileceklerini düşün — sağlık, sevdiklerin, işin. Sahip olduklarının değerini hisset.',
      en: 'Imagine what you could lose today — health, loved ones, work. Feel the value of what you have.',
      de: 'Stell dir vor, was du heute verlieren könntest — Gesundheit, Liebste, Arbeit. Spüre den Wert dessen, was du hast.',
      ru: 'Представь, что можешь потерять сегодня — здоровье, близких, работу. Почувствуй ценность того, что есть.' } },
  { id: 'intention', min: 2,
    name: { tr: 'Sabah Niyeti', en: 'Morning Intention', de: 'Morgenvorsatz', ru: 'Утренний настрой' },
    desc: {
      tr: 'Bugün kontrolümde olan tek şey kendi tepkilerim ve kararlarım. Dışarıdaki her şey benim değil.',
      en: 'Today the only things in my control are my responses and choices. All else is not mine.',
      de: 'Heute liegen nur meine Reaktionen und Entscheidungen in meiner Macht. Alles andere gehört mir nicht.',
      ru: 'Сегодня в моей власти лишь мои реакции и решения. Всё внешнее — не моё.' } },
  { id: 'memento', min: 2,
    name: { tr: 'Memento Mori', en: 'Memento Mori', de: 'Memento Mori', ru: 'Memento Mori' },
    desc: {
      tr: 'Bu gün tekrar gelmeyecek. Nasıl yaşamak istiyorsun? Ne bırakmak istiyorsun?',
      en: 'This day will not return. How do you want to live it? What do you want to leave behind?',
      de: 'Dieser Tag kehrt nicht wieder. Wie willst du ihn leben? Was willst du hinterlassen?',
      ru: 'Этот день не вернётся. Как ты хочешь его прожить? Что хочешь оставить?' } },
];

export const EVENING_RAW: RawExercise[] = [
  { id: 'review', min: 5,
    name: { tr: 'Günün Muhasebesi', en: 'Review of the Day', de: 'Rückschau des Tages', ru: 'Итоги дня' },
    desc: {
      tr: 'Bugün kontrolündeki şeylerde nasıl davrandın? Nerede daha iyi olabilirdin?',
      en: 'How did you act in what was in your control today? Where could you have done better?',
      de: 'Wie hast du heute in dem gehandelt, was in deiner Macht lag? Wo hättest du besser sein können?',
      ru: 'Как ты сегодня действовал в подвластном тебе? Где мог бы быть лучше?' } },
  { id: 'gratitude', min: 3,
    name: { tr: 'Stoacı Şükran', en: 'Stoic Gratitude', de: 'Stoische Dankbarkeit', ru: 'Стоическая благодарность' },
    desc: {
      tr: 'Bugün sıradan görünen ama aslında değerli olan üç şeyi hatırla.',
      en: 'Recall three things that seemed ordinary today but were truly valuable.',
      de: 'Erinnere dich an drei Dinge, die heute gewöhnlich schienen, aber wertvoll waren.',
      ru: 'Вспомни три вещи, что казались сегодня обычными, но были по-настоящему ценны.' } },
];

export interface Exercise { id: string; duration: string; name: string; desc: string; category: 'morning' | 'evening'; }

export function getExercises(lang: Lang, minUnit: string): { morning: Exercise[]; evening: Exercise[] } {
  const map = (e: RawExercise, category: 'morning' | 'evening'): Exercise => ({
    id: e.id, duration: `${e.min} ${minUnit}`, name: e.name[lang], desc: e.desc[lang], category,
  });
  return {
    morning: MORNING_RAW.map((e) => map(e, 'morning')),
    evening: EVENING_RAW.map((e) => map(e, 'evening')),
  };
}

// İlerleme ekranı için sade egzersiz adı listesi
export function getExerciseNames(lang: Lang): { id: string; name: string; category: 'morning' | 'evening' }[] {
  return [
    ...MORNING_RAW.map((e) => ({ id: e.id, name: e.name[lang], category: 'morning' as const })),
    ...EVENING_RAW.map((e) => ({ id: e.id, name: e.name[lang], category: 'evening' as const })),
  ];
}

// ─── Koç ──────────────────────────────────────────────────
export const COACH_SUGGESTIONS: Record<Lang, string[]> = {
  tr: ['İşte başarısız oldum', 'Kaygı içindeyim', 'Birileri beni eleştiriyor', 'Geleceğim belirsiz', 'Öfkeyi nasıl yönetirim?'],
  en: ['I failed at work', "I'm anxious", 'Someone is criticizing me', 'My future is uncertain', 'How do I manage anger?'],
  de: ['Ich bin bei der Arbeit gescheitert', 'Ich bin ängstlich', 'Jemand kritisiert mich', 'Meine Zukunft ist ungewiss', 'Wie bändige ich Wut?'],
  ru: ['Я провалился на работе', 'Меня одолевает тревога', 'Меня критикуют', 'Моё будущее неопределённо', 'Как справиться с гневом?'],
};

export const COACH_INITIAL: Record<Lang, string> = {
  tr: 'Merhaba. Bugün sana nasıl yardımcı olabilirim? Yaşadığın zorluğu veya hissettiğin duyguyu bana anlat — birlikte Stoacı bir bakış açısı geliştirelim.\n\n[ALINTI: "Kendine dönük yolculuk, tüm yolculukların en uzunudur." — Seneca, Epistulae]',
  en: 'Hello. How can I help you today? Tell me about the difficulty you face or the emotion you feel — together we will develop a Stoic perspective.\n\n[ALINTI: "The journey toward oneself is the longest of all journeys." — Seneca, Moral Letters]',
  de: 'Hallo. Wie kann ich dir heute helfen? Erzähl mir von der Schwierigkeit, der du begegnest, oder dem Gefühl, das dich bewegt — gemeinsam entwickeln wir eine stoische Sicht.\n\n[ALINTI: "Die Reise zu sich selbst ist die längste aller Reisen." — Seneca, Briefe an Lucilius]',
  ru: 'Здравствуй. Чем я могу помочь тебе сегодня? Расскажи о трудности, с которой ты столкнулся, или о чувстве, что тебя тревожит, — вместе мы выработаем стоический взгляд.\n\n[ALINTI: "Путь к самому себе — самый длинный из всех путей." — Сенека, Нравственные письма]',
};

const LANG_NAME: Record<Lang, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'русском языке' };

export function coachSystemPrompt(lang: Lang): string {
  const langInstr: Record<Lang, string> = {
    tr: 'Tüm yanıtlarını Türkçe yaz.',
    en: 'Write all your responses in English.',
    de: 'Schreibe alle deine Antworten auf Deutsch.',
    ru: 'Пиши все свои ответы на русском языке.',
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
