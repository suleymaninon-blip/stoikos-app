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
    'home.mod.coach.name': 'AI Koç', 'home.mod.coach.desc': 'Stoacı rehberlik al',
    'home.mod.wisdom.name': 'Bilgelik', 'home.mod.wisdom.desc': 'Kavramlar & alıntılar',
    'home.mod.progress.name': 'İlerleme', 'home.mod.progress.desc': 'Dönüşüm takibi',
    'home.quoteLabel': 'GÜNÜN ALINTISI',
    'home.streak': 'GÜNLÜK SERİ',

    'practice.title': 'Günlük Pratik', 'practice.morningSub': 'Sabah egzersizleri', 'practice.eveningSub': 'Akşam yansıması',
    'practice.todayProgress': 'BUGÜNKÜ İLERLEME', 'practice.allDone': '✦ Tüm pratikler tamamlandı — iyi iş!',
    'practice.morningTag': 'SABAH', 'practice.morningTitle': 'Güne Başlarken',
    'practice.eveningTag': 'AKŞAM', 'practice.eveningTitle': 'Günü Kapatırken',
    'practice.journalTag': 'GÜNLÜK YANSIMA',
    'practice.journalHint': 'Bugün ne hissettin? Ne öğrendin? Stoacı bir perspektifle yaz.',
    'practice.journalPlaceholder': 'Bugünkü düşüncelerini buraya yaz...',
    'practice.save': 'Kaydet', 'practice.saved': '✓ Kaydedildi',
    'practice.conceptTag': 'GÜNÜN KAVRAMI',
    'practice.intro': 'Her gün birkaç dakikanı ayır. Bir egzersize dokun, oku ve uygula — sonra tamamla.',
    'practice.complete': '✓ Tamamladım',
    'practice.undo': '↩ Geri al',
    'practice.done': 'Tamamlandı',
    'practice.tapHint': 'Dokun →',

    'coach.title': 'Stoacı Koç', 'coach.active': 'AKTİF', 'coach.subtitle': "Epiktetos'un bilgeliğiyle rehberlik",
    'coach.autoOn': '🔊 Sesli Okuma: Açık', 'coach.autoOff': '🔇 Sesli Okuma: Kapalı',
    'coach.listen': 'Dinle', 'coach.stop': 'Durdur', 'coach.reset': 'Sıfırla',
    'coach.topics': 'KONULAR', 'coach.inputLabel': 'DÜŞÜNCENI YAZ', 'coach.placeholder': 'Bugün ne hissediyorsun?',
    'coach.connError': 'Bağlantı hatası oluştu. Lütfen tekrar dene.',

    'wisdom.title': 'Bilgelik', 'wisdom.subtitle': 'Antik öğretiler, modern hayat',
    'wisdom.tabQuotes': 'Alıntılar', 'wisdom.tabConcepts': 'Kavramlar', 'wisdom.all': 'Tümü',
    'wisdom.more': 'Daha fazla →', 'wisdom.exampleLabel': 'ÖRNEK', 'wisdom.close': 'Kapat',

    'progress.title': 'İlerleme', 'progress.subtitle': 'Dönüşümünü izle',
    'progress.streak': 'Günlük Seri', 'progress.streakUnit': 'gün',
    'progress.thisWeek': 'Bu Hafta', 'progress.weekUnit': 'pratik',
    'progress.avg': 'Günlük Ort.', 'progress.avgUnit': 'pratik/gün',
    'progress.bestDay': 'EN İYİ GÜN', 'progress.bestDayValue': '{day} — {count} pratik',
    'progress.last7': 'SON 7 GÜN', 'progress.exBreakdown': 'EGZERSİZ DAĞILIMI',
    'progress.motivQuote': 'Küçük adımlar atılmaya devam edilirse, büyük mesafeler kat edilir.',
    'progress.motivAuthor': '— Marcus Aurelius',
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
    'notify.title': '🔔 Günlük Hatırlatıcılar',
    'notify.hint': 'Sabah niyeti (09:00) ve akşam yansıması (21:00) için hatırlatma al. Seni günlük ritmine bağlar.',
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
    'home.mod.coach.name': 'AI Coach', 'home.mod.coach.desc': 'Get Stoic guidance',
    'home.mod.wisdom.name': 'Wisdom', 'home.mod.wisdom.desc': 'Concepts & quotes',
    'home.mod.progress.name': 'Progress', 'home.mod.progress.desc': 'Track your transformation',
    'home.quoteLabel': 'QUOTE OF THE DAY',
    'home.streak': 'DAILY STREAK',

    'practice.title': 'Daily Practice', 'practice.morningSub': 'Morning exercises', 'practice.eveningSub': 'Evening reflection',
    'practice.todayProgress': "TODAY'S PROGRESS", 'practice.allDone': '✦ All practices complete — well done!',
    'practice.morningTag': 'MORNING', 'practice.morningTitle': 'Starting the Day',
    'practice.eveningTag': 'EVENING', 'practice.eveningTitle': 'Closing the Day',
    'practice.journalTag': 'DAILY REFLECTION',
    'practice.journalHint': 'How did you feel today? What did you learn? Write with a Stoic perspective.',
    'practice.journalPlaceholder': "Write today's thoughts here...",
    'practice.save': 'Save', 'practice.saved': '✓ Saved',
    'practice.conceptTag': 'CONCEPT OF THE DAY',
    'practice.intro': 'Set aside a few minutes each day. Tap an exercise, read it, do it — then mark it done.',
    'practice.complete': '✓ Mark as done',
    'practice.undo': '↩ Undo',
    'practice.done': 'Done',
    'practice.tapHint': 'Tap →',

    'coach.title': 'Stoic Coach', 'coach.active': 'ACTIVE', 'coach.subtitle': 'Guidance with the wisdom of Epictetus',
    'coach.autoOn': '🔊 Read Aloud: On', 'coach.autoOff': '🔇 Read Aloud: Off',
    'coach.listen': 'Listen', 'coach.stop': 'Stop', 'coach.reset': 'Reset',
    'coach.topics': 'TOPICS', 'coach.inputLabel': 'WRITE YOUR THOUGHT', 'coach.placeholder': 'How are you feeling today?',
    'coach.connError': 'A connection error occurred. Please try again.',

    'wisdom.title': 'Wisdom', 'wisdom.subtitle': 'Ancient teachings, modern life',
    'wisdom.tabQuotes': 'Quotes', 'wisdom.tabConcepts': 'Concepts', 'wisdom.all': 'All',
    'wisdom.more': 'Read more →', 'wisdom.exampleLabel': 'EXAMPLE', 'wisdom.close': 'Close',

    'progress.title': 'Progress', 'progress.subtitle': 'Track your transformation',
    'progress.streak': 'Daily Streak', 'progress.streakUnit': 'days',
    'progress.thisWeek': 'This Week', 'progress.weekUnit': 'practices',
    'progress.avg': 'Daily Avg.', 'progress.avgUnit': 'practices/day',
    'progress.bestDay': 'BEST DAY', 'progress.bestDayValue': '{day} — {count} practices',
    'progress.last7': 'LAST 7 DAYS', 'progress.exBreakdown': 'EXERCISE BREAKDOWN',
    'progress.motivQuote': 'If small steps are taken continually, great distances are covered.',
    'progress.motivAuthor': '— Marcus Aurelius',
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
    'notify.title': '🔔 Daily Reminders',
    'notify.hint': 'Get reminded for the morning intention (09:00) and evening reflection (21:00). Keeps you in a daily rhythm.',
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
    'home.mod.coach.name': 'KI-Coach', 'home.mod.coach.desc': 'Stoische Führung erhalten',
    'home.mod.wisdom.name': 'Weisheit', 'home.mod.wisdom.desc': 'Begriffe & Zitate',
    'home.mod.progress.name': 'Fortschritt', 'home.mod.progress.desc': 'Verfolge deine Wandlung',
    'home.quoteLabel': 'ZITAT DES TAGES',
    'home.streak': 'TÄGLICHE SERIE',

    'practice.title': 'Tägliche Praxis', 'practice.morningSub': 'Morgenübungen', 'practice.eveningSub': 'Abendreflexion',
    'practice.todayProgress': 'HEUTIGER FORTSCHRITT', 'practice.allDone': '✦ Alle Übungen abgeschlossen — gut gemacht!',
    'practice.morningTag': 'MORGEN', 'practice.morningTitle': 'In den Tag starten',
    'practice.eveningTag': 'ABEND', 'practice.eveningTitle': 'Den Tag abschließen',
    'practice.journalTag': 'TÄGLICHE REFLEXION',
    'practice.journalHint': 'Wie hast du dich heute gefühlt? Was hast du gelernt? Schreibe aus stoischer Sicht.',
    'practice.journalPlaceholder': 'Schreibe hier deine heutigen Gedanken...',
    'practice.save': 'Speichern', 'practice.saved': '✓ Gespeichert',
    'practice.conceptTag': 'BEGRIFF DES TAGES',
    'practice.intro': 'Nimm dir täglich ein paar Minuten. Tippe auf eine Übung, lies sie, tu sie — dann hake sie ab.',
    'practice.complete': '✓ Als erledigt markieren',
    'practice.undo': '↩ Rückgängig',
    'practice.done': 'Erledigt',
    'practice.tapHint': 'Tippen →',

    'coach.title': 'Stoischer Coach', 'coach.active': 'AKTIV', 'coach.subtitle': 'Führung mit der Weisheit Epiktets',
    'coach.autoOn': '🔊 Vorlesen: Ein', 'coach.autoOff': '🔇 Vorlesen: Aus',
    'coach.listen': 'Anhören', 'coach.stop': 'Stopp', 'coach.reset': 'Zurücksetzen',
    'coach.topics': 'THEMEN', 'coach.inputLabel': 'SCHREIB DEINEN GEDANKEN', 'coach.placeholder': 'Wie fühlst du dich heute?',
    'coach.connError': 'Es ist ein Verbindungsfehler aufgetreten. Bitte versuche es erneut.',

    'wisdom.title': 'Weisheit', 'wisdom.subtitle': 'Antike Lehren, modernes Leben',
    'wisdom.tabQuotes': 'Zitate', 'wisdom.tabConcepts': 'Begriffe', 'wisdom.all': 'Alle',
    'wisdom.more': 'Mehr lesen →', 'wisdom.exampleLabel': 'BEISPIEL', 'wisdom.close': 'Schließen',

    'progress.title': 'Fortschritt', 'progress.subtitle': 'Verfolge deine Wandlung',
    'progress.streak': 'Tägliche Serie', 'progress.streakUnit': 'Tage',
    'progress.thisWeek': 'Diese Woche', 'progress.weekUnit': 'Übungen',
    'progress.avg': 'Tagesschnitt', 'progress.avgUnit': 'Übungen/Tag',
    'progress.bestDay': 'BESTER TAG', 'progress.bestDayValue': '{day} — {count} Übungen',
    'progress.last7': 'LETZTE 7 TAGE', 'progress.exBreakdown': 'ÜBUNGSVERTEILUNG',
    'progress.motivQuote': 'Wenn man stetig kleine Schritte tut, legt man große Strecken zurück.',
    'progress.motivAuthor': '— Marcus Aurelius',
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
    'notify.title': '🔔 Tägliche Erinnerungen',
    'notify.hint': 'Werde an den Morgenvorsatz (09:00) und die Abendreflexion (21:00) erinnert. Hält dich im täglichen Rhythmus.',
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
    'home.mod.coach.name': 'ИИ-коуч', 'home.mod.coach.desc': 'Получите стоическое наставление',
    'home.mod.wisdom.name': 'Мудрость', 'home.mod.wisdom.desc': 'Понятия и цитаты',
    'home.mod.progress.name': 'Прогресс', 'home.mod.progress.desc': 'Отслеживайте преображение',
    'home.quoteLabel': 'ЦИТАТА ДНЯ',
    'home.streak': 'ЕЖЕДНЕВНАЯ СЕРИЯ',

    'practice.title': 'Ежедневная практика', 'practice.morningSub': 'Утренние упражнения', 'practice.eveningSub': 'Вечернее размышление',
    'practice.todayProgress': 'ПРОГРЕСС ЗА ДЕНЬ', 'practice.allDone': '✦ Все практики выполнены — отличная работа!',
    'practice.morningTag': 'УТРО', 'practice.morningTitle': 'Начало дня',
    'practice.eveningTag': 'ВЕЧЕР', 'practice.eveningTitle': 'Завершение дня',
    'practice.journalTag': 'ЕЖЕДНЕВНАЯ РЕФЛЕКСИЯ',
    'practice.journalHint': 'Что вы чувствовали сегодня? Чему научились? Пишите со стоической точки зрения.',
    'practice.journalPlaceholder': 'Запишите здесь свои сегодняшние мысли...',
    'practice.save': 'Сохранить', 'practice.saved': '✓ Сохранено',
    'practice.conceptTag': 'ПОНЯТИЕ ДНЯ',
    'practice.intro': 'Удели несколько минут каждый день. Нажми на упражнение, прочти, выполни — затем отметь.',
    'practice.complete': '✓ Отметить',
    'practice.undo': '↩ Отменить',
    'practice.done': 'Готово',
    'practice.tapHint': 'Нажми →',

    'coach.title': 'Стоический коуч', 'coach.active': 'АКТИВЕН', 'coach.subtitle': 'Наставление с мудростью Эпиктета',
    'coach.autoOn': '🔊 Озвучка: Вкл', 'coach.autoOff': '🔇 Озвучка: Выкл',
    'coach.listen': 'Слушать', 'coach.stop': 'Стоп', 'coach.reset': 'Сброс',
    'coach.topics': 'ТЕМЫ', 'coach.inputLabel': 'НАПИШИТЕ СВОЮ МЫСЛЬ', 'coach.placeholder': 'Что вы чувствуете сегодня?',
    'coach.connError': 'Произошла ошибка соединения. Попробуйте ещё раз.',

    'wisdom.title': 'Мудрость', 'wisdom.subtitle': 'Древние учения, современная жизнь',
    'wisdom.tabQuotes': 'Цитаты', 'wisdom.tabConcepts': 'Понятия', 'wisdom.all': 'Все',
    'wisdom.more': 'Подробнее →', 'wisdom.exampleLabel': 'ПРИМЕР', 'wisdom.close': 'Закрыть',

    'progress.title': 'Прогресс', 'progress.subtitle': 'Отслеживайте преображение',
    'progress.streak': 'Серия дней', 'progress.streakUnit': 'дн.',
    'progress.thisWeek': 'На неделе', 'progress.weekUnit': 'практик',
    'progress.avg': 'Сред./день', 'progress.avgUnit': 'практик/день',
    'progress.bestDay': 'ЛУЧШИЙ ДЕНЬ', 'progress.bestDayValue': '{day} — {count} практик',
    'progress.last7': 'ПОСЛЕДНИЕ 7 ДНЕЙ', 'progress.exBreakdown': 'РАСПРЕДЕЛЕНИЕ УПРАЖНЕНИЙ',
    'progress.motivQuote': 'Если постоянно делать малые шаги, преодолеваются большие расстояния.',
    'progress.motivAuthor': '— Марк Аврелий',
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
    'notify.title': '🔔 Ежедневные напоминания',
    'notify.hint': 'Напоминания об утреннем настрое (09:00) и вечернем размышлении (21:00). Держит тебя в ежедневном ритме.',
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
