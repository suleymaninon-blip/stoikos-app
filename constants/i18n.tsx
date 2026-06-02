import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type Lang = 'tr' | 'en' | 'de' | 'ru';

export const LANG_STORAGE = 'stoikos_lang';

export const LANGUAGES: { code: Lang; label: string; flag: string; locale: string }[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'en', label: 'English', flag: '🇬🇧', locale: 'en-US' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', locale: 'ru-RU' },
];

export function localeOf(lang: Lang): string {
  return LANGUAGES.find((l) => l.code === lang)?.locale || 'en-US';
}

// Pazar=0 ... Cumartesi=6
export const DAY_LABELS: Record<Lang, string[]> = {
  tr: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
};

// ─── UI metinleri ─────────────────────────────────────────
type Dict = Record<string, string>;

const UI: Record<Lang, Dict> = {
  // ════════════ TÜRKÇE ════════════
  tr: {
    'tabs.home': 'Ana', 'tabs.practice': 'Pratik', 'tabs.coach': 'Koç', 'tabs.wisdom': 'Bilgelik', 'tabs.progress': 'İlerleme',
    'unit.min': 'dk',

    'setup.tagline': 'Stoacı Yaşam Rehberi',
    'setup.startTitle': 'Başlamak için',
    'setup.startInfo': 'Stoikos, kişisel AI koçun için Anthropic API key kullanır. Key telefonda güvenli şekilde saklanır, hiçbir sunucuya gönderilmez.',
    'setup.getKey': "→ console.anthropic.com'dan al",
    'setup.keyLabel': 'ANTHROPİC API KEY',
    'setup.errFormat': 'Geçersiz format. Key "sk-ant-" ile başlamalı.',
    'setup.errInvalid': "API key doğrulanamadı. Key'i kontrol et.",
    'setup.verify': 'Doğrula & Başla',
    'setup.secNote': "🔒 Key yalnızca bu cihazda, AsyncStorage'da saklanır.",
    'setup.langLabel': 'DİL',

    'home.morning': 'Sabahın Bilgeliği', 'home.day': 'Günün Bilgeliği', 'home.evening': 'Akşamın Yansıması',
    'home.modules': 'MODÜLLER',
    'home.mod.practice.name': 'Günlük Pratik', 'home.mod.practice.desc': 'Sabah niyeti & akşam yansıması',
    'home.mod.coach.name': 'Stoacı Koç', 'home.mod.coach.desc': 'Düşüncelerini paylaş, rehberlik al',
    'home.mod.wisdom.name': 'Bilgelik', 'home.mod.wisdom.desc': 'Kavramlar & alıntılar',
    'home.mod.progress.name': 'İlerleme', 'home.mod.progress.desc': 'Dönüşüm takibi',
    'home.quoteLabel': 'GÜNÜN ALINTISI',
    'home.streak': 'GÜNLÜK SERİ',
    'home.greetMorn': 'Günaydın, sakin bir başlangıç.', 'home.greetEve': 'İyi akşamlar, biraz yavaşla.',
    'home.today': 'BUGÜN', 'home.continuity': 'SÜREKLİLİK',
    'home.breathTitle': 'Bir an dur', 'home.breathSub': 'Daireyle nefes al · dokun & genişlet',
    'breathe.inhale': 'Nefes al', 'breathe.hold': 'Tut', 'breathe.exhale': 'Ver',
    'breathe.sub': 'Kutu nefesi · 4-4-4-4', 'breathe.hint': 'Hazır olduğunda kapat',

    'practice.title': 'Günlük Pratik', 'practice.morningSub': 'Sabah egzersizleri', 'practice.eveningSub': 'Akşam yansıması',
    'practice.todayProgress': 'BUGÜNKÜ YOLCULUK', 'practice.allDone': '✦ Tüm pratikler tamamlandı — iyi iş!',
    'practice.calmTitle': 'Güne niyetle başla.',
    'practice.closeQuote': 'Bir adım da bir yolculuktur.', 'practice.closeSub': 'Hepsini bugün yapman gerekmiyor.',
    'practice.morningTag': 'SABAH', 'practice.morningTitle': 'Güne Başlarken',
    'practice.eveningTag': 'AKŞAM', 'practice.eveningTitle': 'Günü Kapatırken',
    'practice.journalTag': 'GÜNLÜK YANSIMA',
    'practice.journalHint': 'Bugün ne hissettin? Ne öğrendin? Stoacı bir perspektifle yaz.',
    'practice.journalPlaceholder': 'Bugünkü düşüncelerini buraya yaz...',
    'practice.save': 'Kaydet', 'practice.saved': '✓ Kaydedildi',
    'practice.conceptTag': 'GÜNÜN KAVRAMI',
    'practice.intro': 'Her egzersiz birkaç dakika. Acelesi yok — birini seç, oku, uygula.',
    'practice.complete': '✓ Tamamladım',
    'practice.undo': '↩ Geri al',
    'practice.done': 'Tamamlandı',
    'practice.tapHint': 'Dokun →',

    'coach.title': 'Stoacı Koç', 'coach.active': 'Yanında', 'coach.subtitle': "Epiktetos'un bilgeliğiyle, acele etmeden",
    'coach.autoOn': '🔊 Sesli Okuma: Açık', 'coach.autoOff': '🔇 Sesli Okuma: Kapalı',
    'coach.listen': 'Dinle', 'coach.stop': 'Durdur', 'coach.reset': 'Sıfırla',
    'coach.topics': 'DİLERSEN ŞUNU DA KONUŞABİLİRİZ', 'coach.inputLabel': 'İÇİNDEN GEÇENİ YAZ', 'coach.placeholder': 'Acele yok, hazır olduğunda…',
    'coach.connError': 'Bağlantı hatası oluştu. Lütfen tekrar dene.',

    'wisdom.title': 'Antik öğretiler, bugünün hayatı.', 'wisdom.subtitle': 'Acele etme. Bir alıntıyı oku, bırak otursun.',
    'wisdom.tabQuotes': 'Alıntılar', 'wisdom.tabConcepts': 'Kavramlar', 'wisdom.all': 'Tümü',
    'wisdom.more': 'Daha fazla →', 'wisdom.exampleLabel': 'ÖRNEK', 'wisdom.close': 'Kapat',

    'progress.title': 'Yolun, sessizce birikiyor.', 'progress.subtitle': 'Rakamlar bir yarış değil — sadece yürüdüğün yolun izi.',
    'progress.streak': 'GÜN ÜST ÜSTE', 'progress.streakUnit': 'gün',
    'progress.thisWeek': 'BU HAFTA PRATİK', 'progress.weekUnit': 'pratik',
    'progress.totalMoments': 'TOPLAM AN',
    'progress.reflectionSub': 'Boş günler de yolun parçası. Bugün geri döndün — yeten bu.',
    'progress.avg': 'Günlük Ort.', 'progress.avgUnit': 'pratik/gün',
    'progress.bestDay': 'EN İYİ GÜN', 'progress.bestDayValue': '{day} — {count} pratik',
    'progress.last7': 'SON 7 GÜN', 'progress.exBreakdown': 'EGZERSİZ DAĞILIMI',
    'progress.motivQuote': 'Önemli olan ne kadar uzun yaşadığın değil, nasıl yaşadığındır.',
    'progress.motivAuthor': '— Seneca',
    'progress.changeKey': '🔑 API Key Değiştir',
    'progress.resetTitle': 'API Key Sıfırla', 'progress.resetMsg': 'Mevcut key silinecek ve kurulum ekranına döneceksin.',
    'progress.cancel': 'İptal', 'progress.reset': 'Sıfırla',
    'progress.langLabel': '🌐 Dil',
    'voice.title': '🎙️ Doğal Ses (ElevenLabs)',
    'voice.hint': 'Koçun sesini gerçek insan sesine çevir. Opsiyonel — ElevenLabs API anahtarı gerekir.',
    'voice.getKey': "→ elevenlabs.io'dan anahtar al",
    'voice.placeholder': 'ElevenLabs API anahtarı',
    'voice.save': 'Kaydet',
    'voice.saving': 'Doğrulanıyor…',
    'voice.saved': '✓ Doğal ses açık',
    'voice.clear': 'Kaldır',
    'voice.errInvalid': 'Anahtar doğrulanamadı.',
    'voice.voiceLabel': 'SES',
    'notify.title': 'Nazik hatırlatıcılar',
    'notify.hint': 'Sabah (09:00) ve akşam (21:00) için yumuşak bir dokunuş.',
    'notify.on': 'Açık',
    'notify.off': 'Kapalı',
    'notify.denied': 'Bildirim izni verilmedi. Telefon ayarlarından açabilirsin.',
    'programs.title': 'Programlar',
    'programs.subtitle': 'Çok günlük Stoacı yolculuklar',
    'programs.cardName': 'Programlar',
    'programs.cardDesc': 'Rehberli çok günlük yolculuklar',
    'programs.day': 'Gün',
    'programs.dayOf': 'Gün {n}/{total}',
    'programs.progress': '{done}/{total} gün',
    'programs.start': 'Başla',
    'programs.continue': 'Devam et',
    'programs.review': 'Gözden geçir',
    'programs.locked': 'Önceki günü tamamla',
    'programs.complete': '✓ Bu günü tamamla',
    'programs.undo': '↩ Geri al',
    'programs.done': 'Tamamlandı',
    'programs.finished': '✦ Bu yolculuğu tamamladın!',
    'memory.resetBtn': '🧠 Koç hafızasını sıfırla',
    'memory.resetTitle': 'Hafızayı Sıfırla',
    'memory.resetMsg': 'Koçun seninle ilgili hatırladığı her şey silinecek.',
    'share.button': 'Paylaş',
    'share.title': 'Alıntıyı Paylaş',
    'wisdom.favorites': 'Favoriler',
    'ch.cardName': 'Meydan Okuma', 'ch.cardDesc': 'Kendi Stoacı sözünü yaz & oyla',
    'ch.title': 'Meydan Okuma', 'ch.subtitle': 'Topluluğun Stoacı sözleri',
    'ch.top': 'En Beğenilenler', 'ch.new': 'Yeni', 'ch.write': '+ Söz Yaz',
    'ch.empty': 'Henüz söz yok. İlk yazan sen ol!',
    'ch.writeTitle': 'Stoacı Sözünü Yaz', 'ch.placeholder': 'Kendi özlü sözün...',
    'ch.authorPlaceholder': 'İsim (opsiyonel)', 'ch.submit': 'Gönder', 'ch.sending': 'Gönderiliyor…',
    'ch.pending': '✓ Sözün alındı! Onaylandıktan sonra listede görünecek.',
    'ch.rejected': 'Söz uygun bulunmadı:', 'ch.anon': 'Bir Stoacı',
    'ch.hint': 'En çok beğeni alan sözler zirveye çıkar. İlk 10 paylaşılabilir, ilk 3 ödül kazanır!',
    'ch.approve': 'Onayla', 'ch.reject': 'Reddet', 'ch.adminTitle': 'Onay Kuyruğu', 'ch.adminEmpty': 'Bekleyen söz yok.',
    'admin.title': '🛠️ Yönetici', 'admin.hint': 'Onay kuyruğu için yönetici parolası (yalnızca sahibi).',
    'admin.placeholder': 'Yönetici parolası', 'admin.open': 'Onay Kuyruğunu Aç',
  },

  // ════════════ ENGLISH ════════════
  en: {
    'tabs.home': 'Home', 'tabs.practice': 'Practice', 'tabs.coach': 'Coach', 'tabs.wisdom': 'Wisdom', 'tabs.progress': 'Progress',
    'unit.min': 'min',

    'setup.tagline': 'Your Stoic Life Guide',
    'setup.startTitle': 'To get started',
    'setup.startInfo': 'Stoikos uses an Anthropic API key for your personal AI coach. The key is stored securely on your phone and never sent to any server.',
    'setup.getKey': '→ Get one at console.anthropic.com',
    'setup.keyLabel': 'ANTHROPIC API KEY',
    'setup.errFormat': 'Invalid format. The key must start with "sk-ant-".',
    'setup.errInvalid': 'Could not verify the API key. Please check it.',
    'setup.verify': 'Verify & Begin',
    'setup.secNote': '🔒 The key is stored only on this device, in AsyncStorage.',
    'setup.langLabel': 'LANGUAGE',

    'home.morning': "Morning's Wisdom", 'home.day': "Today's Wisdom", 'home.evening': "Evening's Reflection",
    'home.modules': 'MODULES',
    'home.mod.practice.name': 'Daily Practice', 'home.mod.practice.desc': 'Morning intention & evening reflection',
    'home.mod.coach.name': 'Stoic Coach', 'home.mod.coach.desc': 'Share your thoughts, get guidance',
    'home.mod.wisdom.name': 'Wisdom', 'home.mod.wisdom.desc': 'Concepts & quotes',
    'home.mod.progress.name': 'Progress', 'home.mod.progress.desc': 'Track your transformation',
    'home.quoteLabel': 'QUOTE OF THE DAY',
    'home.streak': 'DAILY STREAK',
    'home.greetMorn': 'Good morning, a calm beginning.', 'home.greetEve': 'Good evening, slow down a little.',
    'home.today': 'TODAY', 'home.continuity': 'CONTINUITY',
    'home.breathTitle': 'Pause for a moment', 'home.breathSub': 'Breathe with the circle · tap to expand',
    'breathe.inhale': 'Breathe in', 'breathe.hold': 'Hold', 'breathe.exhale': 'Breathe out',
    'breathe.sub': 'Box breathing · 4-4-4-4', 'breathe.hint': 'Close when you are ready',

    'practice.title': 'Daily Practice', 'practice.morningSub': 'Morning exercises', 'practice.eveningSub': 'Evening reflection',
    'practice.todayProgress': "TODAY'S JOURNEY", 'practice.allDone': '✦ All practices complete — well done!',
    'practice.calmTitle': 'Begin the day with intention.',
    'practice.closeQuote': 'A single step is also a journey.', 'practice.closeSub': "You don't have to do it all today.",
    'practice.morningTag': 'MORNING', 'practice.morningTitle': 'Starting the Day',
    'practice.eveningTag': 'EVENING', 'practice.eveningTitle': 'Closing the Day',
    'practice.journalTag': 'DAILY REFLECTION',
    'practice.journalHint': 'How did you feel today? What did you learn? Write with a Stoic perspective.',
    'practice.journalPlaceholder': "Write today's thoughts here...",
    'practice.save': 'Save', 'practice.saved': '✓ Saved',
    'practice.conceptTag': 'CONCEPT OF THE DAY',
    'practice.intro': 'Each exercise takes a few minutes. No rush — pick one, read, apply.',
    'practice.complete': '✓ Mark as done',
    'practice.undo': '↩ Undo',
    'practice.done': 'Done',
    'practice.tapHint': 'Tap →',

    'coach.title': 'Stoic Coach', 'coach.active': 'With you', 'coach.subtitle': 'With the wisdom of Epictetus, unhurried',
    'coach.autoOn': '🔊 Read Aloud: On', 'coach.autoOff': '🔇 Read Aloud: Off',
    'coach.listen': 'Listen', 'coach.stop': 'Stop', 'coach.reset': 'Reset',
    'coach.topics': 'WE COULD ALSO TALK ABOUT', 'coach.inputLabel': 'WRITE WHAT IS ON YOUR MIND', 'coach.placeholder': 'No rush, whenever you are ready…',
    'coach.connError': 'A connection error occurred. Please try again.',

    'wisdom.title': "Ancient teachings, today's life.", 'wisdom.subtitle': "Don't rush. Read a quote, let it settle.",
    'wisdom.tabQuotes': 'Quotes', 'wisdom.tabConcepts': 'Concepts', 'wisdom.all': 'All',
    'wisdom.more': 'Read more →', 'wisdom.exampleLabel': 'EXAMPLE', 'wisdom.close': 'Close',

    'progress.title': 'Your path quietly builds.', 'progress.subtitle': "Numbers aren't a race — just the trace of the road you walked.",
    'progress.streak': 'DAYS IN A ROW', 'progress.streakUnit': 'days',
    'progress.thisWeek': 'THIS WEEK', 'progress.weekUnit': 'practices',
    'progress.totalMoments': 'TOTAL MOMENTS',
    'progress.reflectionSub': 'Empty days are part of the path too. You came back today — that is enough.',
    'progress.avg': 'Daily Avg.', 'progress.avgUnit': 'practices/day',
    'progress.bestDay': 'BEST DAY', 'progress.bestDayValue': '{day} — {count} practices',
    'progress.last7': 'LAST 7 DAYS', 'progress.exBreakdown': 'EXERCISE BREAKDOWN',
    'progress.motivQuote': 'It is not how long you live that matters, but how well.',
    'progress.motivAuthor': '— Seneca',
    'progress.changeKey': '🔑 Change API Key',
    'progress.resetTitle': 'Reset API Key', 'progress.resetMsg': 'The current key will be deleted and you will return to the setup screen.',
    'progress.cancel': 'Cancel', 'progress.reset': 'Reset',
    'progress.langLabel': '🌐 Language',
    'voice.title': '🎙️ Natural Voice (ElevenLabs)',
    'voice.hint': "Turn the coach's voice into a real human voice. Optional — requires an ElevenLabs API key.",
    'voice.getKey': '→ Get a key at elevenlabs.io',
    'voice.placeholder': 'ElevenLabs API key',
    'voice.save': 'Save',
    'voice.saving': 'Verifying…',
    'voice.saved': '✓ Natural voice on',
    'voice.clear': 'Remove',
    'voice.errInvalid': 'Could not verify the key.',
    'voice.voiceLabel': 'VOICE',
    'notify.title': 'Gentle reminders',
    'notify.hint': 'A soft touch for morning (09:00) and evening (21:00).',
    'notify.on': 'On',
    'notify.off': 'Off',
    'notify.denied': 'Notification permission was denied. You can enable it in phone settings.',
    'programs.title': 'Programs',
    'programs.subtitle': 'Multi-day Stoic journeys',
    'programs.cardName': 'Programs',
    'programs.cardDesc': 'Guided multi-day journeys',
    'programs.day': 'Day',
    'programs.dayOf': 'Day {n}/{total}',
    'programs.progress': '{done}/{total} days',
    'programs.start': 'Start',
    'programs.continue': 'Continue',
    'programs.review': 'Review',
    'programs.locked': 'Complete the previous day',
    'programs.complete': '✓ Complete this day',
    'programs.undo': '↩ Undo',
    'programs.done': 'Completed',
    'programs.finished': '✦ You completed this journey!',
    'memory.resetBtn': '🧠 Reset coach memory',
    'memory.resetTitle': 'Reset Memory',
    'memory.resetMsg': 'Everything the coach remembers about you will be deleted.',
    'share.button': 'Share',
    'share.title': 'Share Quote',
    'wisdom.favorites': 'Favorites',
    'ch.cardName': 'Challenge', 'ch.cardDesc': 'Write & vote your own Stoic maxim',
    'ch.title': 'Challenge', 'ch.subtitle': "The community's Stoic maxims",
    'ch.top': 'Top Rated', 'ch.new': 'New', 'ch.write': '+ Write',
    'ch.empty': 'No maxims yet. Be the first!',
    'ch.writeTitle': 'Write Your Stoic Maxim', 'ch.placeholder': 'Your own maxim...',
    'ch.authorPlaceholder': 'Name (optional)', 'ch.submit': 'Submit', 'ch.sending': 'Sending…',
    'ch.pending': '✓ Received! It will appear once approved.',
    'ch.rejected': 'Not approved:', 'ch.anon': 'A Stoic',
    'ch.hint': 'Most-liked maxims rise to the top. Top 10 are shareable, top 3 win prizes!',
    'ch.approve': 'Approve', 'ch.reject': 'Reject', 'ch.adminTitle': 'Approval Queue', 'ch.adminEmpty': 'No pending maxims.',
    'admin.title': '🛠️ Admin', 'admin.hint': 'Admin password for the approval queue (owner only).',
    'admin.placeholder': 'Admin password', 'admin.open': 'Open Approval Queue',
  },

  // ════════════ DEUTSCH ════════════
  de: {
    'tabs.home': 'Start', 'tabs.practice': 'Praxis', 'tabs.coach': 'Coach', 'tabs.wisdom': 'Weisheit', 'tabs.progress': 'Fortschritt',
    'unit.min': 'Min',

    'setup.tagline': 'Dein stoischer Lebensbegleiter',
    'setup.startTitle': 'Um zu beginnen',
    'setup.startInfo': 'Stoikos verwendet einen Anthropic-API-Schlüssel für deinen persönlichen KI-Coach. Der Schlüssel wird sicher auf deinem Gerät gespeichert und an keinen Server gesendet.',
    'setup.getKey': '→ Auf console.anthropic.com holen',
    'setup.keyLabel': 'ANTHROPIC-API-SCHLÜSSEL',
    'setup.errFormat': 'Ungültiges Format. Der Schlüssel muss mit „sk-ant-“ beginnen.',
    'setup.errInvalid': 'Der API-Schlüssel konnte nicht überprüft werden. Bitte prüfen.',
    'setup.verify': 'Prüfen & Starten',
    'setup.secNote': '🔒 Der Schlüssel wird nur auf diesem Gerät im AsyncStorage gespeichert.',
    'setup.langLabel': 'SPRACHE',

    'home.morning': 'Weisheit des Morgens', 'home.day': 'Weisheit des Tages', 'home.evening': 'Reflexion des Abends',
    'home.modules': 'MODULE',
    'home.mod.practice.name': 'Tägliche Praxis', 'home.mod.practice.desc': 'Morgenvorsatz & Abendreflexion',
    'home.mod.coach.name': 'Stoischer Coach', 'home.mod.coach.desc': 'Teile deine Gedanken, erhalte Führung',
    'home.mod.wisdom.name': 'Weisheit', 'home.mod.wisdom.desc': 'Begriffe & Zitate',
    'home.mod.progress.name': 'Fortschritt', 'home.mod.progress.desc': 'Verfolge deine Wandlung',
    'home.quoteLabel': 'ZITAT DES TAGES',
    'home.streak': 'TÄGLICHE SERIE',
    'home.greetMorn': 'Guten Morgen, ein ruhiger Anfang.', 'home.greetEve': 'Guten Abend, werde etwas langsamer.',
    'home.today': 'HEUTE', 'home.continuity': 'KONTINUITÄT',
    'home.breathTitle': 'Halte einen Moment inne', 'home.breathSub': 'Atme mit dem Kreis · zum Öffnen tippen',
    'breathe.inhale': 'Einatmen', 'breathe.hold': 'Halten', 'breathe.exhale': 'Ausatmen',
    'breathe.sub': 'Box-Atmung · 4-4-4-4', 'breathe.hint': 'Schließe, wenn du bereit bist',

    'practice.title': 'Tägliche Praxis', 'practice.morningSub': 'Morgenübungen', 'practice.eveningSub': 'Abendreflexion',
    'practice.todayProgress': 'HEUTIGE REISE', 'practice.allDone': '✦ Alle Übungen abgeschlossen — gut gemacht!',
    'practice.calmTitle': 'Beginne den Tag mit Absicht.',
    'practice.closeQuote': 'Auch ein einzelner Schritt ist eine Reise.', 'practice.closeSub': 'Du musst nicht alles heute schaffen.',
    'practice.morningTag': 'MORGEN', 'practice.morningTitle': 'In den Tag starten',
    'practice.eveningTag': 'ABEND', 'practice.eveningTitle': 'Den Tag abschließen',
    'practice.journalTag': 'TÄGLICHE REFLEXION',
    'practice.journalHint': 'Wie hast du dich heute gefühlt? Was hast du gelernt? Schreibe aus stoischer Sicht.',
    'practice.journalPlaceholder': 'Schreibe hier deine heutigen Gedanken...',
    'practice.save': 'Speichern', 'practice.saved': '✓ Gespeichert',
    'practice.conceptTag': 'BEGRIFF DES TAGES',
    'practice.intro': 'Jede Übung dauert nur wenige Minuten. Keine Eile — wähle eine, lies, wende an.',
    'practice.complete': '✓ Als erledigt markieren',
    'practice.undo': '↩ Rückgängig',
    'practice.done': 'Erledigt',
    'practice.tapHint': 'Tippen →',

    'coach.title': 'Stoischer Coach', 'coach.active': 'Für dich da', 'coach.subtitle': 'Mit der Weisheit Epiktets, ohne Eile',
    'coach.autoOn': '🔊 Vorlesen: Ein', 'coach.autoOff': '🔇 Vorlesen: Aus',
    'coach.listen': 'Anhören', 'coach.stop': 'Stopp', 'coach.reset': 'Zurücksetzen',
    'coach.topics': 'WIR KÖNNTEN AUCH DARÜBER SPRECHEN', 'coach.inputLabel': 'SCHREIB, WAS DICH BEWEGT', 'coach.placeholder': 'Keine Eile, wenn du bereit bist…',
    'coach.connError': 'Es ist ein Verbindungsfehler aufgetreten. Bitte versuche es erneut.',

    'wisdom.title': 'Antike Lehren, das Leben von heute.', 'wisdom.subtitle': 'Keine Eile. Lies ein Zitat, lass es wirken.',
    'wisdom.tabQuotes': 'Zitate', 'wisdom.tabConcepts': 'Begriffe', 'wisdom.all': 'Alle',
    'wisdom.more': 'Mehr lesen →', 'wisdom.exampleLabel': 'BEISPIEL', 'wisdom.close': 'Schließen',

    'progress.title': 'Dein Weg wächst still.', 'progress.subtitle': 'Zahlen sind kein Wettlauf — nur die Spur des Weges, den du gingst.',
    'progress.streak': 'TAGE IN FOLGE', 'progress.streakUnit': 'Tage',
    'progress.thisWeek': 'DIESE WOCHE', 'progress.weekUnit': 'Übungen',
    'progress.totalMoments': 'MOMENTE GESAMT',
    'progress.reflectionSub': 'Auch leere Tage gehören zum Weg. Heute bist du zurückgekehrt — das genügt.',
    'progress.avg': 'Tagesschnitt', 'progress.avgUnit': 'Übungen/Tag',
    'progress.bestDay': 'BESTER TAG', 'progress.bestDayValue': '{day} — {count} Übungen',
    'progress.last7': 'LETZTE 7 TAGE', 'progress.exBreakdown': 'ÜBUNGSVERTEILUNG',
    'progress.motivQuote': 'Es kommt nicht darauf an, wie lange du lebst, sondern wie gut.',
    'progress.motivAuthor': '— Seneca',
    'progress.changeKey': '🔑 API-Schlüssel ändern',
    'progress.resetTitle': 'API-Schlüssel zurücksetzen', 'progress.resetMsg': 'Der aktuelle Schlüssel wird gelöscht und du kehrst zum Einrichtungsbildschirm zurück.',
    'progress.cancel': 'Abbrechen', 'progress.reset': 'Zurücksetzen',
    'progress.langLabel': '🌐 Sprache',
    'voice.title': '🎙️ Natürliche Stimme (ElevenLabs)',
    'voice.hint': 'Verwandle die Stimme des Coaches in eine echte menschliche Stimme. Optional — erfordert einen ElevenLabs-API-Schlüssel.',
    'voice.getKey': '→ Schlüssel auf elevenlabs.io holen',
    'voice.placeholder': 'ElevenLabs-API-Schlüssel',
    'voice.save': 'Speichern',
    'voice.saving': 'Wird geprüft…',
    'voice.saved': '✓ Natürliche Stimme an',
    'voice.clear': 'Entfernen',
    'voice.errInvalid': 'Schlüssel konnte nicht überprüft werden.',
    'voice.voiceLabel': 'STIMME',
    'notify.title': 'Sanfte Erinnerungen',
    'notify.hint': 'Eine sanfte Berührung für morgens (09:00) und abends (21:00).',
    'notify.on': 'Ein',
    'notify.off': 'Aus',
    'notify.denied': 'Benachrichtigungserlaubnis verweigert. Du kannst sie in den Einstellungen aktivieren.',
    'programs.title': 'Programme',
    'programs.subtitle': 'Mehrtägige stoische Reisen',
    'programs.cardName': 'Programme',
    'programs.cardDesc': 'Geführte mehrtägige Reisen',
    'programs.day': 'Tag',
    'programs.dayOf': 'Tag {n}/{total}',
    'programs.progress': '{done}/{total} Tage',
    'programs.start': 'Starten',
    'programs.continue': 'Fortsetzen',
    'programs.review': 'Ansehen',
    'programs.locked': 'Schließe den vorigen Tag ab',
    'programs.complete': '✓ Diesen Tag abschließen',
    'programs.undo': '↩ Rückgängig',
    'programs.done': 'Abgeschlossen',
    'programs.finished': '✦ Du hast diese Reise abgeschlossen!',
    'memory.resetBtn': '🧠 Coach-Gedächtnis zurücksetzen',
    'memory.resetTitle': 'Gedächtnis zurücksetzen',
    'memory.resetMsg': 'Alles, was der Coach über dich weiß, wird gelöscht.',
    'share.button': 'Teilen',
    'share.title': 'Zitat teilen',
    'wisdom.favorites': 'Favoriten',
    'ch.cardName': 'Herausforderung', 'ch.cardDesc': 'Schreibe & wähle eigene stoische Maximen',
    'ch.title': 'Herausforderung', 'ch.subtitle': 'Stoische Maximen der Community',
    'ch.top': 'Beliebteste', 'ch.new': 'Neu', 'ch.write': '+ Schreiben',
    'ch.empty': 'Noch keine Maximen. Sei der Erste!',
    'ch.writeTitle': 'Schreibe deine stoische Maxime', 'ch.placeholder': 'Deine eigene Maxime...',
    'ch.authorPlaceholder': 'Name (optional)', 'ch.submit': 'Senden', 'ch.sending': 'Senden…',
    'ch.pending': '✓ Erhalten! Erscheint nach Freigabe.',
    'ch.rejected': 'Nicht freigegeben:', 'ch.anon': 'Ein Stoiker',
    'ch.hint': 'Beliebteste Maximen steigen nach oben. Top 10 teilbar, Top 3 gewinnen Preise!',
    'ch.approve': 'Freigeben', 'ch.reject': 'Ablehnen', 'ch.adminTitle': 'Freigabe-Warteschlange', 'ch.adminEmpty': 'Keine ausstehenden Maximen.',
    'admin.title': '🛠️ Admin', 'admin.hint': 'Admin-Passwort für die Freigabe (nur Eigentümer).',
    'admin.placeholder': 'Admin-Passwort', 'admin.open': 'Freigabe öffnen',
  },

  // ════════════ РУССКИЙ ════════════
  ru: {
    'tabs.home': 'Главная', 'tabs.practice': 'Практика', 'tabs.coach': 'Коуч', 'tabs.wisdom': 'Мудрость', 'tabs.progress': 'Прогресс',
    'unit.min': 'мин',

    'setup.tagline': 'Ваш стоический путеводитель',
    'setup.startTitle': 'Чтобы начать',
    'setup.startInfo': 'Stoikos использует ключ API Anthropic для вашего личного ИИ-коуча. Ключ надёжно хранится на телефоне и не отправляется ни на один сервер.',
    'setup.getKey': '→ Получить на console.anthropic.com',
    'setup.keyLabel': 'КЛЮЧ API ANTHROPIC',
    'setup.errFormat': 'Неверный формат. Ключ должен начинаться с «sk-ant-».',
    'setup.errInvalid': 'Не удалось проверить ключ API. Проверьте его.',
    'setup.verify': 'Проверить и начать',
    'setup.secNote': '🔒 Ключ хранится только на этом устройстве, в AsyncStorage.',
    'setup.langLabel': 'ЯЗЫК',

    'home.morning': 'Утренняя мудрость', 'home.day': 'Мудрость дня', 'home.evening': 'Вечернее размышление',
    'home.modules': 'МОДУЛИ',
    'home.mod.practice.name': 'Ежедневная практика', 'home.mod.practice.desc': 'Утренний настрой и вечерняя рефлексия',
    'home.mod.coach.name': 'Стоический коуч', 'home.mod.coach.desc': 'Поделись мыслями, получи наставление',
    'home.mod.wisdom.name': 'Мудрость', 'home.mod.wisdom.desc': 'Понятия и цитаты',
    'home.mod.progress.name': 'Прогресс', 'home.mod.progress.desc': 'Отслеживайте преображение',
    'home.quoteLabel': 'ЦИТАТА ДНЯ',
    'home.streak': 'ЕЖЕДНЕВНАЯ СЕРИЯ',
    'home.greetMorn': 'Доброе утро, спокойное начало.', 'home.greetEve': 'Добрый вечер, немного замедлись.',
    'home.today': 'СЕГОДНЯ', 'home.continuity': 'НЕПРЕРЫВНОСТЬ',
    'home.breathTitle': 'Остановись на миг', 'home.breathSub': 'Дыши с кругом · нажми, чтобы открыть',
    'breathe.inhale': 'Вдох', 'breathe.hold': 'Задержка', 'breathe.exhale': 'Выдох',
    'breathe.sub': 'Дыхание по квадрату · 4-4-4-4', 'breathe.hint': 'Закрой, когда будешь готов',

    'practice.title': 'Ежедневная практика', 'practice.morningSub': 'Утренние упражнения', 'practice.eveningSub': 'Вечернее размышление',
    'practice.todayProgress': 'ПУТЬ НА СЕГОДНЯ', 'practice.allDone': '✦ Все практики выполнены — отличная работа!',
    'practice.calmTitle': 'Начни день с намерения.',
    'practice.closeQuote': 'Один шаг — это тоже путь.', 'practice.closeSub': 'Не обязательно делать всё сегодня.',
    'practice.morningTag': 'УТРО', 'practice.morningTitle': 'Начало дня',
    'practice.eveningTag': 'ВЕЧЕР', 'practice.eveningTitle': 'Завершение дня',
    'practice.journalTag': 'ЕЖЕДНЕВНАЯ РЕФЛЕКСИЯ',
    'practice.journalHint': 'Что вы чувствовали сегодня? Чему научились? Пишите со стоической точки зрения.',
    'practice.journalPlaceholder': 'Запишите здесь свои сегодняшние мысли...',
    'practice.save': 'Сохранить', 'practice.saved': '✓ Сохранено',
    'practice.conceptTag': 'ПОНЯТИЕ ДНЯ',
    'practice.intro': 'Каждое упражнение — пара минут. Не спеши — выбери одно, прочти, примени.',
    'practice.complete': '✓ Отметить',
    'practice.undo': '↩ Отменить',
    'practice.done': 'Готово',
    'practice.tapHint': 'Нажми →',

    'coach.title': 'Стоический коуч', 'coach.active': 'Рядом', 'coach.subtitle': 'С мудростью Эпиктета, не спеша',
    'coach.autoOn': '🔊 Озвучка: Вкл', 'coach.autoOff': '🔇 Озвучка: Выкл',
    'coach.listen': 'Слушать', 'coach.stop': 'Стоп', 'coach.reset': 'Сброс',
    'coach.topics': 'МОЖЕМ ПОГОВОРИТЬ И ОБ ЭТОМ', 'coach.inputLabel': 'НАПИШИ, ЧТО НА ДУШЕ', 'coach.placeholder': 'Не спеши, когда будешь готов…',
    'coach.connError': 'Произошла ошибка соединения. Попробуйте ещё раз.',

    'wisdom.title': 'Древние учения, сегодняшняя жизнь.', 'wisdom.subtitle': 'Не спеши. Прочти цитату, дай ей осесть.',
    'wisdom.tabQuotes': 'Цитаты', 'wisdom.tabConcepts': 'Понятия', 'wisdom.all': 'Все',
    'wisdom.more': 'Подробнее →', 'wisdom.exampleLabel': 'ПРИМЕР', 'wisdom.close': 'Закрыть',

    'progress.title': 'Твой путь тихо растёт.', 'progress.subtitle': 'Цифры — не гонка, а лишь след пройденной дороги.',
    'progress.streak': 'ДНЕЙ ПОДРЯД', 'progress.streakUnit': 'дн.',
    'progress.thisWeek': 'НА ЭТОЙ НЕДЕЛЕ', 'progress.weekUnit': 'практик',
    'progress.totalMoments': 'ВСЕГО МГНОВЕНИЙ',
    'progress.reflectionSub': 'Пустые дни — тоже часть пути. Сегодня ты вернулся — этого достаточно.',
    'progress.avg': 'Сред./день', 'progress.avgUnit': 'практик/день',
    'progress.bestDay': 'ЛУЧШИЙ ДЕНЬ', 'progress.bestDayValue': '{day} — {count} практик',
    'progress.last7': 'ПОСЛЕДНИЕ 7 ДНЕЙ', 'progress.exBreakdown': 'РАСПРЕДЕЛЕНИЕ УПРАЖНЕНИЙ',
    'progress.motivQuote': 'Важно не то, как долго ты живёшь, а то, как хорошо.',
    'progress.motivAuthor': '— Сенека',
    'progress.changeKey': '🔑 Сменить ключ API',
    'progress.resetTitle': 'Сбросить ключ API', 'progress.resetMsg': 'Текущий ключ будет удалён, и вы вернётесь к экрану настройки.',
    'progress.cancel': 'Отмена', 'progress.reset': 'Сброс',
    'progress.langLabel': '🌐 Язык',
    'voice.title': '🎙️ Естественный голос (ElevenLabs)',
    'voice.hint': 'Сделайте голос коуча по-настоящему человеческим. Необязательно — нужен ключ API ElevenLabs.',
    'voice.getKey': '→ Получить ключ на elevenlabs.io',
    'voice.placeholder': 'Ключ API ElevenLabs',
    'voice.save': 'Сохранить',
    'voice.saving': 'Проверка…',
    'voice.saved': '✓ Естественный голос вкл',
    'voice.clear': 'Удалить',
    'voice.errInvalid': 'Не удалось проверить ключ.',
    'voice.voiceLabel': 'ГОЛОС',
    'notify.title': 'Мягкие напоминания',
    'notify.hint': 'Лёгкое прикосновение утром (09:00) и вечером (21:00).',
    'notify.on': 'Вкл',
    'notify.off': 'Выкл',
    'notify.denied': 'Разрешение на уведомления отклонено. Включите его в настройках телефона.',
    'programs.title': 'Программы',
    'programs.subtitle': 'Многодневные стоические пути',
    'programs.cardName': 'Программы',
    'programs.cardDesc': 'Многодневные путешествия с проводником',
    'programs.day': 'День',
    'programs.dayOf': 'День {n}/{total}',
    'programs.progress': '{done}/{total} дней',
    'programs.start': 'Начать',
    'programs.continue': 'Продолжить',
    'programs.review': 'Просмотреть',
    'programs.locked': 'Завершите предыдущий день',
    'programs.complete': '✓ Завершить этот день',
    'programs.undo': '↩ Отменить',
    'programs.done': 'Завершено',
    'programs.finished': '✦ Вы прошли этот путь!',
    'memory.resetBtn': '🧠 Сбросить память коуча',
    'memory.resetTitle': 'Сбросить память',
    'memory.resetMsg': 'Всё, что коуч помнит о вас, будет удалено.',
    'share.button': 'Поделиться',
    'share.title': 'Поделиться цитатой',
    'wisdom.favorites': 'Избранное',
    'ch.cardName': 'Вызов', 'ch.cardDesc': 'Напиши и оцени свою стоическую максиму',
    'ch.title': 'Вызов', 'ch.subtitle': 'Стоические максимы сообщества',
    'ch.top': 'Популярные', 'ch.new': 'Новые', 'ch.write': '+ Написать',
    'ch.empty': 'Пока нет максим. Будь первым!',
    'ch.writeTitle': 'Напиши свою стоическую максиму', 'ch.placeholder': 'Твоя максима...',
    'ch.authorPlaceholder': 'Имя (необязательно)', 'ch.submit': 'Отправить', 'ch.sending': 'Отправка…',
    'ch.pending': '✓ Принято! Появится после одобрения.',
    'ch.rejected': 'Не одобрено:', 'ch.anon': 'Стоик',
    'ch.hint': 'Самые популярные максимы поднимаются вверх. Топ-10 можно делиться, топ-3 получают призы!',
    'ch.approve': 'Одобрить', 'ch.reject': 'Отклонить', 'ch.adminTitle': 'Очередь одобрения', 'ch.adminEmpty': 'Нет ожидающих максим.',
    'admin.title': '🛠️ Админ', 'admin.hint': 'Пароль администратора для очереди (только владелец).',
    'admin.placeholder': 'Пароль администратора', 'admin.open': 'Открыть очередь',
  },
};

// ─── Context ──────────────────────────────────────────────
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ready: boolean;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  ready: false,
});

function detectDeviceLang(): Lang {
  try {
    const codes = Localization.getLocales().map((l) => l.languageCode);
    for (const c of codes) {
      if (c && ['tr', 'en', 'de', 'ru'].includes(c)) return c as Lang;
    }
  } catch {}
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANG_STORAGE);
      if (stored && ['tr', 'en', 'de', 'ru'].includes(stored)) {
        setLangState(stored as Lang);
      } else {
        setLangState(detectDeviceLang());
      }
      setReady(true);
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_STORAGE, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = UI[lang][key] ?? UI.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return s;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
