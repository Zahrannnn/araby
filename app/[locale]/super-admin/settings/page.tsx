import React from 'react'
import { getDictionary } from '../../dictionaries'

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const dict = await getDictionary(locale as 'en' | 'de' | 'ar')
  const isRTL = locale === 'ar'

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-red-500"></div>
          <h1 className="text-2xl font-semibold text-gray-800">{dict.superAdmin.settings.title}</h1>
        </div>
        <p className={`text-gray-600 ${isRTL ? 'mr-4' : 'ml-4'}`}>{dict.superAdmin.settings.subtitle}</p>
      </div>

      {/* Subscription Settings Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800">{dict.superAdmin.settings.subscriptionSettings}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Subscription */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">{dict.superAdmin.settings.monthlySubscription}</h3>
            </div>
            <p className="text-gray-600 mb-4">{dict.superAdmin.settings.paymentRenewedMonthly}</p>
            
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">{dict.superAdmin.settings.monthlyPrice}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value="50" 
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-3 pr-12'}`}
                  readOnly
                  aria-label={dict.superAdmin.settings.monthlyPrice}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <span className={`absolute top-2 text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}>CHF</span>
              </div>
            </div>
          </div>

          {/* Yearly Subscription */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">{dict.superAdmin.settings.yearlySubscription}</h3>
            </div>
            <p className="text-gray-600 mb-4">{dict.superAdmin.settings.yearlyPaymentWithReducedCost}</p>
            
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">{dict.superAdmin.settings.monthlyEquivalentPrice}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value="70" 
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-3 pr-12'}`}
                  readOnly
                  aria-label={dict.superAdmin.settings.monthlyEquivalentPrice}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <span className={`absolute top-2 text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}>CHF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800">{dict.superAdmin.settings.statisticsSection}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Companies per Tariff */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-6">{dict.superAdmin.settings.companiesPerTariff}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1 bg-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-blue-800 font-medium">{dict.superAdmin.settings.monthlyTariff}</span>
                  <span className="text-blue-800 font-bold">150</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1 bg-green-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-green-800 font-medium">{dict.superAdmin.settings.yearlyTariff}</span>
                  <span className="text-green-800 font-bold">100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue per Tariff */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-6">{dict.superAdmin.settings.totalRevenuePerTariff}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">$</span>
                </div>
                <div className="flex-1 bg-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-blue-800 font-medium">{dict.superAdmin.settings.monthlyTariff}</span>
                  <span className="text-blue-800 font-bold">CHF 126&apos;000</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">$</span>
                </div>
                <div className="flex-1 bg-green-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-green-800 font-medium">{dict.superAdmin.settings.yearlyTariff}</span>
                  <span className="text-green-800 font-bold">CHF 72&apos;000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page