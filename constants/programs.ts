import type { Lang } from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

type L = Partial<Record<Lang, string>>;
const pick = (l: L, lang: Lang): string => l[lang] ?? l.en ?? l.tr ?? '';
interface RawDay { title: L; body: L; }
interface RawProgram { id: string; icon: string; color: string; title: L; subtitle: L; days: RawDay[]; }

// ─── Program içerikleri ───────────────────────────────────
const PROGRAMS_RAW: RawProgram[] = [
  // ════════ 7 Günde Kontrol Dairesi ════════
  {
    id: 'control',
    icon: '◎',
    color: 'rgba(80,160,120,0.18)',
    title: { tr: 'Kontrol Dairesi', en: 'The Dichotomy of Control', de: 'Die Dichotomie der Kontrolle', ru: 'Дихотомия контроля', fr: 'La dichotomie du contrôle', es: 'La dicotomía del control' },
    subtitle: { tr: '7 günde huzurun temeli', en: 'The foundation of peace in 7 days', de: 'Das Fundament der Ruhe in 7 Tagen', ru: 'Основа покоя за 7 дней', fr: 'Le fondement de la paix en 7 jours', es: 'El fundamento de la paz en 7 días' },
    days: [
      { title: { tr: 'Ayrımı gör', en: 'See the divide', de: 'Erkenne die Trennung', ru: 'Увидь границу', fr: 'Vois la séparation', es: 'Reconoce la división' },
        body: { tr: 'Bugün karşına çıkan her şeyi ikiye ayır: kontrolümde (düşüncelerim, kararlarım) ve kontrolüm dışında (başkaları, sonuçlar). Bir kez fark etmek bile rahatlatır.',
                en: 'Today, split everything you meet into two: in my control (my thoughts, choices) and out of my control (others, outcomes). Even noticing this brings relief.',
                de: 'Teile heute alles, was dir begegnet, in zwei: in meiner Macht (Gedanken, Entscheidungen) und außerhalb (andere, Ergebnisse). Schon das zu bemerken erleichtert.',
                ru: 'Сегодня дели всё на два: в моей власти (мысли, решения) и вне её (другие, итоги). Даже осознание этого приносит облегчение.',
                fr: "Aujourd'hui, partage en deux tout ce que tu rencontres : ce qui dépend de moi (mes pensées, mes choix) et ce qui n'en dépend pas (les autres, les résultats). Le simple fait de le remarquer soulage.",
                es: 'Hoy divide en dos todo lo que encuentres: lo que está en mi control (mis pensamientos, mis decisiones) y lo que no (los demás, los resultados). Solo notarlo ya alivia.' } },
      { title: { tr: 'Sabah niyeti', en: 'Morning intention', de: 'Morgenvorsatz', ru: 'Утренний настрой', fr: 'Intention du matin', es: 'Intención matinal' },
        body: { tr: 'Güne şu cümleyle başla: "Bugün kontrolümde olan tek şey kendi tepkilerimdir." Gün boyunca bir kez daha hatırla.',
                en: 'Begin the day with: "Today the only thing in my control is my own response." Recall it once more during the day.',
                de: 'Beginne den Tag mit: „Heute liegt nur meine eigene Reaktion in meiner Macht.“ Erinnere dich tagsüber noch einmal daran.',
                ru: 'Начни день со слов: «Сегодня в моей власти лишь моя реакция». Вспомни это ещё раз днём.',
                fr: "Commence la journée par : « Aujourd'hui, la seule chose qui dépend de moi, c'est ma propre réaction. » Rappelle-le-toi encore une fois dans la journée.",
                es: 'Empieza el día con: «Hoy lo único que está en mi control es mi propia reacción». Recuérdalo una vez más durante el día.' } },
      { title: { tr: 'Başkalarının görüşü', en: "Others' opinions", de: 'Die Meinung anderer', ru: 'Мнение других', fr: "L'opinion des autres", es: 'La opinión de los demás' },
        body: { tr: 'Birinin seni eleştirmesi onun kontrolünde; buna nasıl tepki vereceğin senin. Bugün bir eleştiriye sakin kalmayı dene.',
                en: "Someone's criticism is in their control; how you respond is in yours. Today, try staying calm in the face of one criticism.",
                de: 'Die Kritik eines anderen liegt in seiner Macht; wie du reagierst, in deiner. Bleib heute bei einer Kritik ruhig.',
                ru: 'Чужая критика — в их власти; твоя реакция — в твоей. Сегодня сохрани спокойствие в ответ на одну критику.',
                fr: "La critique d'un autre dépend de lui ; ta réaction dépend de toi. Aujourd'hui, essaie de rester calme face à une critique.",
                es: 'La crítica de otro está en su control; tu respuesta, en el tuyo. Hoy intenta mantener la calma ante una crítica.' } },
      { title: { tr: 'Çaba, sonuç değil', en: 'Effort, not outcome', de: 'Mühe, nicht Ergebnis', ru: 'Усилие, не итог', fr: "L'effort, pas le résultat", es: 'El esfuerzo, no el resultado' },
        body: { tr: 'Sonuç kontrolünde değil; çaban senin. Bugün bir işte yalnızca elinden gelenin en iyisine odaklan, gerisini bırak.',
                en: 'The outcome is not in your control; your effort is. Today focus only on doing your best at one task, and release the rest.',
                de: 'Das Ergebnis liegt nicht in deiner Macht; deine Mühe schon. Konzentriere dich heute bei einer Aufgabe nur auf dein Bestes.',
                ru: 'Итог не в твоей власти; усилие — да. Сегодня в одном деле сосредоточься лишь на лучшем, что можешь, остальное отпусти.',
                fr: "Le résultat ne dépend pas de toi ; ton effort, si. Aujourd'hui, concentre-toi sur ton mieux dans une seule tâche et lâche le reste.",
                es: 'El resultado no está en tu control; tu esfuerzo sí. Hoy céntrate solo en dar lo mejor en una tarea y suelta lo demás.' } },
      { title: { tr: 'Geçmiş ve gelecek', en: 'Past and future', de: 'Vergangenheit und Zukunft', ru: 'Прошлое и будущее', fr: "Le passé et l'avenir", es: 'El pasado y el futuro' },
        body: { tr: 'Geçmiş geçti, gelecek henüz yok — ikisi de kontrolün dışında. Bugün kaygı geldiğinde kendini şimdiki ana çağır.',
                en: 'The past is gone, the future not yet here — both out of your control. When worry comes today, call yourself back to the present.',
                de: 'Die Vergangenheit ist vorbei, die Zukunft noch nicht da — beides außerhalb deiner Macht. Hol dich heute bei Sorge in die Gegenwart zurück.',
                ru: 'Прошлое ушло, будущего ещё нет — и то и другое вне власти. Сегодня при тревоге возвращай себя в настоящее.',
                fr: "Le passé est parti, l'avenir n'est pas encore là — les deux échappent à ton contrôle. Quand l'inquiétude vient aujourd'hui, ramène-toi au présent.",
                es: 'El pasado se fue, el futuro aún no llega: ambos están fuera de tu control. Cuando hoy llegue la preocupación, vuelve al presente.' } },
      { title: { tr: 'Öfke anında dur', en: 'Pause in anger', de: 'Innehalten im Zorn', ru: 'Пауза в гневе', fr: 'Une pause dans la colère', es: 'Una pausa en la ira' },
        body: { tr: 'Öfke, kontrolün dışındaki bir şeye verilen tepkidir. Bugün öfke gelirse harekete geçmeden önce on saniye bekle, nefes al.',
                en: 'Anger is a reaction to something outside your control. If anger comes today, wait ten seconds and breathe before acting.',
                de: 'Zorn ist eine Reaktion auf etwas außerhalb deiner Macht. Warte heute bei Zorn zehn Sekunden und atme, bevor du handelst.',
                ru: 'Гнев — реакция на неподвластное. Сегодня при гневе подожди десять секунд и вдохни, прежде чем действовать.',
                fr: "La colère est une réaction à ce qui échappe à ton contrôle. Si elle monte aujourd'hui, attends dix secondes et respire avant d'agir.",
                es: 'La ira es una reacción a algo fuera de tu control. Si hoy aparece, espera diez segundos y respira antes de actuar.' } },
      { title: { tr: 'Özgürlük', en: 'Freedom', de: 'Freiheit', ru: 'Свобода', fr: 'La liberté', es: 'La libertad' },
        body: { tr: 'Gerçek özgürlük, istediğini elde etmek değil; kontrolün dışındakinden korkmamaktır. Bugün bir korkunu bu gözle değerlendir.',
                en: 'True freedom is not getting what you want, but not fearing what is out of your control. View one fear through this lens today.',
                de: 'Wahre Freiheit ist nicht, zu bekommen was du willst, sondern das Unkontrollierbare nicht zu fürchten. Betrachte heute eine Angst so.',
                ru: 'Истинная свобода — не получать желаемое, а не бояться неподвластного. Посмотри сегодня на один свой страх так.',
                fr: "La vraie liberté n'est pas d'obtenir ce que tu veux, mais de ne pas craindre ce qui ne dépend pas de toi. Regarde une de tes peurs sous cet angle aujourd'hui.",
                es: 'La verdadera libertad no es conseguir lo que quieres, sino no temer lo que no está en tu control. Mira hoy uno de tus miedos con esa lente.' } },
    ],
  },

  // ════════ 7 Günde Sakinlik ════════
  {
    id: 'calm',
    icon: '✦',
    color: 'rgba(196,169,106,0.18)',
    title: { tr: 'İç Sakinlik', en: 'Inner Calm', de: 'Innere Ruhe', ru: 'Внутренний покой', fr: 'Le calme intérieur', es: 'La calma interior' },
    subtitle: { tr: '7 günde dinginlik pratiği', en: 'A 7-day practice of tranquility', de: 'Eine 7-tägige Übung der Gelassenheit', ru: '7-дневная практика спокойствия', fr: 'Une pratique de 7 jours pour la sérénité', es: 'Una práctica de 7 días para la serenidad' },
    days: [
      { title: { tr: 'Şimdiki an', en: 'The present', de: 'Der Augenblick', ru: 'Настоящее', fr: "L'instant présent", es: 'El momento presente' },
        body: { tr: 'Sahip olduğun tek an şu andır. Bugün üç kez durup yalnızca nefesini ve bulunduğun anı fark et.',
                en: 'The only moment you have is now. Three times today, pause and simply notice your breath and this moment.',
                de: 'Der einzige Augenblick, den du hast, ist jetzt. Halte heute dreimal inne und bemerke nur deinen Atem und diesen Moment.',
                ru: 'Единственный твой миг — сейчас. Сегодня трижды остановись и просто заметь дыхание и этот момент.',
                fr: "Le seul instant que tu possèdes, c'est maintenant. Trois fois aujourd'hui, arrête-toi et remarque simplement ton souffle et ce moment.",
                es: 'El único momento que tienes es ahora. Hoy, tres veces, detente y nota simplemente tu respiración y este instante.' } },
      { title: { tr: 'Negatif görselleştirme', en: 'Negative visualization', de: 'Negative Visualisierung', ru: 'Негативная визуализация', fr: 'Visualisation négative', es: 'Visualización negativa' },
        body: { tr: 'Sahip olduklarını bir an için kaybettiğini hayal et — sonra hâlâ yanında olduklarını gör. Şükran böyle doğar.',
                en: 'Imagine for a moment losing what you have — then see that it is still here. Gratitude is born this way.',
                de: 'Stell dir kurz vor, du verlörest, was du hast — dann sieh, dass es noch da ist. So entsteht Dankbarkeit.',
                ru: 'Представь на миг, что теряешь то, что имеешь, — затем увидь, что оно ещё здесь. Так рождается благодарность.',
                fr: "Imagine un instant perdre ce que tu as — puis vois que c'est encore là. C'est ainsi que naît la gratitude.",
                es: 'Imagina por un momento perder lo que tienes; luego ve que sigue aquí. Así nace la gratitud.' } },
      { title: { tr: 'Memento Mori', en: 'Memento Mori', de: 'Memento Mori', ru: 'Memento Mori', fr: 'Memento Mori', es: 'Memento Mori' },
        body: { tr: 'Bir gün bu sona erecek. Bu karamsarlık değil, uyanıklıktır. Bugünü bir hediye gibi yaşa.',
                en: 'One day this will end. That is not gloom but wakefulness. Live today as a gift.',
                de: 'Eines Tages endet dies. Das ist keine Düsternis, sondern Wachheit. Lebe heute als Geschenk.',
                ru: 'Однажды это закончится. Это не уныние, а бодрость. Проживи сегодня как дар.',
                fr: "Un jour, tout cela prendra fin. Ce n'est pas de la noirceur, mais de l'éveil. Vis cette journée comme un cadeau.",
                es: 'Un día esto terminará. No es pesimismo, sino lucidez. Vive hoy como un regalo.' } },
      { title: { tr: 'Şükran', en: 'Gratitude', de: 'Dankbarkeit', ru: 'Благодарность', fr: 'La gratitude', es: 'La gratitud' },
        body: { tr: 'Bugün sıradan görünen ama aslında değerli üç şeyi say: bir nefes, bir yüz, bir an. Küçük şeyler büyüktür.',
                en: 'Name three things that seem ordinary today but are truly valuable: a breath, a face, a moment. Small things are great.',
                de: 'Nenne drei Dinge, die heute gewöhnlich scheinen, doch wertvoll sind: ein Atemzug, ein Gesicht, ein Moment. Kleines ist groß.',
                ru: 'Назови три вещи, что кажутся обычными, но ценны: вдох, лицо, миг. Малое — велико.',
                fr: "Nomme trois choses qui semblent ordinaires aujourd'hui mais qui sont précieuses : un souffle, un visage, un instant. Les petites choses sont grandes.",
                es: 'Nombra tres cosas que hoy parecen corrientes pero son valiosas: una respiración, un rostro, un instante. Lo pequeño es grande.' } },
      { title: { tr: 'Amor Fati', en: 'Amor Fati', de: 'Amor Fati', ru: 'Amor Fati', fr: 'Amor Fati', es: 'Amor Fati' },
        body: { tr: 'Olanı olması gerektiği gibi kabul et. Bugün hoşuna gitmeyen bir şeye "bu beni nasıl güçlendirir?" diye sor.',
                en: 'Accept what happens as it ought to. Today, ask of something you dislike: "How can this make me stronger?"',
                de: 'Nimm an, was geschieht, wie es sein soll. Frage heute bei etwas Unangenehmem: „Wie macht mich das stärker?“',
                ru: 'Прими происходящее как должное. Спроси сегодня о неприятном: «Как это сделает меня сильнее?»',
                fr: "Accepte ce qui arrive comme il se doit. Aujourd'hui, devant quelque chose qui te déplaît, demande-toi : « En quoi cela peut-il me rendre plus fort ? »",
                es: 'Acepta lo que sucede como debe ser. Hoy, ante algo que no te gusta, pregunta: «¿Cómo puede esto hacerme más fuerte?»' } },
      { title: { tr: 'Premeditatio Malorum', en: 'Premeditatio Malorum', de: 'Premeditatio Malorum', ru: 'Premeditatio Malorum', fr: 'Premeditatio Malorum', es: 'Premeditatio Malorum' },
        body: { tr: 'Olası bir zorluğu önceden zihninde prova et. Hazırlıklı zihin sarsılmaz. Bu korku değil, dinginliğin provasıdır.',
                en: 'Mentally rehearse a possible hardship in advance. A prepared mind is unshaken. This is not fear but a rehearsal of calm.',
                de: 'Spiele eine mögliche Schwierigkeit im Geist durch. Ein vorbereiteter Geist bleibt ungerührt. Das ist keine Furcht, sondern eine Probe der Ruhe.',
                ru: 'Заранее проиграй в уме возможную трудность. Подготовленный ум непоколебим. Это не страх, а репетиция покоя.',
                fr: "Répète mentalement une difficulté possible à l'avance. Un esprit préparé ne vacille pas. Ce n'est pas de la peur, mais une répétition du calme.",
                es: 'Ensaya mentalmente una dificultad posible. Una mente preparada no se tambalea. No es miedo, sino un ensayo de la calma.' } },
      { title: { tr: 'İç kale', en: 'The inner citadel', de: 'Die innere Burg', ru: 'Внутренняя крепость', fr: 'La citadelle intérieure', es: 'La ciudadela interior' },
        body: { tr: 'Dış dünya ne yaparsa yapsın, içinde kimsenin giremeyeceği bir sığınak var: aklın. Bugün oraya çekil ve dingin kal.',
                en: 'Whatever the outer world does, within you is a refuge none can enter: your mind. Today, withdraw there and stay calm.',
                de: 'Was die äußere Welt auch tut, in dir ist eine Zuflucht, die keiner betreten kann: dein Geist. Zieh dich heute dorthin zurück.',
                ru: 'Что бы ни делал внешний мир, в тебе есть убежище, куда никто не войдёт: твой ум. Сегодня уйди туда и будь спокоен.',
                fr: "Quoi que fasse le monde extérieur, il y a en toi un refuge où nul ne peut entrer : ton esprit. Aujourd'hui, retire-toi là et reste serein.",
                es: 'Haga lo que haga el mundo exterior, dentro de ti hay un refugio donde nadie puede entrar: tu mente. Hoy retírate allí y mantén la calma.' } },
    ],
  },
  // ════════ 7 Günde Öfkeyle Çalışmak ════════
  {
    id: 'anger',
    icon: '▲',
    color: 'rgba(198,108,74,0.18)',
    title: { tr: 'Öfkeyle Çalışmak', en: 'Working With Anger', de: 'Mit dem Zorn arbeiten', ru: 'Работа с гневом', fr: 'Travailler avec la colère', es: 'Trabajar con la ira' },
    subtitle: { tr: '7 günde soğukkanlılık', en: 'Composure in 7 days', de: 'Gelassenheit in 7 Tagen', ru: 'Хладнокровие за 7 дней', fr: 'Le sang-froid en 7 jours', es: 'El temple en 7 días' },
    days: [
      { title: { tr: 'Erteleme', en: 'Delay', de: 'Aufschub', ru: 'Отсрочка', fr: 'Le délai', es: 'La demora' },
        body: { tr: 'Öfke geldiğinde tek kural: hemen hiçbir şey yapma. Cevap verme, mesaj yazma, yüzünü çevir ve ona kadar say. Amaç öfkelenmemek değil — öfkeliyken karar vermemek.',
                en: 'When anger comes, one rule: do nothing immediately. Do not reply, do not type, turn away and count to ten. The aim is not to stop feeling angry — it is to stop deciding while angry.',
                de: 'Wenn der Zorn kommt, gilt eine Regel: tu sofort gar nichts. Antworte nicht, schreib nicht, dreh dich weg und zähl bis zehn. Das Ziel ist nicht, nicht zornig zu sein — sondern nicht im Zorn zu entscheiden.',
                ru: 'Когда приходит гнев, правило одно: сразу не делай ничего. Не отвечай, не пиши, отвернись и сосчитай до десяти. Цель не в том, чтобы не злиться, — а в том, чтобы не решать в злости.',
                fr: "Quand la colère vient, une seule règle : ne fais rien tout de suite. Ne réponds pas, n'écris pas, détourne-toi et compte jusqu'à dix. Le but n'est pas de ne plus ressentir la colère, mais de ne plus décider sous son emprise.",
                es: 'Cuando llega la ira, una sola regla: no hagas nada de inmediato. No respondas, no escribas, gírate y cuenta hasta diez. El objetivo no es dejar de sentir ira, sino dejar de decidir con ella.' } },
      { title: { tr: 'İlk darbe senin değil', en: 'The first jolt is not yours', de: 'Der erste Stoß gehört dir nicht', ru: 'Первый толчок не твой', fr: "Le premier choc n'est pas de toi", es: 'El primer golpe no es tuyo' },
        body: { tr: 'Birinin sözüyle içinin kabarması istemsizdir; onu sen seçmedin. Seçtiğin şey bir saniye sonra geliyor: "haklıyım, karşılık vermeliyim." Bugün o ikisinin arasındaki boşluğu fark et.',
                en: 'The surge you feel at someone\'s words is involuntary; you did not choose it. What you choose arrives a second later: "I am right, I must answer back." Today, notice the gap between the two.',
                de: 'Das Aufwallen bei den Worten eines anderen ist unwillkürlich; du hast es nicht gewählt. Was du wählst, kommt eine Sekunde später: „Ich habe recht, ich muss zurückschlagen.“ Bemerke heute den Zwischenraum.',
                ru: 'Волна, которая поднимается от чьих-то слов, непроизвольна; ты её не выбирал. Выбираешь ты то, что приходит секундой позже: «я прав, надо ответить». Сегодня замечай промежуток между ними.',
                fr: "Le sursaut que provoquent les mots d'un autre est involontaire ; tu ne l'as pas choisi. Ce que tu choisis arrive une seconde plus tard : « j'ai raison, je dois répliquer ». Aujourd'hui, remarque l'intervalle entre les deux.",
                es: 'El arrebato que sientes ante las palabras de alguien es involuntario; no lo elegiste. Lo que eliges llega un segundo después: «tengo razón, debo responder». Hoy nota el intervalo entre ambos.' } },
      { title: { tr: 'Altındaki cümle', en: 'The sentence beneath', de: 'Der Satz darunter', ru: 'Фраза под гневом', fr: 'La phrase en dessous', es: 'La frase debajo' },
        body: { tr: 'Her öfkenin altında bir cümle vardır: "bunu bana bilerek yaptı" ya da "bu benim başıma gelmemeliydi." Bugün bir öfkeni yakala ve o cümleyi kelimesi kelimesine yaz. Yazınca küçülür.',
                en: 'Beneath every anger there is a sentence: "they did it to me on purpose" or "this should not have happened to me." Today catch one anger and write that sentence word for word. Written down, it shrinks.',
                de: 'Unter jedem Zorn liegt ein Satz: „Das hat er mir mit Absicht angetan“ oder „Das hätte mir nicht passieren dürfen.“ Fang heute einen Zorn ein und schreib diesen Satz Wort für Wort auf. Aufgeschrieben schrumpft er.',
                ru: 'Под каждым гневом лежит фраза: «он сделал это мне нарочно» или «со мной такого не должно было случиться». Поймай сегодня один гнев и запиши эту фразу дословно. Записанная, она уменьшается.',
                fr: "Sous chaque colère il y a une phrase : « il me l'a fait exprès » ou « cela n'aurait pas dû m'arriver ». Aujourd'hui, attrape une colère et écris cette phrase mot pour mot. Écrite, elle rétrécit.",
                es: 'Debajo de cada ira hay una frase: «me lo hizo a propósito» o «esto no debería haberme pasado». Hoy atrapa una ira y escribe esa frase palabra por palabra. Escrita, se encoge.' } },
      { title: { tr: 'İkinci açıklama', en: 'A second explanation', de: 'Eine zweite Erklärung', ru: 'Второе объяснение', fr: 'Une seconde explication', es: 'Una segunda explicación' },
        body: { tr: 'Dün yazdığın cümleyi al ve kötü niyet içermeyen ikinci bir açıklama üret: yorgundu, bilmiyordu, kendi derdi vardı. Doğru olduğunu kanıtlaman gerekmiyor — mümkün olması yeter.',
                en: "Take yesterday's sentence and produce a second explanation that contains no malice: they were tired, they did not know, they had troubles of their own. You do not have to prove it true — it is enough that it is possible.",
                de: 'Nimm den Satz von gestern und bilde eine zweite Erklärung ohne böse Absicht: er war müde, er wusste es nicht, er hatte eigenen Kummer. Du musst sie nicht beweisen — es genügt, dass sie möglich ist.',
                ru: 'Возьми вчерашнюю фразу и придумай второе объяснение, в котором нет злого умысла: он устал, он не знал, у него своя беда. Доказывать его не нужно — довольно того, что оно возможно.',
                fr: "Reprends la phrase d'hier et produis une seconde explication sans malveillance : il était fatigué, il ne savait pas, il avait ses propres soucis. Tu n'as pas à la prouver — il suffit qu'elle soit possible.",
                es: 'Toma la frase de ayer y produce una segunda explicación sin malicia: estaba cansado, no lo sabía, tenía sus propios problemas. No tienes que demostrarla — basta con que sea posible.' } },
      { title: { tr: 'Bedeli', en: 'The cost', de: 'Der Preis', ru: 'Цена', fr: 'Le coût', es: 'El coste' },
        body: { tr: 'Bugün bir öfkenin faturasını çıkar: kaç saatini aldı, uykunu böldü mü, kime yansıdı. Öfke karşındakini cezalandırmaz; senin saatlerini harcar. Rakamı görmek her tartışmadan ikna edicidir.',
                en: 'Today draw up the bill for one anger: how many hours it took, whether it cost you sleep, who else it landed on. Anger does not punish the other person; it spends your hours. Seeing the number convinces better than any argument.',
                de: 'Stell heute die Rechnung für einen Zorn auf: wie viele Stunden er gekostet hat, ob er dich den Schlaf gekostet hat, wen er sonst noch getroffen hat. Zorn bestraft den anderen nicht; er verbraucht deine Stunden. Die Zahl zu sehen überzeugt mehr als jedes Argument.',
                ru: 'Составь сегодня счёт за один гнев: сколько часов он забрал, отнял ли сон, на кого ещё выплеснулся. Гнев не наказывает другого; он тратит твои часы. Увидеть число убедительнее любого довода.',
                fr: "Aujourd'hui, fais la facture d'une colère : combien d'heures elle a prises, si elle t'a coûté le sommeil, sur qui d'autre elle est retombée. La colère ne punit pas l'autre ; elle dépense tes heures. Voir le chiffre convainc mieux qu'un raisonnement.",
                es: 'Hoy haz la factura de una ira: cuántas horas se llevó, si te quitó el sueño, sobre quién más recayó. La ira no castiga al otro; gasta tus horas. Ver el número convence más que cualquier argumento.' } },
      { title: { tr: 'Sabah hazırlığı', en: 'Morning preparation', de: 'Morgendliche Vorbereitung', ru: 'Утренняя подготовка', fr: 'La préparation du matin', es: 'La preparación matinal' },
        body: { tr: 'Öfke çoğu zaman şaşırmaktan doğar. Bugüne şöyle başla: "Bugün aceleci, kaba, nankör insanlarla karşılaşacağım." Karşılaştığında öfkelenecek bir sürpriz kalmaz.',
                en: 'Anger is usually born of surprise. Begin today like this: "Today I will meet the hasty, the rude, the ungrateful." When you do, there is no surprise left to be angry at.',
                de: 'Zorn entsteht meist aus Überraschung. Beginne den Tag so: „Heute werde ich Hastigen, Groben, Undankbaren begegnen.“ Wenn es dann geschieht, bleibt keine Überraschung, über die du zürnen könntest.',
                ru: 'Гнев чаще всего рождается из неожиданности. Начни день так: «Сегодня я встречу торопливых, грубых, неблагодарных». Когда встретишь — не останется неожиданности, на которую можно злиться.',
                fr: "La colère naît le plus souvent de la surprise. Commence la journée ainsi : « Aujourd'hui je croiserai des gens pressés, grossiers, ingrats. » Quand cela arrive, il ne reste plus de surprise contre laquelle s'emporter.",
                es: 'La ira suele nacer de la sorpresa. Empieza así el día: «Hoy me encontraré con gente apresurada, grosera, ingrata». Cuando ocurra, no quedará sorpresa contra la que enfadarse.' } },
      { title: { tr: 'Akşam muhasebesi', en: 'The evening audit', de: 'Der Abendrückblick', ru: 'Вечерний разбор', fr: 'Le bilan du soir', es: 'El repaso de la noche' },
        body: { tr: 'Seneca her akşam kendine sorardı: bugün hangi kusurumu iyileştirdim? Kendini yargılamadan, bir dost gibi. Bu haftanın öfkelerine bak ve hangisinin küçüldüğünü not et. Bir tane bile küçüldüyse yöntem işliyor.',
                en: "Seneca asked himself every evening: which fault of mine did I heal today? Without judging himself, as a friend would. Look at this week's angers and note which one grew smaller. If even one did, the method is working.",
                de: 'Seneca fragte sich jeden Abend: welchen meiner Fehler habe ich heute geheilt? Ohne sich zu verurteilen, wie ein Freund es täte. Sieh dir die Zornesausbrüche dieser Woche an und halte fest, welcher kleiner geworden ist. Wenn auch nur einer, dann wirkt die Methode.',
                ru: 'Сенека спрашивал себя каждый вечер: какой свой недостаток я сегодня излечил? Не осуждая себя, а по-дружески. Посмотри на гнев этой недели и отметь, какой из них стал меньше. Если хотя бы один — метод работает.',
                fr: "Sénèque se demandait chaque soir : quel défaut ai-je guéri aujourd'hui ? Sans se juger, comme le ferait un ami. Regarde les colères de cette semaine et note laquelle a diminué. S'il y en a ne serait-ce qu'une, la méthode fonctionne.",
                es: 'Séneca se preguntaba cada noche: ¿qué defecto mío curé hoy? Sin juzgarse, como lo haría un amigo. Mira las iras de esta semana y anota cuál se hizo más pequeña. Si al menos una lo hizo, el método funciona.' } },
    ],
  },
];

export interface ProgramDay { title: string; body: string; }
export interface Program { id: string; icon: string; color: string; title: string; subtitle: string; dayCount: number; days: ProgramDay[]; }

export function getPrograms(lang: Lang): Program[] {
  return PROGRAMS_RAW.map((p) => ({
    id: p.id, icon: p.icon, color: p.color,
    title: pick(p.title, lang), subtitle: pick(p.subtitle, lang), dayCount: p.days.length,
    days: p.days.map((d) => ({ title: pick(d.title, lang), body: pick(d.body, lang) })),
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
