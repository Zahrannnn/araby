import { getDictionary } from './dictionaries';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  GlobeAltIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'ar' }
  ];
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as 'en' | 'de' | 'ar');

  const features = [
    {
      icon: UserGroupIcon,
      title: dict.home.features.clientManagement.title,
      description: dict.home.features.clientManagement.description,
    },
    {
      icon: DocumentTextIcon,
      title: dict.home.features.invoicing.title,
      description: dict.home.features.invoicing.description,
    },
    {
      icon: ClipboardDocumentListIcon,
      title: dict.home.features.taskTracking.title,
      description: dict.home.features.taskTracking.description,
    },
    {
      icon: ChartBarIcon,
      title: dict.home.features.reporting.title,
      description: dict.home.features.reporting.description,
    },
    {
      icon: GlobeAltIcon,
      title: dict.home.features.multiLanguage.title,
      description: dict.home.features.multiLanguage.description,
    },
    {
      icon: UsersIcon,
      title: dict.home.features.teamWork.title,
      description: dict.home.features.teamWork.description,
    },
  ];

  return (
    <DashboardLayout locale={locale} userRole="company" userName="Guest User" companyName="Araby CRM">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {dict.home.hero.heading}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                {dict.home.hero.subheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  {dict.home.hero.getStarted}
                </button>
                <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  {dict.home.hero.learnMore}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {dict.home.features.title}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {dict.home.features.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {dict.home.cta.title}
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {dict.home.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
                {dict.home.cta.startTrial}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-200">
                {dict.home.cta.contactSales}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="ml-3 text-xl font-bold text-white">Araby</span>
              </div>
              
              <div className="flex flex-wrap gap-6 text-gray-300">
                <a href="#" className="hover:text-white transition-colors">
                  {dict.home.footer.privacy}
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  {dict.home.footer.terms}
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  {dict.home.footer.support}
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Araby. {dict.home.footer.copyright}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
} 