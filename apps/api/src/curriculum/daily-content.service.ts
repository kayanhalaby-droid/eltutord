import { Injectable, Logger } from '@nestjs/common';
// @nestjs/schedule not installed — decorators stubbed out
const Cron = (_expr: string) => (_: unknown, __: string, ___: PropertyDescriptor) => ___;
const CronExpression = { EVERY_DAY_AT_MIDNIGHT: '0 0 * * *' } as const;

export interface DailyContent {
  date: string;
  wordOfDay: { word: string; meaning: string; example: string; subject: string };
  challenge: { question: string; answer: string; hint: string; duration: number };
  funFact: { text: string; emoji: string; source: string };
}

// Static pool — GPT-4o can extend these at runtime
const WORD_POOL = [
  { word: 'الفجر', meaning: 'أول ضوء النهار قبل شروق الشمس', example: 'استيقظت عند الفجر لأذاكر', subject: 'عربي' },
  { word: 'المعادلة', meaning: 'تعبير رياضي يحتوي على مجهول', example: 'حللت المعادلة في خمس دقائق', subject: 'رياضيات' },
  { word: 'שׁוּלְחָן', meaning: 'طاولة — גַּם שׁולחן', example: 'הספר עַל הַשּׁוּלְחָן', subject: 'עברית' },
  { word: 'Perseverance', meaning: 'المثابرة والإصرار', example: 'Perseverance leads to success', subject: 'English' },
  { word: 'الكسر', meaning: 'جزء من الكل', example: 'نصف التفاحة يُكتب ½', subject: 'رياضيات' },
  { word: 'الاستعارة', meaning: 'تشبيه بدون أداة تشبيه', example: 'العلم نور يضيء العقول', subject: 'عربي' },
  { word: 'חִבּוּר', meaning: 'جمع — Addition', example: 'חִבּוּר שָׁלוֹשׁ וְאַרְבַּע שָׁוֶה שֶׁבַע', subject: 'עברית' },
  { word: 'Equivalent', meaning: 'مساوٍ في القيمة', example: '½ is equivalent to 50%', subject: 'English' },
];

const CHALLENGE_POOL = [
  { question: 'ما ناتج ٧ × ٨ ؟', answer: '٥٦', hint: 'فكر في ٧ × ٤ × ٢', duration: 60 },
  { question: 'أكمل: "من جدّ ..."', answer: 'وجد', hint: 'مثل عربي مشهور', duration: 60 },
  { question: 'כַּמָּה זֶה 15 + 27?', answer: '42', hint: 'חַבֵּר אֶת הָעֲשֵׂרוֹת וְאֶת הָאַחְדוֹת', duration: 60 },
  { question: 'Spell: "necessary"', answer: 'necessary', hint: 'One collar, two socks (1 c, 2 s)', duration: 60 },
  { question: 'ما مساحة مربع طول ضلعه ٥ سم؟', answer: '٢٥ سم²', hint: 'المساحة = الضلع²', duration: 60 },
  { question: 'ما جمع كلمة "قلم"؟', answer: 'أقلام', hint: 'وزن أَفعال', duration: 60 },
];

const FACT_POOL = [
  { text: 'دماغ الإنسان يولد ما يكفي من الطاقة الكهربائية لإضاءة مصباح صغير!', emoji: '🧠', source: 'علم الأعصاب' },
  { text: 'النحل يمكنه التعرف على وجه الإنسان مثلنا تماماً', emoji: '🐝', source: 'علم الحيوان' },
  { text: 'عدد الكلمات في اللغة العربية يتجاوز ١٢ مليون كلمة', emoji: '📚', source: 'اللغويات' },
  { text: 'مجموع زوايا أي مثلث دائماً ١٨٠ درجة، بغض النظر عن حجمه', emoji: '📐', source: 'الرياضيات' },
  { text: 'يُستخدم الرقم ٠ الذي اخترعه العرب في كل حسابات الكمبيوتر', emoji: '💻', source: 'تاريخ العلوم' },
  { text: 'اللغة العبرية إحدى أقدم اللغات الحية في العالم', emoji: '✡️', source: 'التاريخ' },
];

@Injectable()
export class DailyContentService {
  private readonly logger = new Logger(DailyContentService.name);
  private todayContent: DailyContent | null = null;

  constructor() {
    this.generateDailyContent();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  generateDailyContent(): void {
    const today = new Date().toISOString().split('T')[0];
    // Use date as seed for deterministic daily selection
    const seed = today.replace(/-/g, '').slice(-4);
    const wordIdx = parseInt(seed.slice(0, 2), 10) % WORD_POOL.length;
    const challengeIdx = parseInt(seed.slice(2, 4), 10) % CHALLENGE_POOL.length;
    const factIdx = (wordIdx + challengeIdx) % FACT_POOL.length;

    this.todayContent = {
      date: today,
      wordOfDay: WORD_POOL[wordIdx],
      challenge: CHALLENGE_POOL[challengeIdx],
      funFact: FACT_POOL[factIdx],
    };

    this.logger.log(`Daily content generated for ${today}`);
  }

  getDailyContent(): DailyContent {
    if (!this.todayContent) this.generateDailyContent();
    return this.todayContent!;
  }
}
