import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Code, Palette, Users } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const t = useTranslations('home');
  const tAuth = useTranslations('auth');

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
            <Image 
              src="https://i.postimg.cc/PfWyMjKv/image-removebg-preview.png" 
              alt="NEDX" 
              width={120} 
              height={40}
              className="object-contain"
            />
            </Link>

            {/* Right side nav items */}
            <div className="flex items-center gap-4">
              {/* <LanguageSwitcher /> */}
              <Button asChild variant="default" size="lg">
                <Link href="/login">{tAuth('signIn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(220,38,38,0.1)_0,rgba(255,255,255,0)_100%)]" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-6">
              {t('hero.heading')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
              {t('hero.subheading')}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/login">{t('hero.getStarted')} <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t('hero.learnMore')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>{t('features.clientManagement.title')}</CardTitle>
                <CardDescription>
                  {t('features.clientManagement.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.taskTracking.title')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.invoicing.title')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.reporting.title')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>{t('features.multiLanguage.title')}</CardTitle>
                <CardDescription>
                  {t('features.multiLanguage.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Deutsch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Arabic</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Palette className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle>{t('features.teamWork.title')}</CardTitle>
                <CardDescription>
                  {t('features.teamWork.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.taskTracking.title')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.reporting.title')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{t('features.clientManagement.title')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(220,38,38,0.05)_0,rgba(255,255,255,0)_100%)]" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">10k+</div>
              <div className="text-sm text-gray-600">{t('features.clientManagement.title')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">150+</div>
              <div className="text-sm text-gray-600">{t('features.teamWork.title')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">{t('features.reporting.title')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-sm text-gray-600">{t('features.invoicing.title')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">{t('features.title')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('features.subtitle')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('features.clientManagement.title')}</h4>
                    <p className="text-gray-600">{t('features.clientManagement.description')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('features.invoicing.title')}</h4>
                    <p className="text-gray-600">{t('features.invoicing.description')}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('features.reporting.title')}</h4>
                    <p className="text-gray-600">{t('features.reporting.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}