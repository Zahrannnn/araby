'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cookieUtils } from '@/lib/utils/cookies';
import { useTranslations } from 'next-intl';

// TypeScript interfaces for subscription data
interface SubscriptionType {
  subscriptionTypeId: number;
  name: string;
  price: number;
  billingCycle: string;
  companyCount: number;
  totalProfit: number;
}

interface UpdateSubscriptionRequest {
  priceOfMonthly: number;
  priceOfAnnually: number;
  priceOfStripe: number;
}

// Zod validation schema
const subscriptionUpdateSchema = z.object({
  priceOfMonthly: z.number().min(0, 'Monthly price must be positive'),
  priceOfAnnually: z.number().min(0, 'Annual price must be positive'),
  priceOfStripe: z.number().min(0, 'Stripe subscription price must be positive'),
});

type SubscriptionUpdateForm = z.infer<typeof subscriptionUpdateSchema>;

// API functions
const subscriptionApi = {
  async getSubscriptionTypes(): Promise<SubscriptionType[]> {
    const token = cookieUtils.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://crmproject.runasp.net/api/SuperAdmin/SubsType', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async updateSubscriptionTypes(data: UpdateSubscriptionRequest): Promise<void> {
    const token = cookieUtils.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://crmproject.runasp.net/api/SuperAdmin/updateSubsType', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};

const SettingsPage = ({ params }: { params: Promise<{ locale: string }> }) => {
  const t = useTranslations();
  const [locale, setLocale] = useState<string>('en');
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Initialize locale
  useEffect(() => {
    const initializeLocale = async () => {
      const { locale: paramLocale } = await params;
      setLocale(paramLocale);
    };
    initializeLocale();
  }, [params]);

  const isRTL = locale === 'ar';

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SubscriptionUpdateForm>({
    resolver: zodResolver(subscriptionUpdateSchema),
    defaultValues: {
      priceOfMonthly: 0,
      priceOfAnnually: 0,
      priceOfStripe: 0,
    },
  });

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const data = await subscriptionApi.getSubscriptionTypes();
        setSubscriptionData(data);

        // Set form values based on fetched data
        const monthlySubscription = data.find(sub => sub.billingCycle.toLowerCase() === 'monthly');
        const annualSubscription = data.find(sub => sub.billingCycle.toLowerCase() === 'annually');
        const stripeSubscription = data.find(sub => sub.billingCycle.toLowerCase() === 'stripesubs');

        if (monthlySubscription) {
          setValue('priceOfMonthly', monthlySubscription.price);
        }
        if (annualSubscription) {
          setValue('priceOfAnnually', annualSubscription.price);
        }
        if (stripeSubscription) {
          setValue('priceOfStripe', stripeSubscription.price);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription data');
        console.error('Error fetching subscription data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [setValue]);

  // Handle form submission
  const onSubmit = async (data: SubscriptionUpdateForm) => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      await subscriptionApi.updateSubscriptionTypes(data);
      
      setSuccessMessage(t('save') + ' ' + t('completed').toLowerCase());
      
      // Refresh data after successful update
      const updatedData = await subscriptionApi.getSubscriptionTypes();
      setSubscriptionData(updatedData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription data');
      console.error('Error updating subscription data:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Get subscription statistics
  const getSubscriptionStats = () => {
    const monthlySubscription = subscriptionData.find(sub => sub.billingCycle.toLowerCase() === 'monthly');
    const annualSubscription = subscriptionData.find(sub => sub.billingCycle.toLowerCase() === 'annually');
    const stripeSubscription = subscriptionData.find(sub => sub.billingCycle.toLowerCase() === 'stripesubs');
    
    return {
      monthlyCompanies: monthlySubscription?.companyCount || 0,
      annualCompanies: annualSubscription?.companyCount || 0,
      stripeCompanies: stripeSubscription?.companyCount || 0,
      monthlyRevenue: monthlySubscription?.totalProfit || 0,
      annualRevenue: annualSubscription?.totalProfit || 0,
      stripeRevenue: stripeSubscription?.totalProfit || 0,
    };
  };

  const stats = getSubscriptionStats();

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('superAdmin.dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-red-500"></div>
          <h1 className="text-2xl font-semibold text-gray-800">{t('superAdmin.settings.title')}</h1>
        </div>
        <p className={`text-gray-600 ${isRTL ? 'mr-4' : 'ml-4'}`}>{t('superAdmin.settings.subtitle')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Subscription Settings Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800">{t('superAdmin.settings.subscriptionSettings')}</h2>
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
                <h3 className="text-lg font-medium text-gray-800">{t('superAdmin.settings.monthlySubscription')}</h3>
              </div>
              <p className="text-gray-600 mb-4">{t('superAdmin.settings.paymentRenewedMonthly')}</p>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">{t('superAdmin.settings.monthlyPrice')}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="1"
                    {...register('priceOfMonthly', { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.priceOfMonthly ? 'border-red-300' : 'border-gray-300'
                    } ${isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-3 pr-12'}`}
                    aria-label={t('superAdmin.settings.monthlyPrice')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <span className={`absolute top-2 text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}>CHF</span>
                </div>
                {errors.priceOfMonthly && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceOfMonthly.message}</p>
                )}
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
                <h3 className="text-lg font-medium text-gray-800">{t('superAdmin.settings.yearlySubscription')}</h3>
              </div>
              <p className="text-gray-600 mb-4">{t('superAdmin.settings.yearlyPaymentWithReducedCost')}</p>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">{t('superAdmin.settings.monthlyEquivalentPrice')}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="1"
                    {...register('priceOfAnnually', { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.priceOfAnnually ? 'border-red-300' : 'border-gray-300'
                    } ${isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-3 pr-12'}`}
                    aria-label={t('superAdmin.settings.monthlyEquivalentPrice')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <span className={`absolute top-2 text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}>CHF</span>
                </div>
                {errors.priceOfAnnually && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceOfAnnually.message}</p>
                )}
              </div>
            </div>
            
            {/* Stripe Subscription */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h4V3a1 1 0 112 0v1h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 14V6H4v10h12z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800">Stripe Subscription</h3>
              </div>
              <p className="text-gray-600 mb-4">Payment processed through Stripe payment gateway</p>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Stripe Price</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="1"
                    {...register('priceOfStripe', { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.priceOfStripe ? 'border-red-300' : 'border-gray-300'
                    } ${isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-3 pr-12'}`}
                    aria-label="Stripe Subscription Price"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <span className={`absolute top-2 text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}>CHF</span>
                </div>
                {errors.priceOfStripe && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceOfStripe.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isDirty && !isSaving
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                t('save')
              )}
            </button>
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
            <h2 className="text-xl font-medium text-gray-800">{t('superAdmin.settings.statisticsSection')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Companies per Tariff */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-800 mb-6">{t('superAdmin.settings.companiesPerTariff')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1 bg-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-blue-800 font-medium">{t('superAdmin.settings.monthlyTariff')}</span>
                    <span className="text-blue-800 font-bold">{stats.monthlyCompanies}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1 bg-green-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-green-800 font-medium">{t('superAdmin.settings.yearlyTariff')}</span>
                    <span className="text-green-800 font-bold">{stats.annualCompanies}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h4V3a1 1 0 112 0v1h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 14V6H4v10h12z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1 bg-purple-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-purple-800 font-medium">Stripe Subscription</span>
                    <span className="text-purple-800 font-bold">{stats.stripeCompanies}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Revenue per Tariff */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-800 mb-6">{t('superAdmin.settings.totalRevenuePerTariff')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">$</span>
                  </div>
                  <div className="flex-1 bg-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-blue-800 font-medium">{t('superAdmin.settings.monthlyTariff')}</span>
                    <span className="text-blue-800 font-bold">CHF {stats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">$</span>
                  </div>
                  <div className="flex-1 bg-green-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-green-800 font-medium">{t('superAdmin.settings.yearlyTariff')}</span>
                    <span className="text-green-800 font-bold">CHF {stats.annualRevenue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">$</span>
                  </div>
                  <div className="flex-1 bg-purple-100 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-purple-800 font-medium">Stripe Subscription</span>
                    <span className="text-purple-800 font-bold">CHF {stats.stripeRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;