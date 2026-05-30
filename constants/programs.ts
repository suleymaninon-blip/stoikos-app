import type { Lang } from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

type L = Record<Lang, string>;
interface RawDay { title: L; body: L; }
interface RawProgram { id: string; icon: string; color: string; title: L; subtitle: L; days: RawDay[]; }

// ─── Program içerikleri ───────────────────────────────────
const PROGRAMS_RAW: RawProgram[] = [
  // ════════ 7 Günde Kontrol Dairesi ════════
  {
    id: 'control',
    icon: '◎',
    color: 'rgba(80,160,120,0.18)',
    title: { tr: 'Kontrol Dairesi', en: 'The Dichotomy of Control', de: 'Die Dichotomie der Kontrolle', ru: 'Дихотомия контроля' },
    subtitle: { tr: '7 günde huzurun temeli', en: 'The foundation of peace in 7 days', de: 'Das Fundament der Ruhe in 7 Tagen', ru: 'Основа покоя за 7 дней' },
    days: [
      { title: { tr: 'Ayrımı gör', en: 'See the divide', de: 'Erkenne die Trennung', ru: 'Увидь границу' },
        body: { tr: 'Bugün karşına çıkan her şeyi ikiye ayır: kontrolümde (düşüncelerim, kararlarım) ve kontrolüm dışında (başkaları, sonuçlar). Bir kez fark etmek bile rahatlatır.',
                en: 'Today, split everything you meet into two: in my control (my thoughts, choices) and out of my control (others, outcomes). Even noticing this brings relief.',
                de: 'Teile heute alles, was dir begegnet, in zwei: in meiner Macht (Gedanken, Entscheidungen) und außerhalb (andere, Ergebnisse). Schon das zu bemerken erleichtert.',
                ru: 'Сегодня дели всё на два: в моей власти (мысли, решения) и вне её (другие, итоги). Даже осознание этого приносит облегчение.' } },
      { title: { tr: 'Sabah niyeti', en: 'Morning intention', de: 'Morgenvorsatz', ru: 'Утренний настрой' },
        body: { tr: 'Güne şu cümleyle başla: "Bugün kontrolümde olan tek şey kendi tepkilerimdir." Gün boyunca bir kez daha hatırla.',
                en: 'Begin the day with: "Today the only thing in my control is my own response." Recall it once more during the day.',
                de: 'Beginne den Tag mit: „Heute liegt nur meine eigene Reaktion in meiner Macht.“ Erinnere dich tagsüber noch einmal daran.',
                ru: 'Начни день со слов: «Сегодня в моей власти лишь моя реакция». Вспомни это ещё раз днём.' } },
      { title: { tr: 'Başkalarının görüşü', en: "Others' opinions", de: 'Die Meinung anderer', ru: 'Мнение других' },
        body: { tr: 'Birinin seni eleştirmesi onun kontrolünde; buna nasıl tepki vereceğin senin. Bugün bir eleştiriye sakin kalmayı dene.',
                en: "Someone's criticism is in their control; how you respond is in yours. Today, try staying calm in the face of one criticism.",
                de: 'Die Kritik eines anderen liegt in seiner Macht; wie du reagierst, in deiner. Bleib heute bei einer Kritik ruhig.',
                ru: 'Чужая критика — в их власти; твоя реакция — в твоей. Сегодня сохрани спокойствие в ответ на одну критику.' } },
      { title: { tr: 'Çaba, sonuç değil', en: 'Effort, not outcome', de: 'Mühe, nicht Ergebnis', ru: 'Усилие, не итог' },
        body: { tr: 'Sonuç kontrolünde değil; çaban senin. Bugün bir işte yalnızca elinden gelenin en iyisine odaklan, gerisini bırak.',
                en: 'The outcome is not in your control; your effort is. Today focus only on doing your best at one task, and release the rest.',
                de: 'Das Ergebnis liegt nicht in deiner Macht; deine Mühe schon. Konzentriere dich heute bei einer Aufgabe nur auf dein Bestes.',
                ru: 'Итог не в твоей власти; усилие — да. Сегодня в одном деле сосредоточься лишь на лучшем, что можешь, остальное отпусти.' } },
      { title: { tr: 'Geçmiş ve gelecek', en: 'Past and future', de: 'Vergangenheit und Zukunft', ru: 'Прошлое и будущее' },
        body: { tr: 'Geçmiş geçti, gelecek henüz yok — ikisi de kontrolün dışında. Bugün kaygı geldiğinde kendini şimdiki ana çağır.',
                en: 'The past is gone, the future not yet here — both out of your control. When worry comes today, call yourself back to the present.',
                de: 'Die Vergangenheit ist vorbei, die Zukunft noch nicht da — beides außerhalb deiner Macht. Hol dich heute bei Sorge in die Gegenwart zurück.',
                ru: 'Прошлое ушло, будущего ещё нет — и то и другое вне власти. Сегодня при тревоге возвращай себя в настоящее.' } },
      { title: { tr: 'Öfke anında dur', en: 'Pause in anger', de: 'Innehalten im Zorn', ru: 'Пауза в гневе' },
        body: { tr: 'Öfke, kontrolün dışındaki bir şeye verilen tepkidir. Bugün öfke gelirse harekete geçmeden önce on saniye bekle, nefes al.',
                en: 'Anger is a reaction to something outside your control. If anger comes today, wait ten seconds and breathe before acting.',
                de: 'Zorn ist eine Reaktion auf etwas außerhalb deiner Macht. Warte heute bei Zorn zehn Sekunden und atme, bevor du handelst.',
                ru: 'Гнев — реакция на неподвластное. Сегодня при гневе подожди десять секунд и вдохни, прежде чем действовать.' } },
      { title: { tr: 'Özgürlük', en: 'Freedom', de: 'Freiheit', ru: 'Свобода' },
        body: { tr: 'Gerçek özgürlük, istediğini elde etmek değil; kontrolün dışındakinden korkmamaktır. Bugün bir korkunu bu gözle değerlendir.',
                en: 'True freedom is not getting what you want, but not fearing what is out of your control. View one fear through this lens today.',
                de: 'Wahre Freiheit ist nicht, zu bekommen was du willst, sondern das Unkontrollierbare nicht zu fürchten. Betrachte heute eine Angst so.',
                ru: 'Истинная свобода — не получать желаемое, а не бояться неподвластного. Посмотри сегодня на один свой страх так.' } },
    ],
  },

  // ════════ 7 Günde Sakinlik ════════
  {
    id: 'calm',
    icon: '✦',
    color: 'rgba(196,169,106,0.18)',
    title: { tr: 'İç Sakinlik', en: 'Inner Calm', de: 'Innere Ruhe', ru: 'Внутренний покой' },
    subtitle: { tr: '7 günde dinginlik pratiği', en: 'A 7-day practice of tranquility', de: 'Eine 7-tägige Übung der Gelassenheit', ru: '7-дневная практика спокойствия' },
    days: [
      { title: { tr: 'Şimdiki an', en: 'The present', de: 'Der Augenblick', ru: 'Настоящее' },
        body: { tr: 'Sahip olduğun tek an şu andır. Bugün üç kez durup yalnızca nefesini ve bulunduğun anı fark et.',
                en: 'The only moment you have is now. Three times today, pause and simply notice your breath and this moment.',
                de: 'Der einzige Augenblick, den du hast, ist jetzt. Halte heute dreimal inne und bemerke nur deinen Atem und diesen Moment.',
                ru: 'Единственный твой миг — сейчас. Сегодня трижды остановись и просто заметь дыхание и этот момент.' } },
      { title: { tr: 'Negatif görselleştirme', en: 'Negative visualization', de: 'Negative Visualisierung', ru: 'Негативная визуализация' },
        body: { tr: 'Sahip olduklarını bir an için kaybettiğini hayal et — sonra hâlâ yanında olduklarını gör. Şükran böyle doğar.',
                en: 'Imagine for a moment losing what you have — then see that it is still here. Gratitude is born this way.',
                de: 'Stell dir kurz vor, du verlörest, was du hast — dann sieh, dass es noch da ist. So entsteht Dankbarkeit.',
                ru: 'Представь на миг, что теряешь то, что имеешь, — затем увидь, что оно ещё здесь. Так рождается благодарность.' } },
      { title: { tr: 'Memento Mori', en: 'Memento Mori', de: 'Memento Mori', ru: 'Memento Mori' },
        body: { tr: 'Bir gün bu sona erecek. Bu karamsarlık değil, uyanıklıktır. Bugünü bir hediye gibi yaşa.',
                en: 'One day this will end. That is not gloom but wakefulness. Live today as a gift.',
                de: 'Eines Tages endet dies. Das ist keine Düsternis, sondern Wachheit. Lebe heute als Geschenk.',
                ru: 'Однажды это закончится. Это не уныние, а бодрость. Проживи сегодня как дар.' } },
      { title: { tr: 'Şükran', en: 'Gratitude', de: 'Dankbarkeit', ru: 'Благодарность' },
        body: { tr: 'Bugün sıradan görünen ama aslında değerli üç şeyi say: bir nefes, bir yüz, bir an. Küçük şeyler büyüktür.',
                en: 'Name three things that seem ordinary today but are truly valuable: a breath, a face, a moment. Small things are great.',
                de: 'Nenne drei Dinge, die heute gewöhnlich scheinen, doch wertvoll sind: ein Atemzug, ein Gesicht, ein Moment. Kleines ist groß.',
                ru: 'Назови три вещи, что кажутся обычными, но ценны: вдох, лицо, миг. Малое — велико.' } },
      { title: { tr: 'Amor Fati', en: 'Amor Fati', de: 'Amor Fati', ru: 'Amor Fati' },
        body: { tr: 'Olanı olması gerektiği gibi kabul et. Bugün hoşuna gitmeyen bir şeye "bu beni nasıl güçlendirir?" diye sor.',
                en: 'Accept what happens as it ought to. Today, ask of something you dislike: "How can this make me stronger?"',
                de: 'Nimm an, was geschieht, wie es sein soll. Frage heute bei etwas Unangenehmem: „Wie macht mich das stärker?“',
                ru: 'Прими происходящее как должное. Спроси сегодня о неприятном: «Как это сделает меня сильнее?»' } },
      { title: { tr: 'Premeditatio Malorum', en: 'Premeditatio Malorum', de: 'Premeditatio Malorum', ru: 'Premeditatio Malorum' },
        body: { tr: 'Olası bir zorluğu önceden zihninde prova et. Hazırlıklı zihin sarsılmaz. Bu korku değil, dinginliğin provasıdır.',
                en: 'Mentally rehearse a possible hardship in advance. A prepared mind is unshaken. This is not fear but a rehearsal of calm.',
                de: 'Spiele eine mögliche Schwierigkeit im Geist durch. Ein vorbereiteter Geist bleibt ungerührt. Das ist keine Furcht, sondern eine Probe der Ruhe.',
                ru: 'Заранее проиграй в уме возможную трудность. Подготовленный ум непоколебим. Это не страх, а репетиция покоя.' } },
      { title: { tr: 'İç kale', en: 'The inner citadel', de: 'Die innere Burg', ru: 'Внутренняя крепость' },
        body: { tr: 'Dış dünya ne yaparsa yapsın, içinde kimsenin giremeyeceği bir sığınak var: aklın. Bugün oraya çekil ve dingin kal.',
                en: 'Whatever the outer world does, within you is a refuge none can enter: your mind. Today, withdraw there and stay calm.',
                de: 'Was die äußere Welt auch tut, in dir ist eine Zuflucht, die keiner betreten kann: dein Geist. Zieh dich heute dorthin zurück.',
                ru: 'Что бы ни делал внешний мир, в тебе есть убежище, куда никто не войдёт: твой ум. Сегодня уйди туда и будь спокоен.' } },
    ],
  },
];

