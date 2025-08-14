import { Geist, Geist_Mono } from "next/font/google";
import { getDictionary } from './dictionaries';
import { Providers } from '@/lib/providers';
import { getDirection, locales, type Locale } from '@/i18n';
import "../globals.css";
import { Toaster} from 'sonner';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  // Use fixed metadata values to avoid issues with missing translations
  return {
    title: "NEDX CRM",
    description: "NEDX CRM Platform",
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    return null; // or redirect to 404
  }

  const direction = getDirection(locale as Locale);
  // Load messages for next-intl client components
  const messages = await getDictionary(locale as 'en' | 'de' | 'ar' | 'it');

  return (
    <html lang={locale} dir={direction}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
        <Toaster />
        {/* !! I18N */}
      </body>
    </html>
  );
} 