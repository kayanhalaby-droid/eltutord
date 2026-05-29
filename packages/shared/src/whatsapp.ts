// WhatsApp Business API — from SUPPLEMENT Override #3

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/^0/, '972'),
        type: 'text',
        text: { body: message },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${error}`);
  }
}

export const PARENT_MESSAGES = {
  dailySummary: (childName: string, minutes: number, subject: string) =>
    `السلام عليكم! ${childName} درس اليوم ${minutes} دقيقة وأكمل وحدة في ${subject} 🎉`,

  streakAlert: (childName: string, streak: number) =>
    `تحذير: ${childName} قد يفقد سلسلة ${streak} يوم! يحتاج تذكير 🔥`,

  weeklyReport: (childName: string, units: number, accuracy: number) =>
    `تقرير الأسبوع: ${childName} أكمل ${units} وحدات بدقة ${accuracy}% ⭐`,

  rewardRequest: (childName: string, reward: string, gems: number) =>
    `${childName} يطلب مكافأة "${reward}" مقابل ${gems} جوهرة 💎`,
};