export interface ProgramDay { title: string; body: string; }
export interface Program { id: string; icon: string; color: string; title: string; subtitle: string; dayCount: number; days: ProgramDay[]; }

export function getPrograms(lang: Lang): Program[] {
  return PROGRAMS_RAW.map((p) => ({
    id: p.id, icon: p.icon, color: p.color,
    title: p.title[lang], subtitle: p.subtitle[lang], dayCount: p.days.length,
    days: p.days.map((d) => ({ title: d.title[lang], body: d.body[lang] })),
  }));
}

export function getProgram(id: string, lang: Lang): Program | undefined {
  return getPrograms(lang).find((p) => p.id === id);
}

// ─── İlerleme (cihazda) ───────────────────────────────────
const KEY = (id: string) => `stoikos_program_${id}`;

export async function getProgress(id: string): Promise<number[]> {
  const raw = await AsyncStorage.getItem(KEY(id));
  return raw ? JSON.parse(raw) : [];
}

export async function setDayDone(id: string, day: number, done: boolean): Promise<number[]> {
  const cur = new Set(await getProgress(id));
  if (done) cur.add(day);
  else cur.delete(day);
  const arr = [...cur].sort((a, b) => a - b);
  await AsyncStorage.setItem(KEY(id), JSON.stringify(arr));
  return arr;
}
