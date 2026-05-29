export interface Quote {
  text: string;
  author: string;
  source: string;
}

export const DAILY_QUOTES: Quote[] = [
  {
    text: "Sen ne zaman iç huzurunun dışındaki bir şeye sahip olabileceğini umarsın, o zaman seni ne dış etkenler ne de diğer insanlar etkiler.",
    author: "Marcus Aurelius",
    source: "Meditationes",
  },
  {
    text: "İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir.",
    author: "Epiktetos",
    source: "Enchiridion",
  },
  {
    text: "Hayatını değiştirmek istiyorsan, düşüncelerini değiştir. Bu kadar basit, bu kadar zor.",
    author: "Marcus Aurelius",
    source: "Meditationes",
  },
  {
    text: "Zorluklardan kaçma; onları kucakla. Çünkü onlar seni güçlendiren fırsatlardır.",
    author: "Seneca",
    source: "Epistulae Morales",
  },
  {
    text: "Kendine hakim ol ya da birisi sana hakim olur.",
    author: "Epiktetos",
    source: "Discourses",
  },
  {
    text: "Kayıplarını değil, sahip olduklarını say.",
    author: "Marcus Aurelius",
    source: "Meditationes",
  },
  {
    text: "Bugün ölebilirdin; bunun yerine hâlâ hayattasın. Bu zamanı bilgelikle kullan.",
    author: "Marcus Aurelius",
    source: "Meditationes",
  },
];

export function getTodaysQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
