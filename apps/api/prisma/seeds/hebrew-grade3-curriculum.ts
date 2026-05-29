import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

// 6 units × 4 lessons × 8 questions = 192 questions

interface McQuestion {
  type: 'mc';
  text: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

interface TfQuestion {
  type: 'tf';
  statement: string;
  isTrue: boolean;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

type Q = McQuestion | TfQuestion;

interface LessonDef {
  nameEn: string;
  nameHe: string;
  nameAr: string;
  durationMin: number;
  questions: Q[];
}

interface UnitDef {
  nameEn: string;
  nameHe: string;
  nameAr: string;
  levelNameEn: string;
  levelNameAr: string;
  xpReward: number;
  lessons: LessonDef[];
}

// ── Unit 1: אני והמשפחה ────────────────────────────────────────────────────────
const unit1: UnitDef = {
  nameEn: 'Me and My Family',
  nameHe: 'אני והמשפחה',
  nameAr: 'أنا وعائلتي',
  levelNameEn: 'Family Level 1',
  levelNameAr: 'العائلة - المستوى الأول',
  xpReward: 20,
  lessons: [
    {
      nameEn: 'Me (Ani)',
      nameHe: 'אני',
      nameAr: 'أنا',
      durationMin: 10,
      questions: [
        { type: 'mc', text: 'ما معنى كلمة "אני" بالعربية؟', options: [{ id: 'a', text: 'أنت' }, { id: 'b', text: 'أنا' }, { id: 'c', text: 'هو' }, { id: 'd', text: 'هي' }], correct: 'b', explanation: '"אני" تعني "أنا" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "شكراً" بالعبرية؟', options: [{ id: 'a', text: 'שלום' }, { id: 'b', text: 'בבקשה' }, { id: 'c', text: 'תודה' }, { id: 'd', text: 'סליחה' }], correct: 'c', explanation: '"תודה" تعني "شكراً" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"שלום" بالعبرية تُستخدم للتحية عند اللقاء وعند الوداع.', isTrue: true, explanation: 'نعم، "שלום" تعني سلام وتُستخدم في كلا الحالتين.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "מה שמך?" بالعربية؟', options: [{ id: 'a', text: 'كيف حالك؟' }, { id: 'b', text: 'ما اسمك؟' }, { id: 'c', text: 'كم عمرك؟' }, { id: 'd', text: 'من أين أنت؟' }], correct: 'b', explanation: '"מה שמך?" تعني "ما اسمك؟"', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "نعم" بالعبرية؟', options: [{ id: 'a', text: 'לא' }, { id: 'b', text: 'כן' }, { id: 'c', text: 'אולי' }, { id: 'd', text: 'בסדר' }], correct: 'b', explanation: '"כן" تعني "نعم" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"לא" بالعبرية تعني "نعم".', isTrue: false, explanation: '"לא" تعني "لا" وليس "نعم".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני שמח" بالعربية؟', options: [{ id: 'a', text: 'أنا حزين' }, { id: 'b', text: 'أنا جائع' }, { id: 'c', text: 'أنا سعيد' }, { id: 'd', text: 'أنا تعبان' }], correct: 'c', explanation: '"שמח" تعني سعيد، فـ"אני שמח" تعني "أنا سعيد".', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "عفواً / آسف" بالعبرية؟', options: [{ id: 'a', text: 'תודה' }, { id: 'b', text: 'שלום' }, { id: 'c', text: 'בבקשה' }, { id: 'd', text: 'סליחה' }], correct: 'd', explanation: '"סליחה" تعني "عفواً" أو "آسف" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'The Family',
      nameHe: 'המשפחה',
      nameAr: 'العائلة',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "أب" بالعبرية؟', options: [{ id: 'a', text: 'אמא' }, { id: 'b', text: 'אבא' }, { id: 'c', text: 'אח' }, { id: 'd', text: 'סבא' }], correct: 'b', explanation: '"אבא" تعني "أب" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أم" بالعبرية؟', options: [{ id: 'a', text: 'אחות' }, { id: 'b', text: 'דודה' }, { id: 'c', text: 'אמא' }, { id: 'd', text: 'סבתא' }], correct: 'c', explanation: '"אמא" تعني "أم" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אח" بالعربية؟', options: [{ id: 'a', text: 'أخت' }, { id: 'b', text: 'عم' }, { id: 'c', text: 'أخ' }, { id: 'd', text: 'جد' }], correct: 'c', explanation: '"אח" تعني "أخ" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אחות" بالعربية؟', options: [{ id: 'a', text: 'أخ' }, { id: 'b', text: 'أخت' }, { id: 'c', text: 'عمة' }, { id: 'd', text: 'جدة' }], correct: 'b', explanation: '"אחות" تعني "أخت" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"סבא" بالعبرية تعني "جدة".', isTrue: false, explanation: '"סבא" تعني "جد"، أما "جدة" فهي "סבתא".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "جدة" بالعبرية؟', options: [{ id: 'a', text: 'סבא' }, { id: 'b', text: 'דודה' }, { id: 'c', text: 'סבתא' }, { id: 'd', text: 'אמא' }], correct: 'c', explanation: '"סבתא" تعني "جدة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "המשפחה שלי גדולה" بالعربية؟', options: [{ id: 'a', text: 'عائلتي صغيرة' }, { id: 'b', text: 'عائلتي جميلة' }, { id: 'c', text: 'عائلتي كبيرة' }, { id: 'd', text: 'عائلتي قريبة' }], correct: 'c', explanation: '"גדולה" تعني كبيرة، فالجملة تعني "عائلتي كبيرة".', difficulty: 2 },
        { type: 'tf', statement: '"דוד" بالعبرية تعني "عم".', isTrue: true, explanation: 'نعم، "דוד" تعني "عم" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'My Home',
      nameHe: 'הבית שלי',
      nameAr: 'بيتي',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "بيت / منزل" بالعبرية؟', options: [{ id: 'a', text: 'חדר' }, { id: 'b', text: 'בית' }, { id: 'c', text: 'מטבח' }, { id: 'd', text: 'חלון' }], correct: 'b', explanation: '"בית" تعني "بيت" أو "منزل" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "חדר שינה" بالعربية؟', options: [{ id: 'a', text: 'غرفة الجلوس' }, { id: 'b', text: 'المطبخ' }, { id: 'c', text: 'غرفة النوم' }, { id: 'd', text: 'الحمام' }], correct: 'c', explanation: '"חדר שינה" تعني "غرفة النوم".', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "مطبخ" بالعبرية؟', options: [{ id: 'a', text: 'סלון' }, { id: 'b', text: 'מקלחת' }, { id: 'c', text: 'מטבח' }, { id: 'd', text: 'מרפסת' }], correct: 'c', explanation: '"מטבח" تعني "مطبخ" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"סלון" بالعبرية تعني "المطبخ".', isTrue: false, explanation: '"סלון" تعني "غرفة الجلوس"، أما المطبخ فهو "מטבח".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "דלת" بالعربية؟', options: [{ id: 'a', text: 'نافذة' }, { id: 'b', text: 'باب' }, { id: 'c', text: 'سقف' }, { id: 'd', text: 'أرضية' }], correct: 'b', explanation: '"דלת" تعني "باب" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "نافذة" بالعبرية؟', options: [{ id: 'a', text: 'דלת' }, { id: 'b', text: 'קיר' }, { id: 'c', text: 'חלון' }, { id: 'd', text: 'תקרה' }], correct: 'c', explanation: '"חלון" تعني "نافذة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני גר בבית גדול" بالعربية؟', options: [{ id: 'a', text: 'أنا أسكن في بيت صغير' }, { id: 'b', text: 'أنا أسكن في بيت كبير' }, { id: 'c', text: 'أنا أحب البيت' }, { id: 'd', text: 'بيتي جميل' }], correct: 'b', explanation: '"גר" تعني يسكن، و"גדול" تعني كبير.', difficulty: 2 },
        { type: 'tf', statement: '"חלון" بالعبرية تعني "باب".', isTrue: false, explanation: '"חלון" تعني "نافذة"، أما "باب" فهي "דלת".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Quiz 1 - Me and Family',
      nameHe: 'בחן את עצמך 1',
      nameAr: 'اختبار الوحدة 1',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'ما معنى "אני אוהב את המשפחה שלי" بالعربية؟', options: [{ id: 'a', text: 'أنا أحب بيتي' }, { id: 'b', text: 'أنا أحب عائلتي' }, { id: 'c', text: 'عائلتي تحبني' }, { id: 'd', text: 'أنا مع عائلتي' }], correct: 'b', explanation: '"אוהב" تعني أحب، و"המשפחה שלי" تعني عائلتي.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا طالب" بالعبرية؟', options: [{ id: 'a', text: 'אני מורה' }, { id: 'b', text: 'אני תלמיד' }, { id: 'c', text: 'אני רופא' }, { id: 'd', text: 'אני ילד' }], correct: 'b', explanation: '"תלמיד" تعني "طالب"، فـ"אני תלמיד" تعني "أنا طالب".', difficulty: 1 },
        { type: 'tf', statement: '"אמא ואבא" بالعبرية تعني "أخ وأخت".', isTrue: false, explanation: '"אמא ואבא" تعني "أم وأب"، وليس أخ وأخت.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "جد" بالعبرية؟', options: [{ id: 'a', text: 'סבתא' }, { id: 'b', text: 'דודה' }, { id: 'c', text: 'סבא' }, { id: 'd', text: 'אחות' }], correct: 'c', explanation: '"סבא" تعني "جد".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הבית שלנו קטן" بالعربية؟', options: [{ id: 'a', text: 'بيتنا كبير' }, { id: 'b', text: 'بيتنا صغير' }, { id: 'c', text: 'بيتنا جميل' }, { id: 'd', text: 'بيتنا قديم' }], correct: 'b', explanation: '"קטן" تعني صغير، و"שלנו" تعني لنا/بيتنا.', difficulty: 2 },
        { type: 'tf', statement: '"תודה" بالعبرية تعني "من فضلك".', isTrue: false, explanation: '"תודה" تعني "شكراً"، أما "من فضلك" فهي "בבקשה".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "لا" بالعبرية؟', options: [{ id: 'a', text: 'כן' }, { id: 'b', text: 'אולי' }, { id: 'c', text: 'לא' }, { id: 'd', text: 'בסדר' }], correct: 'c', explanation: '"לא" تعني "لا" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "שלום, מה שמך?" بالعربية؟', options: [{ id: 'a', text: 'مرحباً، كيف حالك؟' }, { id: 'b', text: 'مرحباً، ما اسمك؟' }, { id: 'c', text: 'وداعاً، ما اسمك؟' }, { id: 'd', text: 'مرحباً، كم عمرك؟' }], correct: 'b', explanation: '"שלום" مرحباً، و"מה שמך" ما اسمك؟', difficulty: 2 },
      ],
    },
  ],
};

// ── Unit 2: צבעים וצורות ───────────────────────────────────────────────────────
const unit2: UnitDef = {
  nameEn: 'Colors and Shapes',
  nameHe: 'צבעים וצורות',
  nameAr: 'الألوان والأشكال',
  levelNameEn: 'Colors Level 1',
  levelNameAr: 'الألوان - المستوى الأول',
  xpReward: 20,
  lessons: [
    {
      nameEn: 'Colors',
      nameHe: 'צבעים',
      nameAr: 'الألوان',
      durationMin: 10,
      questions: [
        { type: 'mc', text: 'كيف تقول "أحمر" بالعبرية؟', options: [{ id: 'a', text: 'כחול' }, { id: 'b', text: 'אדום' }, { id: 'c', text: 'ירוק' }, { id: 'd', text: 'צהוב' }], correct: 'b', explanation: '"אדום" تعني "أحمر" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "כחול" بالعربية؟', options: [{ id: 'a', text: 'أخضر' }, { id: 'b', text: 'أصفر' }, { id: 'c', text: 'أزرق' }, { id: 'd', text: 'بنفسجي' }], correct: 'c', explanation: '"כחול" تعني "أزرق" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أخضر" بالعبرية؟', options: [{ id: 'a', text: 'כתום' }, { id: 'b', text: 'ירוק' }, { id: 'c', text: 'לבן' }, { id: 'd', text: 'שחור' }], correct: 'b', explanation: '"ירוק" تعني "أخضر" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"צהוב" بالعبرية تعني "البرتقالي".', isTrue: false, explanation: '"צהוב" تعني "أصفر"، أما البرتقالي فهو "כתום".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "לבן" بالعربية؟', options: [{ id: 'a', text: 'أسود' }, { id: 'b', text: 'رمادي' }, { id: 'c', text: 'أبيض' }, { id: 'd', text: 'بني' }], correct: 'c', explanation: '"לבן" تعني "أبيض" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أسود" بالعبرية؟', options: [{ id: 'a', text: 'לבן' }, { id: 'b', text: 'אפור' }, { id: 'c', text: 'חום' }, { id: 'd', text: 'שחור' }], correct: 'd', explanation: '"שחור" تعني "أسود" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "השמיים כחולים" بالعربية؟', options: [{ id: 'a', text: 'السماء بيضاء' }, { id: 'b', text: 'السماء زرقاء' }, { id: 'c', text: 'السماء صافية' }, { id: 'd', text: 'السماء جميلة' }], correct: 'b', explanation: '"השמיים" السماء، و"כחולים" زرقاء.', difficulty: 2 },
        { type: 'tf', statement: '"ורוד" بالعبرية تعني "اللون الوردي / الزهري".', isTrue: true, explanation: 'نعم، "ורוד" تعني "وردي / زهري".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Shapes',
      nameHe: 'צורות',
      nameAr: 'الأشكال',
      durationMin: 10,
      questions: [
        { type: 'mc', text: 'كيف تقول "دائرة" بالعبرية؟', options: [{ id: 'a', text: 'ריבוע' }, { id: 'b', text: 'משולש' }, { id: 'c', text: 'עיגול' }, { id: 'd', text: 'מלבן' }], correct: 'c', explanation: '"עיגול" تعني "دائرة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "ריבוע" بالعربية؟', options: [{ id: 'a', text: 'مثلث' }, { id: 'b', text: 'مستطيل' }, { id: 'c', text: 'دائرة' }, { id: 'd', text: 'مربع' }], correct: 'd', explanation: '"ריבוע" تعني "مربع" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "مثلث" بالعبرية؟', options: [{ id: 'a', text: 'משולש' }, { id: 'b', text: 'מלבן' }, { id: 'c', text: 'עיגול' }, { id: 'd', text: 'ריבוע' }], correct: 'a', explanation: '"משולש" تعني "مثلث" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"מלבן" بالعبرية تعني "مربع".', isTrue: false, explanation: '"מלבן" تعني "مستطيل"، أما المربع فهو "ריבוע".', difficulty: 1 },
        { type: 'mc', text: 'كم ضلعاً في "ריבוע"؟', options: [{ id: 'a', text: 'ثلاثة' }, { id: 'b', text: 'أربعة' }, { id: 'c', text: 'خمسة' }, { id: 'd', text: 'ستة' }], correct: 'b', explanation: '"ריבוע" (المربع) له أربعة أضلاع متساوية.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "לעיגול אין פינות" بالعربية؟', options: [{ id: 'a', text: 'للدائرة أربع زوايا' }, { id: 'b', text: 'للدائرة لا زوايا' }, { id: 'c', text: 'للدائرة ثلاث زوايا' }, { id: 'd', text: 'الدائرة شكل صغير' }], correct: 'b', explanation: '"אין פינות" تعني "لا زوايا"، فالدائرة ليس لها زوايا.', difficulty: 2 },
        { type: 'tf', statement: '"משולש" بالعبرية تعني "مثلث" وله ثلاثة أضلاع.', isTrue: true, explanation: 'نعم، المثلث له ثلاثة أضلاع.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من هذه الكلمات تعني "نجمة" بالعبرية؟', options: [{ id: 'a', text: 'ירח' }, { id: 'b', text: 'כוכב' }, { id: 'c', text: 'שמש' }, { id: 'd', text: 'ענן' }], correct: 'b', explanation: '"כוכב" تعني "نجمة / كوكب" بالعبرية.', difficulty: 2 },
      ],
    },
    {
      nameEn: 'Description',
      nameHe: 'תיאור',
      nameAr: 'الوصف',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'ما معنى "גדול" بالعربية؟', options: [{ id: 'a', text: 'صغير' }, { id: 'b', text: 'طويل' }, { id: 'c', text: 'كبير' }, { id: 'd', text: 'ثقيل' }], correct: 'c', explanation: '"גדול" تعني "كبير" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "صغير" بالعبرية؟', options: [{ id: 'a', text: 'גדול' }, { id: 'b', text: 'קטן' }, { id: 'c', text: 'גבוה' }, { id: 'd', text: 'כבד' }], correct: 'b', explanation: '"קטן" تعني "صغير" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הכדור אדום וגדול" بالعربية؟', options: [{ id: 'a', text: 'الكرة زرقاء وصغيرة' }, { id: 'b', text: 'الكرة حمراء وكبيرة' }, { id: 'c', text: 'الكرة صفراء وكبيرة' }, { id: 'd', text: 'الكرة حمراء وصغيرة' }], correct: 'b', explanation: '"אדום" أحمر، و"גדול" كبير، فالجملة تعني "الكرة حمراء وكبيرة".', difficulty: 2 },
        { type: 'tf', statement: '"ארוך" بالعبرية تعني "قصير".', isTrue: false, explanation: '"ארוך" تعني "طويل"، أما "قصير" فهي "קצר".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "جميل / جميلة" بالعبرية؟', options: [{ id: 'a', text: 'מכוער' }, { id: 'b', text: 'יפה' }, { id: 'c', text: 'חזק' }, { id: 'd', text: 'רך' }], correct: 'b', explanation: '"יפה" تعني "جميل / جميلة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "חם" بالعربية؟', options: [{ id: 'a', text: 'بارد' }, { id: 'b', text: 'ناعم' }, { id: 'c', text: 'حار / دافئ' }, { id: 'd', text: 'صلب' }], correct: 'c', explanation: '"חם" تعني "حار" أو "دافئ" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الجمل التالية يعني "القطة البيضاء صغيرة"؟', options: [{ id: 'a', text: 'החתול השחור גדול' }, { id: 'b', text: 'החתולה הלבנה קטנה' }, { id: 'c', text: 'הכלב הלבן קטן' }, { id: 'd', text: 'החתולה הלבנה גדולה' }], correct: 'b', explanation: '"החתולה" القطة، "הלבנה" البيضاء، "קטנה" صغيرة.', difficulty: 3 },
        { type: 'tf', statement: '"קר" بالعبرية تعني "بارد".', isTrue: true, explanation: 'نعم، "קר" تعني "بارد" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Quiz 2 - Colors and Shapes',
      nameHe: 'בחן את עצמך 2',
      nameAr: 'اختبار الوحدة 2',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "أزرق" بالعبرية؟', options: [{ id: 'a', text: 'אדום' }, { id: 'b', text: 'ירוק' }, { id: 'c', text: 'כחול' }, { id: 'd', text: 'צהוב' }], correct: 'c', explanation: '"כחול" تعني "أزرق".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "مثلث" بالعبرية؟', options: [{ id: 'a', text: 'ריבוע' }, { id: 'b', text: 'עיגול' }, { id: 'c', text: 'מלבן' }, { id: 'd', text: 'משולש' }], correct: 'd', explanation: '"משולש" تعني "مثلث".', difficulty: 1 },
        { type: 'tf', statement: '"גדול" بالعبرية تعني "صغير".', isTrue: false, explanation: '"גדול" تعني "كبير"، أما "صغير" فهي "קטן".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הריבוע הצהוב קטן" بالعربية؟', options: [{ id: 'a', text: 'المربع الأصفر كبير' }, { id: 'b', text: 'المثلث الأصفر صغير' }, { id: 'c', text: 'المربع الأصفر صغير' }, { id: 'd', text: 'الدائرة الصفراء صغيرة' }], correct: 'c', explanation: '"ריבוע" مربع، "צהוב" أصفر، "קטן" صغير.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أبيض" بالعبرية؟', options: [{ id: 'a', text: 'שחור' }, { id: 'b', text: 'לבן' }, { id: 'c', text: 'אפור' }, { id: 'd', text: 'כתום' }], correct: 'b', explanation: '"לבן" تعني "أبيض".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "יפה" بالعربية؟', options: [{ id: 'a', text: 'قبيح' }, { id: 'b', text: 'كبير' }, { id: 'c', text: 'جميل' }, { id: 'd', text: 'سريع' }], correct: 'c', explanation: '"יפה" تعني "جميل".', difficulty: 1 },
        { type: 'tf', statement: '"כחול" بالعبرية هو لون السماء والبحر.', isTrue: true, explanation: 'نعم، السماء والبحر أزرقان، و"כחול" تعني أزرق.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "دائرة" بالعبرية؟', options: [{ id: 'a', text: 'משולש' }, { id: 'b', text: 'מלבן' }, { id: 'c', text: 'עיגול' }, { id: 'd', text: 'ריבוע' }], correct: 'c', explanation: '"עיגול" تعني "دائرة".', difficulty: 1 },
      ],
    },
  ],
};

// ── Unit 3: בית הספר ──────────────────────────────────────────────────────────
const unit3: UnitDef = {
  nameEn: 'School',
  nameHe: 'בית הספר',
  nameAr: 'المدرسة',
  levelNameEn: 'School Level 1',
  levelNameAr: 'المدرسة - المستوى الأول',
  xpReward: 20,
  lessons: [
    {
      nameEn: 'Classroom Objects',
      nameHe: 'חפצים בכיתה',
      nameAr: 'أدوات الفصل',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "كتاب" بالعبرية؟', options: [{ id: 'a', text: 'עיפרון' }, { id: 'b', text: 'ספר' }, { id: 'c', text: 'מחברת' }, { id: 'd', text: 'סרגל' }], correct: 'b', explanation: '"ספר" تعني "كتاب" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "עיפרון" بالعربية؟', options: [{ id: 'a', text: 'قلم حبر' }, { id: 'b', text: 'مسطرة' }, { id: 'c', text: 'قلم رصاص' }, { id: 'd', text: 'ممحاة' }], correct: 'c', explanation: '"עיפרון" تعني "قلم رصاص" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "دفتر" بالعبرية؟', options: [{ id: 'a', text: 'ספר' }, { id: 'b', text: 'לוח' }, { id: 'c', text: 'מחברת' }, { id: 'd', text: 'תיק' }], correct: 'c', explanation: '"מחברת" تعني "دفتر" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"לוח" بالعبرية تعني "الكتاب".', isTrue: false, explanation: '"לוח" تعني "سبورة / لوح"، أما الكتاب فهو "ספר".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "מחק" بالعربية؟', options: [{ id: 'a', text: 'قلم' }, { id: 'b', text: 'مقص' }, { id: 'c', text: 'ممحاة' }, { id: 'd', text: 'مسطرة' }], correct: 'c', explanation: '"מחק" تعني "ممحاة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "حقيبة مدرسية" بالعبرية؟', options: [{ id: 'a', text: 'תיק בית ספר' }, { id: 'b', text: 'ספר לימוד' }, { id: 'c', text: 'מחברת כיתה' }, { id: 'd', text: 'עיפרון צבעוני' }], correct: 'a', explanation: '"תיק בית ספר" تعني "حقيبة مدرسية" بالعبرية.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "יש לי עיפרון ומחק" بالعربية؟', options: [{ id: 'a', text: 'عندي كتاب ودفتر' }, { id: 'b', text: 'عندي قلم رصاص وممحاة' }, { id: 'c', text: 'عندي قلم وأقلام ملونة' }, { id: 'd', text: 'عندي مسطرة ومقص' }], correct: 'b', explanation: '"יש לי" عندي، "עיפרון" قلم رصاص، "מחק" ممحاة.', difficulty: 2 },
        { type: 'tf', statement: '"ספר" بالعبرية تعني "كتاب".', isTrue: true, explanation: 'نعم، "ספר" تعني "كتاب" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'School Subjects',
      nameHe: 'מקצועות',
      nameAr: 'المواد الدراسية',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "رياضيات" بالعبرية؟', options: [{ id: 'a', text: 'עברית' }, { id: 'b', text: 'מדעים' }, { id: 'c', text: 'מתמטיקה' }, { id: 'd', text: 'היסטוריה' }], correct: 'c', explanation: '"מתמטיקה" تعني "رياضيات" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "מדעים" بالعربية؟', options: [{ id: 'a', text: 'رياضيات' }, { id: 'b', text: 'علوم' }, { id: 'c', text: 'أدب' }, { id: 'd', text: 'تاريخ' }], correct: 'b', explanation: '"מדעים" تعني "علوم" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "لغة عبرية" بالعبرية؟', options: [{ id: 'a', text: 'עברית' }, { id: 'b', text: 'ערבית' }, { id: 'c', text: 'אנגלית' }, { id: 'd', text: 'צרפתית' }], correct: 'a', explanation: '"עברית" تعني "العبرية" - اللغة العبرية.', difficulty: 1 },
        { type: 'tf', statement: '"ערבית" بالعبرية تعني "اللغة العبرية".', isTrue: false, explanation: '"ערבית" تعني "اللغة العربية"، أما "العبرية" فهي "עברית".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני אוהב מתמטיקה" بالعربية؟', options: [{ id: 'a', text: 'أنا لا أحب الرياضيات' }, { id: 'b', text: 'أنا أحب الرياضيات' }, { id: 'c', text: 'الرياضيات صعبة' }, { id: 'd', text: 'أنا أدرس الرياضيات' }], correct: 'b', explanation: '"אוהב" أحب، و"מתמטיקה" رياضيات.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "تاريخ" بالعبرية؟', options: [{ id: 'a', text: 'גיאוגרפיה' }, { id: 'b', text: 'מדעים' }, { id: 'c', text: 'היסטוריה' }, { id: 'd', text: 'ספרות' }], correct: 'c', explanation: '"היסטוריה" تعني "تاريخ" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "השיעור מעניין" بالعربية؟', options: [{ id: 'a', text: 'الدرس سهل' }, { id: 'b', text: 'الدرس ممتع / مثير للاهتمام' }, { id: 'c', text: 'الدرس طويل' }, { id: 'd', text: 'الدرس منتهٍ' }], correct: 'b', explanation: '"מעניין" تعني "مثير للاهتمام / ممتع".', difficulty: 2 },
        { type: 'tf', statement: '"אנגלית" بالعبرية تعني "اللغة الإنجليزية".', isTrue: true, explanation: 'نعم، "אנגלית" تعني "الإنجليزية".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Friends and Teacher',
      nameHe: 'חברים ומורה',
      nameAr: 'أصدقاء ومعلم',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "معلم / مدرس" (ذكر) بالعبرية؟', options: [{ id: 'a', text: 'תלמיד' }, { id: 'b', text: 'מורה' }, { id: 'c', text: 'מנהל' }, { id: 'd', text: 'חבר' }], correct: 'b', explanation: '"מורה" تعني "معلم / مدرس" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "חבר" بالعربية؟', options: [{ id: 'a', text: 'معلم' }, { id: 'b', text: 'أخ' }, { id: 'c', text: 'صديق' }, { id: 'd', text: 'مدير' }], correct: 'c', explanation: '"חבר" تعني "صديق" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "صديقة" (مؤنث) بالعبرية؟', options: [{ id: 'a', text: 'חבר' }, { id: 'b', text: 'חברה' }, { id: 'c', text: 'מורה' }, { id: 'd', text: 'תלמידה' }], correct: 'b', explanation: '"חברה" تعني "صديقة" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"כיתה" بالعبرية تعني "الفصل الدراسي".', isTrue: true, explanation: 'نعم، "כיתה" تعني "الفصل الدراسي".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הכיתה שלי גדולה" بالعربية؟', options: [{ id: 'a', text: 'فصلي صغير' }, { id: 'b', text: 'فصلي جديد' }, { id: 'c', text: 'فصلي كبير' }, { id: 'd', text: 'فصلي جميل' }], correct: 'c', explanation: '"הכיתה שלי" فصلي، و"גדולה" كبيرة.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "طالب" (مذكر) بالعبرية؟', options: [{ id: 'a', text: 'תלמידה' }, { id: 'b', text: 'מורה' }, { id: 'c', text: 'תלמיד' }, { id: 'd', text: 'חבר' }], correct: 'c', explanation: '"תלמיד" تعني "طالب" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "יש לנו מורה טובה" بالعربية؟', options: [{ id: 'a', text: 'عندنا معلمة سيئة' }, { id: 'b', text: 'عندنا معلمة جيدة' }, { id: 'c', text: 'معلمتنا صارمة' }, { id: 'd', text: 'عندنا معلمة جديدة' }], correct: 'b', explanation: '"יש לנו" عندنا، "מורה" معلمة، "טובה" جيدة.', difficulty: 2 },
        { type: 'tf', statement: '"מנהל" بالعبرية تعني "طالب".', isTrue: false, explanation: '"מנהל" تعني "مدير"، أما الطالب فهو "תלמיד".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Quiz 3 - School',
      nameHe: 'בחן את עצמך 3',
      nameAr: 'اختبار الوحدة 3',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "كتاب" بالعبرية؟', options: [{ id: 'a', text: 'מחברת' }, { id: 'b', text: 'עיפרון' }, { id: 'c', text: 'ספר' }, { id: 'd', text: 'תיק' }], correct: 'c', explanation: '"ספר" تعني "كتاب".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "علوم" بالعبرية؟', options: [{ id: 'a', text: 'מתמטיקה' }, { id: 'b', text: 'עברית' }, { id: 'c', text: 'היסטוריה' }, { id: 'd', text: 'מדעים' }], correct: 'd', explanation: '"מדעים" تعني "علوم".', difficulty: 1 },
        { type: 'tf', statement: '"חבר" بالعبرية تعني "معلم".', isTrue: false, explanation: '"חבר" تعني "صديق"، أما المعلم فهو "מורה".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני תלמיד בכיתה ג" بالعربية؟', options: [{ id: 'a', text: 'أنا معلم في الصف الثالث' }, { id: 'b', text: 'أنا طالب في الصف الثالث' }, { id: 'c', text: 'أنا في الصف الأول' }, { id: 'd', text: 'أنا طالب في المدرسة' }], correct: 'b', explanation: '"תלמיד" طالب، "כיתה ג" الصف الثالث.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "ممحاة" بالعبرية؟', options: [{ id: 'a', text: 'עיפרון' }, { id: 'b', text: 'סרגל' }, { id: 'c', text: 'מחק' }, { id: 'd', text: 'מספריים' }], correct: 'c', explanation: '"מחק" تعني "ممحاة".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "המורה שלנו נחמד" بالعربية؟', options: [{ id: 'a', text: 'معلمنا صارم' }, { id: 'b', text: 'معلمنا لطيف / طيب' }, { id: 'c', text: 'معلمنا جديد' }, { id: 'd', text: 'معلمنا غائب' }], correct: 'b', explanation: '"נחמד" تعني "لطيف / طيب".', difficulty: 2 },
        { type: 'tf', statement: '"מתמטיקה" بالعبرية تعني "رياضيات".', isTrue: true, explanation: 'نعم، "מתמטיקה" تعني "رياضيات".', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "دفتر" بالعبرية؟', options: [{ id: 'a', text: 'ספר' }, { id: 'b', text: 'מחברת' }, { id: 'c', text: 'עיפרון' }, { id: 'd', text: 'לוח' }], correct: 'b', explanation: '"מחברת" تعني "دفتر".', difficulty: 1 },
      ],
    },
  ],
};

// ── Unit 4: אוכל ושתייה ───────────────────────────────────────────────────────
const unit4: UnitDef = {
  nameEn: 'Food and Drinks',
  nameHe: 'אוכל ושתייה',
  nameAr: 'الطعام والشراب',
  levelNameEn: 'Food Level 1',
  levelNameAr: 'الطعام - المستوى الأول',
  xpReward: 20,
  lessons: [
    {
      nameEn: 'Fruits and Vegetables',
      nameHe: 'פירות וירקות',
      nameAr: 'فواكه وخضروات',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "تفاحة" بالعبرية؟', options: [{ id: 'a', text: 'בננה' }, { id: 'b', text: 'תפוז' }, { id: 'c', text: 'תפוח' }, { id: 'd', text: 'ענב' }], correct: 'c', explanation: '"תפוח" تعني "تفاحة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "בננה" بالعربية؟', options: [{ id: 'a', text: 'برتقالة' }, { id: 'b', text: 'موزة' }, { id: 'c', text: 'عنبة' }, { id: 'd', text: 'كمثرى' }], correct: 'b', explanation: '"בננה" تعني "موزة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "جزرة" بالعبرية؟', options: [{ id: 'a', text: 'עגבנייה' }, { id: 'b', text: 'מלפפון' }, { id: 'c', text: 'גזר' }, { id: 'd', text: 'בצל' }], correct: 'c', explanation: '"גזר" تعني "جزرة" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"עגבנייה" بالعبرية تعني "خيارة".', isTrue: false, explanation: '"עגבנייה" تعني "طماطم"، أما الخيار فهو "מלפפון".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "תפוז" بالعربية؟', options: [{ id: 'a', text: 'ليمون' }, { id: 'b', text: 'تفاحة' }, { id: 'c', text: 'برتقالة' }, { id: 'd', text: 'مشمش' }], correct: 'c', explanation: '"תפוז" تعني "برتقالة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "طماطم" بالعبرية؟', options: [{ id: 'a', text: 'גזר' }, { id: 'b', text: 'עגבנייה' }, { id: 'c', text: 'תפוח' }, { id: 'd', text: 'ענב' }], correct: 'b', explanation: '"עגבנייה" تعني "طماطم" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני אוהב פירות" بالعربية؟', options: [{ id: 'a', text: 'أنا لا أحب الفاكهة' }, { id: 'b', text: 'أنا أحب الخضروات' }, { id: 'c', text: 'أنا أحب الفاكهة' }, { id: 'd', text: 'الفاكهة لذيذة' }], correct: 'c', explanation: '"אוהב" أحب، و"פירות" فاكهة.', difficulty: 2 },
        { type: 'tf', statement: '"ענב" بالعبرية تعني "عنب".', isTrue: true, explanation: 'نعم، "ענב" تعني "عنب / حبة عنب" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Meals',
      nameHe: 'ארוחות',
      nameAr: 'الوجبات',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "فطور / إفطار" بالعبرية؟', options: [{ id: 'a', text: 'ארוחת צהריים' }, { id: 'b', text: 'ארוחת ערב' }, { id: 'c', text: 'ארוחת בוקר' }, { id: 'd', text: 'חטיף' }], correct: 'c', explanation: '"ארוחת בוקר" تعني "وجبة الصباح / الفطور".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "ארוחת צהריים" بالعربية؟', options: [{ id: 'a', text: 'وجبة الفطور' }, { id: 'b', text: 'وجبة الغداء' }, { id: 'c', text: 'وجبة العشاء' }, { id: 'd', text: 'وجبة خفيفة' }], correct: 'b', explanation: '"ארוחת צהריים" تعني "وجبة الغداء".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "ماء" بالعبرية؟', options: [{ id: 'a', text: 'חלב' }, { id: 'b', text: 'מיץ' }, { id: 'c', text: 'מים' }, { id: 'd', text: 'תה' }], correct: 'c', explanation: '"מים" تعني "ماء" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"חלב" بالعبرية تعني "عصير".', isTrue: false, explanation: '"חלב" تعني "حليب"، أما العصير فهو "מיץ".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "לחם" بالعربية؟', options: [{ id: 'a', text: 'أرز' }, { id: 'b', text: 'خبز' }, { id: 'c', text: 'مكرونة' }, { id: 'd', text: 'بيضة' }], correct: 'b', explanation: '"לחם" تعني "خبز" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أنا جائع" بالعبرية؟', options: [{ id: 'a', text: 'אני שבע' }, { id: 'b', text: 'אני עייף' }, { id: 'c', text: 'אני צמא' }, { id: 'd', text: 'אני רעב' }], correct: 'd', explanation: '"אני רעב" تعني "أنا جائع".', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "ארוחת ערב" بالعربية؟', options: [{ id: 'a', text: 'وجبة الفطور' }, { id: 'b', text: 'وجبة الغداء' }, { id: 'c', text: 'وجبة العشاء' }, { id: 'd', text: 'وجبة خاصة' }], correct: 'c', explanation: '"ארוחת ערב" تعني "وجبة العشاء".', difficulty: 1 },
        { type: 'tf', statement: '"מים" بالعبرية تعني "ماء".', isTrue: true, explanation: 'نعم، "מים" تعني "ماء" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'I Like',
      nameHe: 'אני אוהב',
      nameAr: 'أنا أحب',
      durationMin: 10,
      questions: [
        { type: 'mc', text: 'كيف تقول "أنا أحب البيتزا" بالعبرية؟', options: [{ id: 'a', text: 'אני שונא פיצה' }, { id: 'b', text: 'אני אוהב פיצה' }, { id: 'c', text: 'אני רוצה פיצה' }, { id: 'd', text: 'יש לי פיצה' }], correct: 'b', explanation: '"אני אוהב פיצה" تعني "أنا أحب البيتزا".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני לא אוהב בצל" بالعربية؟', options: [{ id: 'a', text: 'أنا أحب البصل' }, { id: 'b', text: 'أنا لا أحب البصل' }, { id: 'c', text: 'أنا آكل البصل' }, { id: 'd', text: 'البصل لذيذ' }], correct: 'b', explanation: '"לא אוהב" لا أحب، و"בצל" البصل.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "لذيذ" بالعبرية؟', options: [{ id: 'a', text: 'רע' }, { id: 'b', text: 'חריף' }, { id: 'c', text: 'טעים' }, { id: 'd', text: 'מר' }], correct: 'c', explanation: '"טעים" تعني "لذيذ" بالعبرية.', difficulty: 1 },
        { type: 'tf', statement: '"שוקולד" بالعبرية تعني "الشوكولاتة".', isTrue: true, explanation: 'نعم، "שוקולד" تعني "شوكولاتة" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "מה אתה אוהב לאכול?" بالعربية؟', options: [{ id: 'a', text: 'ماذا تشرب؟' }, { id: 'b', text: 'ماذا تحب أن تأكل؟' }, { id: 'c', text: 'هل أنت جائع؟' }, { id: 'd', text: 'ما طعامك المفضل؟' }], correct: 'b', explanation: '"מה" ماذا، "אוהב לאכול" تحب أن تأكل.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أريد ماءً" بالعبرية؟', options: [{ id: 'a', text: 'אני שותה מים' }, { id: 'b', text: 'אני רוצה מים' }, { id: 'c', text: 'יש לי מים' }, { id: 'd', text: 'אני אוהב מים' }], correct: 'b', explanation: '"אני רוצה" أنا أريد، و"מים" ماء.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "הפיצה טעימה מאוד" بالعربية؟', options: [{ id: 'a', text: 'البيتزا سيئة جداً' }, { id: 'b', text: 'البيتزا لذيذة جداً' }, { id: 'c', text: 'البيتزا كبيرة جداً' }, { id: 'd', text: 'البيتزا حارة جداً' }], correct: 'b', explanation: '"טעימה" لذيذة، و"מאוד" جداً.', difficulty: 2 },
        { type: 'tf', statement: '"לאכול" بالعبرية تعني "يشرب".', isTrue: false, explanation: '"לאכול" تعني "يأكل / للأكل"، أما "يشرب" فهي "לשתות".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Quiz 4 - Food and Drinks',
      nameHe: 'בחן את עצמך 4',
      nameAr: 'اختبار الوحدة 4',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "برتقالة" بالعبرية؟', options: [{ id: 'a', text: 'תפוח' }, { id: 'b', text: 'בננה' }, { id: 'c', text: 'תפוז' }, { id: 'd', text: 'ענב' }], correct: 'c', explanation: '"תפוז" تعني "برتقالة".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "وجبة الغداء" بالعبرية؟', options: [{ id: 'a', text: 'ארוחת בוקר' }, { id: 'b', text: 'ארוחת צהריים' }, { id: 'c', text: 'ארוחת ערב' }, { id: 'd', text: 'חטיף' }], correct: 'b', explanation: '"ארוחת צהריים" تعني "وجبة الغداء".', difficulty: 1 },
        { type: 'tf', statement: '"מים" بالعبرية تعني "حليب".', isTrue: false, explanation: '"מים" تعني "ماء"، أما الحليب فهو "חלב".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני רעב ורוצה לאכול" بالعربية؟', options: [{ id: 'a', text: 'أنا عطشان وأريد أن أشرب' }, { id: 'b', text: 'أنا جائع وأريد أن آكل' }, { id: 'c', text: 'أنا أحب الطعام' }, { id: 'd', text: 'أنا آكل ببطء' }], correct: 'b', explanation: '"רעב" جائع، "רוצה לאכול" أريد أن آكل.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "خبز" بالعبرية؟', options: [{ id: 'a', text: 'אורז' }, { id: 'b', text: 'פסטה' }, { id: 'c', text: 'לחם' }, { id: 'd', text: 'ביצה' }], correct: 'c', explanation: '"לחם" تعني "خبز".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הגזר טעים" بالعربية؟', options: [{ id: 'a', text: 'الجزرة كبيرة' }, { id: 'b', text: 'الجزرة حمراء' }, { id: 'c', text: 'الجزرة لذيذة' }, { id: 'd', text: 'الجزرة صغيرة' }], correct: 'c', explanation: '"גזר" جزرة، و"טעים" لذيذ.', difficulty: 2 },
        { type: 'tf', statement: '"אני אוהב שוקולד" بالعبرية تعني "أنا أحب الشوكولاتة".', isTrue: true, explanation: '"אוהב" أحب، و"שוקולד" شوكولاتة.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "جزرة" بالعبرية؟', options: [{ id: 'a', text: 'עגבנייה' }, { id: 'b', text: 'מלפפון' }, { id: 'c', text: 'גזר' }, { id: 'd', text: 'בצל' }], correct: 'c', explanation: '"גזר" تعني "جزرة".', difficulty: 1 },
      ],
    },
  ],
};

// ── Unit 5: פעלים יומיומיים ────────────────────────────────────────────────────
const unit5: UnitDef = {
  nameEn: 'Daily Verbs',
  nameHe: 'פעלים יומיומיים',
  nameAr: 'الأفعال اليومية',
  levelNameEn: 'Verbs Level 1',
  levelNameAr: 'الأفعال - المستوى الأول',
  xpReward: 25,
  lessons: [
    {
      nameEn: 'Morning Routine',
      nameHe: 'הבוקר',
      nameAr: 'الصباح',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "أنا أستيقظ" بالعبرية؟', options: [{ id: 'a', text: 'אני ישן' }, { id: 'b', text: 'אני מתעורר' }, { id: 'c', text: 'אני לומד' }, { id: 'd', text: 'אני אוכל' }], correct: 'b', explanation: '"אני מתעורר" تعني "أنا أستيقظ".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני מתרחץ" بالعربية؟', options: [{ id: 'a', text: 'أنا أنام' }, { id: 'b', text: 'أنا أستحم' }, { id: 'c', text: 'أنا آكل' }, { id: 'd', text: 'أنا ألبس' }], correct: 'b', explanation: '"מתרחץ" تعني يستحم، فـ"אני מתרחץ" تعني "أنا أستحم".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أنا أتناول الفطور" بالعبرية؟', options: [{ id: 'a', text: 'אני ישן' }, { id: 'b', text: 'אני אוכל ארוחת ערב' }, { id: 'c', text: 'אני אוכל ארוחת בוקר' }, { id: 'd', text: 'אני שותה מים' }], correct: 'c', explanation: '"אוכל ארוחת בוקר" تعني يتناول وجبة الصباح.', difficulty: 2 },
        { type: 'tf', statement: '"הולך לבית ספר" بالعبرية تعني "يذهب إلى المدرسة".', isTrue: true, explanation: '"הולך" يذهب، و"לבית ספר" إلى المدرسة.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני לובש בגדים" بالعربية؟', options: [{ id: 'a', text: 'أنا أخلع ملابسي' }, { id: 'b', text: 'أنا أرتدي ملابسي' }, { id: 'c', text: 'أنا أغسل ملابسي' }, { id: 'd', text: 'أنا أشتري ملابس' }], correct: 'b', explanation: '"לובש" يرتدي، و"בגדים" ملابس.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "الصباح" بالعبرية؟', options: [{ id: 'a', text: 'לילה' }, { id: 'b', text: 'צהריים' }, { id: 'c', text: 'בוקר' }, { id: 'd', text: 'ערב' }], correct: 'c', explanation: '"בוקר" تعني "الصباح" بالعبرية.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "בוקר טוב" بالعربية؟', options: [{ id: 'a', text: 'مساء الخير' }, { id: 'b', text: 'صباح الخير' }, { id: 'c', text: 'تصبح على خير' }, { id: 'd', text: 'مرحباً' }], correct: 'b', explanation: '"בוקר" صباح، و"טוב" خير/جيد.', difficulty: 1 },
        { type: 'tf', statement: '"אני ישן" بالعبرية تعني "أنا أستيقظ".', isTrue: false, explanation: '"ישן" تعني ينام، فـ"אני ישן" تعني "أنا أنام".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Afternoon Activities',
      nameHe: 'אחר הצהריים',
      nameAr: 'بعد الظهر',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'كيف تقول "أنا أذاكر / أدرس" بالعبرية؟', options: [{ id: 'a', text: 'אני משחק' }, { id: 'b', text: 'אני לומד' }, { id: 'c', text: 'אני שר' }, { id: 'd', text: 'אני רץ' }], correct: 'b', explanation: '"אני לומד" تعني "أنا أدرس".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני משחק עם חברים" بالعربية؟', options: [{ id: 'a', text: 'أنا أدرس مع أصدقائي' }, { id: 'b', text: 'أنا ألعب مع أصدقائي' }, { id: 'c', text: 'أنا أتحدث مع أصدقائي' }, { id: 'd', text: 'أنا أساعد أصدقائي' }], correct: 'b', explanation: '"משחק" يلعب، و"עם חברים" مع أصدقاء.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أتناول الغداء" بالعبرية؟', options: [{ id: 'a', text: 'אני אוכל ארוחת בוקר' }, { id: 'b', text: 'אני אוכל ארוחת ערב' }, { id: 'c', text: 'אני אוכל ארוחת צהריים' }, { id: 'd', text: 'אני שותה מיץ' }], correct: 'c', explanation: '"אוכל ארוחת צהריים" يتناول وجبة الغداء.', difficulty: 2 },
        { type: 'tf', statement: '"אחר הצהריים" بالعبرية تعني "الصباح".', isTrue: false, explanation: '"אחר הצהריים" تعني "بعد الظهر"، أما الصباح فهو "בוקר".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני קורא ספר" بالعربية؟', options: [{ id: 'a', text: 'أنا أكتب كتاباً' }, { id: 'b', text: 'أنا أقرأ كتاباً' }, { id: 'c', text: 'أنا أشتري كتاباً' }, { id: 'd', text: 'أنا أفتح كتاباً' }], correct: 'b', explanation: '"קורא" يقرأ، و"ספר" كتاب.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أشاهد التلفاز" بالعبرية؟', options: [{ id: 'a', text: 'אני מקשיב למוזיקה' }, { id: 'b', text: 'אני רואה טלוויזיה' }, { id: 'c', text: 'אני משחק מחשב' }, { id: 'd', text: 'אני מצייר' }], correct: 'b', explanation: '"רואה טלוויזיה" يشاهد التلفاز.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "אני עוזר לאמא" بالعربية؟', options: [{ id: 'a', text: 'أنا أساعد أبي' }, { id: 'b', text: 'أنا أساعد أمي' }, { id: 'c', text: 'أنا أنادي أمي' }, { id: 'd', text: 'أنا مع أمي' }], correct: 'b', explanation: '"עוזר" يساعد، و"לאמא" لأمي.', difficulty: 2 },
        { type: 'tf', statement: '"לומד" بالعبرية تعني "يلعب".', isTrue: false, explanation: '"לומד" تعني "يدرس"، أما "يلعب" فهي "משחק".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Night Routine',
      nameHe: 'הלילה',
      nameAr: 'الليل',
      durationMin: 10,
      questions: [
        { type: 'mc', text: 'كيف تقول "تصبح على خير" بالعبرية؟', options: [{ id: 'a', text: 'בוקר טוב' }, { id: 'b', text: 'לילה טוב' }, { id: 'c', text: 'ערב טוב' }, { id: 'd', text: 'שלום' }], correct: 'b', explanation: '"לילה טוב" تعني "تصبح على خير / ليلة طيبة".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני עייף" بالعربية؟', options: [{ id: 'a', text: 'أنا جائع' }, { id: 'b', text: 'أنا سعيد' }, { id: 'c', text: 'أنا تعبان / متعب' }, { id: 'd', text: 'أنا نعسان' }], correct: 'c', explanation: '"עייף" تعني "متعب / تعبان".', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أنا أغسل أسناني" بالعبرية؟', options: [{ id: 'a', text: 'אני מתרחץ' }, { id: 'b', text: 'אני שוטף את הידיים' }, { id: 'c', text: 'אני מצחצח שיניים' }, { id: 'd', text: 'אני לובש פיג׳מה' }], correct: 'c', explanation: '"מצחצח שיניים" يفرك/يغسل أسنانه.', difficulty: 2 },
        { type: 'tf', statement: '"לילה" بالعبرية تعني "النهار".', isTrue: false, explanation: '"לילה" تعني "الليل"، أما النهار فهو "יום".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני הולך לישון" بالعربية؟', options: [{ id: 'a', text: 'أنا أستيقظ' }, { id: 'b', text: 'أنا ذاهب للنوم' }, { id: 'c', text: 'أنا نائم' }, { id: 'd', text: 'أنا مستعد للنوم' }], correct: 'b', explanation: '"הולך לישון" ذاهب للنوم.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "مساء الخير" بالعبرية؟', options: [{ id: 'a', text: 'בוקר טוב' }, { id: 'b', text: 'לילה טוב' }, { id: 'c', text: 'ערב טוב' }, { id: 'd', text: 'צהריים טובים' }], correct: 'c', explanation: '"ערב טוב" تعني "مساء الخير".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "חלומות טובים" بالعربية؟', options: [{ id: 'a', text: 'نوم هنيئاً' }, { id: 'b', text: 'تصبح على خير' }, { id: 'c', text: 'أحلام سعيدة' }, { id: 'd', text: 'ليلة طيبة' }], correct: 'c', explanation: '"חלומות" أحلام، و"טובים" جيدة/سعيدة.', difficulty: 2 },
        { type: 'tf', statement: '"ערב" بالعبرية تعني "المساء".', isTrue: true, explanation: 'نعم، "ערב" تعني "المساء / الليل المبكر".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Quiz 5 - Daily Verbs',
      nameHe: 'בחן את עצמך 5',
      nameAr: 'اختبار الوحدة 5',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'ما معنى "אני מתעורר בבוקר" بالعربية؟', options: [{ id: 'a', text: 'أنا أنام في الصباح' }, { id: 'b', text: 'أنا أستيقظ في الصباح' }, { id: 'c', text: 'أنا ذاهب في الصباح' }, { id: 'd', text: 'أنا تعبان في الصباح' }], correct: 'b', explanation: '"מתעורר" يستيقظ، و"בבוקר" في الصباح.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أدرس" بالعبرية؟', options: [{ id: 'a', text: 'אני משחק' }, { id: 'b', text: 'אני רץ' }, { id: 'c', text: 'אני לומד' }, { id: 'd', text: 'אני ישן' }], correct: 'c', explanation: '"לומד" يدرس، فـ"אני לומד" تعني "أنا أدرس".', difficulty: 1 },
        { type: 'tf', statement: '"לילה טוב" بالعبرية تعني "صباح الخير".', isTrue: false, explanation: '"לילה טוב" تعني "تصبح على خير"، أما صباح الخير فهي "בוקר טוב".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני אוכל ארוחת ערב עם המשפחה" بالعربية؟', options: [{ id: 'a', text: 'أنا آكل الفطور مع العائلة' }, { id: 'b', text: 'أنا آكل العشاء مع العائلة' }, { id: 'c', text: 'أنا أشرب مع العائلة' }, { id: 'd', text: 'أنا أجلس مع العائلة' }], correct: 'b', explanation: '"ארוחת ערב" العشاء، و"עם המשפחה" مع العائلة.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أنام" بالعبرية؟', options: [{ id: 'a', text: 'אני מתעורר' }, { id: 'b', text: 'אני עייף' }, { id: 'c', text: 'אני ישן' }, { id: 'd', text: 'אני נח' }], correct: 'c', explanation: '"אני ישן" تعني "أنا أنام".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "ערב טוב" بالعربية؟', options: [{ id: 'a', text: 'صباح الخير' }, { id: 'b', text: 'أهلاً وسهلاً' }, { id: 'c', text: 'مساء الخير' }, { id: 'd', text: 'تصبح على خير' }], correct: 'c', explanation: '"ערב" المساء، و"טוב" جيد/خير.', difficulty: 1 },
        { type: 'tf', statement: '"משחק" بالعبرية تعني "يدرس".', isTrue: false, explanation: '"משחק" تعني "يلعب"، أما "يدرس" فهي "לומד".', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الجمل التالية تعني "أنا أقرأ كتاباً في المساء"؟', options: [{ id: 'a', text: 'אני לומד בבוקר' }, { id: 'b', text: 'אני קורא ספר בערב' }, { id: 'c', text: 'אני אוכל בערב' }, { id: 'd', text: 'אני ישן בלילה' }], correct: 'b', explanation: '"קורא ספר" يقرأ كتاباً، و"בערב" في المساء.', difficulty: 3 },
      ],
    },
  ],
};

// ── Unit 6: חזרה ומיצב ────────────────────────────────────────────────────────
const unit6: UnitDef = {
  nameEn: 'Review and Metzav',
  nameHe: 'חזרה ומיצב',
  nameAr: 'مراجعة وميتساف',
  levelNameEn: 'Review Level 1',
  levelNameAr: 'المراجعة - المستوى الأول',
  xpReward: 30,
  lessons: [
    {
      nameEn: 'Review Units 1-2',
      nameHe: 'חזרה על יחידות 1-2',
      nameAr: 'مراجعة الوحدات 1-2',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'كيف تقول "أنا" بالعبرية؟', options: [{ id: 'a', text: 'אתה' }, { id: 'b', text: 'אני' }, { id: 'c', text: 'הוא' }, { id: 'd', text: 'היא' }], correct: 'b', explanation: '"אני" تعني "أنا".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "המשפחה שלי" بالعربية؟', options: [{ id: 'a', text: 'بيتي' }, { id: 'b', text: 'أصدقائي' }, { id: 'c', text: 'عائلتي' }, { id: 'd', text: 'مدرستي' }], correct: 'c', explanation: '"המשפחה" العائلة، و"שלי" الخاصة بي.', difficulty: 1 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "أزرق"؟', options: [{ id: 'a', text: 'ירוק' }, { id: 'b', text: 'אדום' }, { id: 'c', text: 'כחול' }, { id: 'd', text: 'צהוב' }], correct: 'c', explanation: '"כחול" تعني "أزرق".', difficulty: 1 },
        { type: 'tf', statement: '"סבא וסבתא" بالعبرية تعني "جد وجدة".', isTrue: true, explanation: 'نعم، "סבא" جد و"סבתא" جدة.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "הבית שלנו לבן" بالعربية؟', options: [{ id: 'a', text: 'بيتنا كبير' }, { id: 'b', text: 'بيتنا جميل' }, { id: 'c', text: 'بيتنا أبيض' }, { id: 'd', text: 'بيتنا قديم' }], correct: 'c', explanation: '"לבן" أبيض، فالجملة تعني "بيتنا أبيض".', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "مثلث أحمر صغير" بالعبرية؟', options: [{ id: 'a', text: 'משולש אדום קטן' }, { id: 'b', text: 'עיגול אדום גדול' }, { id: 'c', text: 'ריבוע אדום קטן' }, { id: 'd', text: 'משולש כחול קטן' }], correct: 'a', explanation: '"משולש" مثلث، "אדום" أحمر، "קטן" صغير.', difficulty: 3 },
        { type: 'mc', text: 'ما معنى "שלום, אני דנה. מה שמך?" بالعربية؟', options: [{ id: 'a', text: 'مرحباً، أنا دانا. كيف حالك؟' }, { id: 'b', text: 'مرحباً، أنا دانا. ما اسمك؟' }, { id: 'c', text: 'وداعاً، أنا دانا. ما اسمك؟' }, { id: 'd', text: 'مرحباً، أنا دانا. كم عمرك؟' }], correct: 'b', explanation: '"שלום" مرحباً، "אני דנה" أنا دانا، "מה שמך" ما اسمك؟', difficulty: 2 },
        { type: 'tf', statement: '"ירוק" بالعبرية تعني "أصفر".', isTrue: false, explanation: '"ירוק" تعني "أخضر"، أما "أصفر" فهي "צהוב".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Review Units 3-4',
      nameHe: 'חזרה על יחידות 3-4',
      nameAr: 'مراجعة الوحدات 3-4',
      durationMin: 15,
      questions: [
        { type: 'mc', text: 'كيف تقول "قلم رصاص" بالعبرية؟', options: [{ id: 'a', text: 'מחק' }, { id: 'b', text: 'סרגל' }, { id: 'c', text: 'עיפרון' }, { id: 'd', text: 'מחברת' }], correct: 'c', explanation: '"עיפרון" تعني "قلم رصاص".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני לומד עברית בבית הספר" بالعربية؟', options: [{ id: 'a', text: 'أنا أتعلم العربية في البيت' }, { id: 'b', text: 'أنا أتعلم العبرية في المدرسة' }, { id: 'c', text: 'أنا أحب العبرية' }, { id: 'd', text: 'أنا في المدرسة' }], correct: 'b', explanation: '"לומד עברית" يتعلم العبرية، "בבית הספר" في المدرسة.', difficulty: 2 },
        { type: 'mc', text: 'أيٌّ من الكلمات التالية تعني "تفاحة"؟', options: [{ id: 'a', text: 'בננה' }, { id: 'b', text: 'תפוח' }, { id: 'c', text: 'תפוז' }, { id: 'd', text: 'ענב' }], correct: 'b', explanation: '"תפוח" تعني "تفاحة".', difficulty: 1 },
        { type: 'tf', statement: '"מתמטיקה" بالعبرية تعني "تاريخ".', isTrue: false, explanation: '"מתמטיקה" تعني "رياضيات"، أما التاريخ فهو "היסטוריה".', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "יש לי חבר טוב בכיתה" بالعربية؟', options: [{ id: 'a', text: 'عندي معلم جيد في الفصل' }, { id: 'b', text: 'عندي صديق جيد في الفصل' }, { id: 'c', text: 'عندي أخ في الفصل' }, { id: 'd', text: 'الفصل كبير وجيد' }], correct: 'b', explanation: '"חבר טוב" صديق جيد، "בכיתה" في الفصل.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا أحب وجبة الغداء" بالعبرية؟', options: [{ id: 'a', text: 'אני אוהב ארוחת בוקר' }, { id: 'b', text: 'אני אוהב ארוחת ערב' }, { id: 'c', text: 'אני אוהב ארוחת צהריים' }, { id: 'd', text: 'אני רעב' }], correct: 'c', explanation: '"ארוחת צהריים" وجبة الغداء.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "המורה מסבירה את השיעור" بالعربية؟', options: [{ id: 'a', text: 'المعلمة تسأل عن الدرس' }, { id: 'b', text: 'المعلمة تشرح الدرس' }, { id: 'c', text: 'المعلمة تكتب الدرس' }, { id: 'd', text: 'المعلمة تقرأ الدرس' }], correct: 'b', explanation: '"מסבירה" تشرح، و"השיעור" الدرس.', difficulty: 3 },
        { type: 'tf', statement: '"לחם" بالعبرية تعني "خبز".', isTrue: true, explanation: 'نعم، "לחם" تعني "خبز" بالعبرية.', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Review Unit 5',
      nameHe: 'חזרה על יחידה 5',
      nameAr: 'مراجعة الوحدة 5',
      durationMin: 12,
      questions: [
        { type: 'mc', text: 'ما معنى "בוקר טוב, אמא!" بالعربية؟', options: [{ id: 'a', text: 'تصبحين على خير يا أمي!' }, { id: 'b', text: 'صباح الخير يا أمي!' }, { id: 'c', text: 'مساء الخير يا أمي!' }, { id: 'd', text: 'أحبك يا أمي!' }], correct: 'b', explanation: '"בוקר טוב" صباح الخير.', difficulty: 1 },
        { type: 'mc', text: 'كيف تقول "أنا أستيقظ الساعة 7" بالعبرية؟', options: [{ id: 'a', text: 'אני ישן בשבע' }, { id: 'b', text: 'אני מתעורר בשבע' }, { id: 'c', text: 'אני לומד בשבע' }, { id: 'd', text: 'אני הולך בשבע' }], correct: 'b', explanation: '"מתעורר" يستيقظ، و"בשבע" في السابعة.', difficulty: 2 },
        { type: 'mc', text: 'أيٌّ من الجمل التالية تعني "أنا ألعب بعد الظهر"؟', options: [{ id: 'a', text: 'אני לומד אחר הצהריים' }, { id: 'b', text: 'אני משחק בבוקר' }, { id: 'c', text: 'אני משחק אחר הצהריים' }, { id: 'd', text: 'אני ישן אחר הצהריים' }], correct: 'c', explanation: '"משחק" يلعب، و"אחר הצהריים" بعد الظهر.', difficulty: 2 },
        { type: 'tf', statement: '"לילה טוב" بالعبرية تعني "تصبح على خير / ليلة طيبة".', isTrue: true, explanation: 'نعم، "לילה טוב" تعني ليلة طيبة / تصبح على خير.', difficulty: 1 },
        { type: 'mc', text: 'ما معنى "אני עושה שיעורים" بالعربية؟', options: [{ id: 'a', text: 'أنا أذهب إلى المدرسة' }, { id: 'b', text: 'أنا أعمل الواجب المنزلي' }, { id: 'c', text: 'أنا أقرأ الكتاب' }, { id: 'd', text: 'أنا أستمع للدرس' }], correct: 'b', explanation: '"עושה שיעורים" يعمل الواجب المنزلي.', difficulty: 2 },
        { type: 'mc', text: 'كيف تقول "أنا متعب جداً" بالعبرية؟', options: [{ id: 'a', text: 'אני שמח מאוד' }, { id: 'b', text: 'אני רעב מאוד' }, { id: 'c', text: 'אני עייף מאוד' }, { id: 'd', text: 'אני ישן מאוד' }], correct: 'c', explanation: '"עייף" متعب، و"מאוד" جداً.', difficulty: 2 },
        { type: 'mc', text: 'ما معنى "אחרי הלילה יבוא בוקר" بالعربية (مثل)؟', options: [{ id: 'a', text: 'الليل يأتي بعد الصباح' }, { id: 'b', text: 'بعد الليل يأتي الصباح' }, { id: 'c', text: 'الليل طويل والصباح قصير' }, { id: 'd', text: 'الصباح والليل متساويان' }], correct: 'b', explanation: '"אחרי הלילה" بعد الليل، "יבוא בוקר" يأتي الصباح.', difficulty: 3 },
        { type: 'tf', statement: '"ישן" بالعبرية تعني "يستيقظ".', isTrue: false, explanation: '"ישן" تعني "ينام"، أما "يستيقظ" فهي "מתעורר".', difficulty: 1 },
      ],
    },
    {
      nameEn: 'Final Exam',
      nameHe: 'מבחן מסכם',
      nameAr: 'الامتحان الختامي',
      durationMin: 20,
      questions: [
        { type: 'mc', text: 'ما ترجمة الجملة: "שלום, אני תלמיד בכיתה ג. יש לי אבא ואמא ואח"؟', options: [{ id: 'a', text: 'مرحباً، أنا معلم في الصف الثالث، عندي أم وأب وأخت' }, { id: 'b', text: 'مرحباً، أنا طالب في الصف الثالث، عندي أب وأم وأخ' }, { id: 'c', text: 'مرحباً، أنا في الصف الثالث، أحب أبي وأمي وأخي' }, { id: 'd', text: 'مرحباً، اسمي في الصف الثالث ولدي عائلة' }], correct: 'b', explanation: '"תלמיד" طالب، "כיתה ג" الصف الثالث، "אבא ואמא ואח" أب وأم وأخ.', difficulty: 3 },
        { type: 'mc', text: 'أيٌّ من الألوان التالية لا ينتمي للقائمة: أزرق، أحمر، مثلث، أخضر؟', options: [{ id: 'a', text: 'כחול (أزرق)' }, { id: 'b', text: 'אדום (أحمر)' }, { id: 'c', text: 'משולש (مثلث)' }, { id: 'd', text: 'ירוק (أخضر)' }], correct: 'c', explanation: '"משולש" (مثلث) شكل هندسي وليس لوناً.', difficulty: 2 },
        { type: 'mc', text: 'ما ترجمة: "אני אוהב לאכול תפוח וגזר בארוחת הצהריים"؟', options: [{ id: 'a', text: 'أنا أحب أن آكل موزاً وجزراً في الفطور' }, { id: 'b', text: 'أنا أحب أن آكل تفاحة وجزراً في الغداء' }, { id: 'c', text: 'أنا آكل تفاحة وطماطم في الغداء' }, { id: 'd', text: 'أنا أحب الغداء بالتفاح' }], correct: 'b', explanation: '"תפוח" تفاحة، "גזר" جزرة، "ארוחת הצהריים" وجبة الغداء.', difficulty: 3 },
        { type: 'tf', statement: 'الجملة "המורה שלנו טובה ונחמדה" تعني "معلمتنا جيدة ولطيفة".', isTrue: true, explanation: '"טובה" جيدة، و"נחמדה" لطيفة.', difficulty: 2 },
        { type: 'mc', text: 'ما ترجمة: "בבוקר אני מתעורר, מתרחץ ואוכל ארוחת בוקר"؟', options: [{ id: 'a', text: 'في المساء أنا أستحم وآكل العشاء' }, { id: 'b', text: 'في الصباح أنا أستيقظ، أستحم وآكل الفطور' }, { id: 'c', text: 'في الصباح أنا أنام وأستحم وأذهب للمدرسة' }, { id: 'd', text: 'في الصباح أنا أستيقظ وآكل الغداء' }], correct: 'b', explanation: '"בבוקר" في الصباح، "מתעורר" أستيقظ، "מתרחץ" أستحم، "ארוחת בוקר" الفطور.', difficulty: 3 },
        { type: 'mc', text: 'أيٌّ من الجمل التالية صحيح نحوياً ومعناها "البيت الأبيض كبير"؟', options: [{ id: 'a', text: 'הבית הלבן גדול' }, { id: 'b', text: 'הבית הכחול קטן' }, { id: 'c', text: 'הבית הגדול לבן' }, { id: 'd', text: 'הלבן הבית גדול' }], correct: 'a', explanation: '"הבית הלבן גדול" = البيت الأبيض كبير — ترتيب صحيح.', difficulty: 3 },
        { type: 'mc', text: 'ما ترجمة: "יש לי חבר טוב. הוא גר בבית גדול. המשפחה שלו נחמדה"؟', options: [{ id: 'a', text: 'لدي صديق جيد. يسكن في بيت كبير. عائلته لطيفة.' }, { id: 'b', text: 'لدي معلم جيد. يعمل في مدرسة كبيرة. عائلته كبيرة.' }, { id: 'c', text: 'لدي أخ جيد. يسكن بعيداً. عائلتي لطيفة.' }, { id: 'd', text: 'لدي صديق. بيته أبيض. يحب عائلته.' }], correct: 'a', explanation: '"חבר טוב" صديق جيد، "גר" يسكن، "גדול" كبير، "נחמדה" لطيفة.', difficulty: 3 },
        { type: 'tf', statement: '"חלומות טובים ולילה טוב" تعني "أحلاماً سعيدة وليلة طيبة".', isTrue: true, explanation: '"חלומות טובים" أحلام سعيدة، و"לילה טוב" ليلة طيبة.', difficulty: 2 },
      ],
    },
  ],
};

const allUnits: UnitDef[] = [unit1, unit2, unit3, unit4, unit5, unit6];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildQuestionPayload(q: Q, lessonId: string, order: number) {
  if (q.type === 'tf') {
    return {
      lessonId,
      type: QuestionType.TRUE_FALSE,
      content: { statement: q.statement },
      correctAnswer: { isTrue: q.isTrue },
      difficulty: q.difficulty,
      order,
    };
  }
  return {
    lessonId,
    type: QuestionType.MULTIPLE_CHOICE,
    content: { questionText: q.text, options: q.options, isMultiSelect: false },
    correctAnswer: { selectedOptionIds: [q.correct] },
    difficulty: q.difficulty,
    order,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export async function seedHebrewGrade3(subjectMap: Record<string, string>) {
  console.log('\n🔤 بدء seed عبري صف 3...');

  const subjectId = subjectMap['Hebrew'];
  if (!subjectId) throw new Error('Hebrew subject not found in subjectMap');

  const section = await prisma.section.upsert({
    where: { subjectId_gradeLevel: { subjectId, gradeLevel: 3 } },
    update: {},
    create: {
      subjectId,
      nameEn: 'Grade 3 Hebrew',
      nameAr: 'عبري - الصف الثالث',
      gradeLevel: 3,
      order: 3,
    },
  });

  const grade = await prisma.grade.upsert({
    where: { level_subjectId: { level: 3, subjectId } },
    update: {},
    create: { level: 3, subjectId },
  });

  let totalQuestions = 0;

  for (let ui = 0; ui < allUnits.length; ui++) {
    const unitDef = allUnits[ui];

    const unit = await prisma.unit.upsert({
      where: { sectionId_nameEn: { sectionId: section.id, nameEn: unitDef.nameEn } },
      update: {},
      create: {
        sectionId: section.id,
        nameEn: unitDef.nameEn,
        nameAr: unitDef.nameAr,
        order: ui + 1,
      },
    });

    const level = await prisma.level.upsert({
      where: { unitId_levelNumber: { unitId: unit.id, levelNumber: 1 } },
      update: {},
      create: {
        unitId: unit.id,
        nameEn: unitDef.levelNameEn,
        nameAr: unitDef.levelNameAr,
        levelNumber: 1,
        xpReward: unitDef.xpReward,
      },
    });

    for (let li = 0; li < unitDef.lessons.length; li++) {
      const lessonDef = unitDef.lessons[li];

      const lesson = await prisma.lesson.upsert({
        where: { levelId_nameEn: { levelId: level.id, nameEn: lessonDef.nameEn } },
        update: { gradeId: grade.id },
        create: {
          levelId: level.id,
          nameEn: lessonDef.nameEn,
          nameAr: lessonDef.nameAr,
          order: li + 1,
          durationMin: lessonDef.durationMin,
          gradeId: grade.id,
        },
      });

      await prisma.question.deleteMany({ where: { lessonId: lesson.id } });

      await prisma.question.createMany({
        data: lessonDef.questions.map((q, qi) => buildQuestionPayload(q, lesson.id, qi + 1)),
      });

      totalQuestions += lessonDef.questions.length;
      console.log(`  ✅ ${unitDef.nameHe} › ${lessonDef.nameHe}: ${lessonDef.questions.length} أسئلة`);
    }
  }

  console.log(`\n✅ عبري صف 3 اكتمل: ${allUnits.length} وحدات، ${allUnits.reduce((s, u) => s + u.lessons.length, 0)} دروس، ${totalQuestions} سؤال`);
}
