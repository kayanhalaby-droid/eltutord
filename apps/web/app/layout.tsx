import type { Metadata } from 'next';
import { LabButton } from '@/components/lab/LabButton';
import { Cairo, Noto_Sans_Arabic, Noto_Sans_Hebrew } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeApplier } from '@/components/ThemeApplier';
import { Toaster } from 'sonner';
import Script from 'next/script';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const notoHebrew = Noto_Sans_Hebrew({
  subsets: ['hebrew'],
  variable: '--font-noto-hebrew',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'الموجه الذكي — EliTutor',
  description: 'منصة تعليمية ممتعة للطلاب العرب في إسرائيل',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${notoArabic.variable} ${notoHebrew.variable}`}
    >
      <body className={cairo.className} suppressHydrationWarning>
        <QueryProvider>
          <ThemeApplier />
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-center" richColors closeButton />
          <LabButton />
        </QueryProvider>
        {/* UTM tracking — captures utm_* params on first visit */}
        <Script id="utm-tracker" strategy="afterInteractive">{`
          (function(){
            try {
              var p = new URLSearchParams(window.location.search);
              var src = p.get('utm_source'), med = p.get('utm_medium'), cam = p.get('utm_campaign');
              if (src || med || cam) {
                sessionStorage.setItem('utm', JSON.stringify({ utm_source: src, utm_medium: med, utm_campaign: cam }));
              }
            } catch(e) {}
          })();
        `}</Script>
      </body>
    </html>
  );
}
