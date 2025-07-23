"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { useCompanyDetails } from '@/hooks/useCompanyDetails'
import { useTranslations } from 'next-intl'

interface Company {
  companyId: number;
  companyName: string;
  status: string;
  createdAt: string;
  managerEmail: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
}

interface ViewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  company: Company | null;
}

export function ViewCompanyModal({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  company 
}: ViewCompanyModalProps) {
  const t = useTranslations('superAdmin.companies.viewModal');
  
  // Fetch detailed company data from API
  const { data: companyDetails, isLoading, error } = useCompanyDetails(company?.companyId || null);

  // Use API data if available, otherwise fall back to basic company data
  const displayData = React.useMemo(() => {
    if (companyDetails) {
      console.log('isSubStripe value:', companyDetails.companyInfo.isSubStripe);
      console.log('isSubStripe type:', typeof companyDetails.companyInfo.isSubStripe);
      
      // Ensure isSubStripe is strictly a boolean true
      const isStripeActive = companyDetails.companyInfo.isSubStripe === true;
      console.log('isStripeActive (after check):', isStripeActive);
      
      return {
        name: companyDetails.companyInfo.companyName,
        email: companyDetails.companyInfo.contactEmail,
        phone: companyDetails.companyInfo.phoneNumber,
        address: companyDetails.companyInfo.address,
        city: companyDetails.companyInfo.city,
        zipCode: companyDetails.companyInfo.zipCode,
        country: companyDetails.companyInfo.country,
        vatId: companyDetails.companyInfo.vatNumber,
        subscriptionType: companyDetails.companyInfo.subsType,
        subscriptionEnd: new Date(companyDetails.companyInfo.subscriptionEndDate).toLocaleDateString("de-DE"),
        createdAt: new Date(companyDetails.companyInfo.createdAt).toLocaleDateString("de-DE"),
        notes: companyDetails.companyInfo.notes || t('notAvailable'),
        bank: companyDetails.companyInfo.bank || t('notAvailable'),
        nameOfBankAccount: companyDetails.companyInfo.nameOfBankAccount || t('notAvailable'),
        iban: companyDetails.companyInfo.iban || t('notAvailable'),
        bic: companyDetails.companyInfo.bic || t('notAvailable'),
        transportInsurancePolicyNo: companyDetails.companyInfo.transportInsurancePolicyNo || t('notAvailable'),
        businessInsurancePolicyNo: companyDetails.companyInfo.businessInsurancePolicyNo || t('notAvailable'),
        isSubStripe: isStripeActive,
        stripeSubCreatedAt: companyDetails.companyInfo.stripeSubCreatedAt ? new Date(companyDetails.companyInfo.stripeSubCreatedAt).toLocaleDateString("de-DE") : t('notAvailable'),
        manager: {
          fullName: `${companyDetails.managerInfo.firstName} ${companyDetails.managerInfo.lastName}`,
          email: companyDetails.managerInfo.email,
          username: companyDetails.managerInfo.userName
        },
        accountCreated: new Date(companyDetails.managerInfo.createdAt).toLocaleDateString("de-DE"),
        status: companyDetails.companyInfo.isActive ? t('active') : t('inactive'),
        metrics: {
          subscriptionDate: new Date(companyDetails.metrics.subscriptionDate).toLocaleDateString("de-DE"),
          customerCount: companyDetails.metrics.customerCount.toString(),
          employeeCount: companyDetails.metrics.employeeCount.toString(),
          revenue: `€${companyDetails.metrics.totalProfit.toFixed(2)}`,
          paidInvoiceCount: companyDetails.metrics.paidInvoiceCount.toString()
        }
      };
    }

    // Fallback to basic company data
    return {
      name: company?.companyName || t('notAvailable'),
      email: company?.managerEmail || t('notAvailable'), 
      phone: company?.phoneNumber || t('notAvailable'),
      address: company?.address || t('notAvailable'),
      city: t('notAvailable'),
      zipCode: t('notAvailable'),
      country: t('notAvailable'),
      vatId: t('notAvailable'),
      subscriptionType: t('notAvailable'),
      subscriptionEnd: t('notAvailable'),
      createdAt: company?.createdAt ? new Date(company.createdAt).toLocaleDateString("de-DE") : t('notAvailable'),
      notes: company?.notes || t('notAvailable'),
      bank: t('notAvailable'),
      nameOfBankAccount: t('notAvailable'),
      iban: t('notAvailable'),
      bic: t('notAvailable'),
      transportInsurancePolicyNo: t('notAvailable'),
      businessInsurancePolicyNo: t('notAvailable'),
      isSubStripe: false,
      stripeSubCreatedAt: t('notAvailable'),
      manager: {
        fullName: t('notAvailable'),
        email: company?.managerEmail || t('notAvailable'),
        username: company?.managerEmail?.split('@')[0] || t('notAvailable')
      },
      accountCreated: company?.createdAt ? new Date(company.createdAt).toLocaleDateString("de-DE") : t('notAvailable'),
      status: company?.status === "مفعلة" ? t('active') : t('inactive'),
      metrics: {
        subscriptionDate: company?.createdAt ? new Date(company.createdAt).toLocaleDateString("de-DE") : t('notAvailable'),
        customerCount: t('notAvailable'),
        employeeCount: t('notAvailable'),
        revenue: t('notAvailable'),
        paidInvoiceCount: t('notAvailable')
      }
    };
  }, [companyDetails, company, t]);

  if (error) {
    console.error('Error fetching company details:', error);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title')}: {isLoading ? t('loadingDetails') : displayData.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
              disabled={isLoading}
              className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 disabled:opacity-50"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{t('edit')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDelete}
              disabled={isLoading}
              className="bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 disabled:opacity-50"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{t('delete')}</span>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-2 text-gray-600">{t('loadingDetails')}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{t('errorLoading')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="p-6">
            <div className="space-y-8">
              {/* Company Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{t('companyInformation')}</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('companyDetails')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('companyName')}</p>
                        <p className="text-gray-900">{displayData.name}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('contactEmail')}</p>
                        <p className="text-gray-900">{displayData.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</p>
                        <p className="text-gray-900">{displayData.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('address')}</p>
                        <p className="text-gray-900">{displayData.address}</p>
                        {displayData.city !== t('notAvailable') && (
                          <p className="text-sm text-gray-600">{displayData.city}, {displayData.zipCode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('country')}</p>
                        <p className="text-gray-900">{displayData.country}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('vatNumber')}</p>
                        <p className="text-gray-900">{displayData.vatId}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('subscriptionType')}</p>
                        <p className="text-gray-900">{displayData.subscriptionType}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('subscriptionEndDate')}</p>
                        <p className="text-gray-900">{displayData.subscriptionEnd}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('bank')}</p>
                        <p className="text-gray-900">{displayData.bank}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('nameOfBankAccount')}</p>
                        <p className="text-gray-900">{displayData.nameOfBankAccount}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('iban')}</p>
                        <p className="text-gray-900">{displayData.iban}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('bic')}</p>
                        <p className="text-gray-900">{displayData.bic}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('transportInsurancePolicyNo')}</p>
                        <p className="text-gray-900">{displayData.transportInsurancePolicyNo}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('businessInsurancePolicyNo')}</p>
                        <p className="text-gray-900">{displayData.businessInsurancePolicyNo}</p>
                      </div>
                    </div>
                  </div>

                  {displayData.isSubStripe === true && (
                    <div>
                      <div className="flex items-start gap-3">
                        <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{t('stripeSubscription')}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              {t('active')}
                            </span>
                            <span className="text-sm text-gray-500">{t('since')} {displayData.stripeSubCreatedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {displayData.isSubStripe === false && (
                    <div>
                      <div className="flex items-start gap-3">
                        <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{t('stripeSubscription')}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                              {t('inactive')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('notes')}</p>
                        <p className="text-gray-900">{displayData.notes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Debug info - Remove in production */}
                  <div className="md:col-span-2 mt-2 p-2 bg-gray-100 rounded text-xs text-gray-500">
                    Debug: isSubStripe = {String(displayData.isSubStripe)}, type = {typeof displayData.isSubStripe}
                  </div>
                </div>
              </div>

              {/* Manager Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{t('managerInformation')}</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('managerDetails')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('fullName')}</p>
                        <p className="text-gray-900">{displayData.manager.fullName}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('email')}</p>
                        <p className="text-gray-900">{displayData.manager.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('username')}</p>
                        <p className="text-gray-900">{displayData.manager.username}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <svg className="h-4 w-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('accountCreatedDate')}</p>
                        <p className="text-gray-900">{displayData.accountCreated}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <div className={`h-4 w-4 rounded-full mt-1 ${companyDetails?.companyInfo.isActive ? "bg-green-500" : "bg-gray-500"}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('accountStatus')}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          companyDetails?.companyInfo.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            companyDetails?.companyInfo.isActive ? "bg-green-500" : "bg-gray-500"
                          }`}></div>
                          {displayData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{t('keyMetrics')}</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('statistics')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                        </svg>
                      </div>
                      <div className="min-w-200 flex-1 flex-wrap flex-col">
                        <p className="text-sm text-gray-500 mb-1">{t('subscriptionDate')}</p>
                        <p className="text-lg font-bold text-gray-900">{displayData.metrics.subscriptionDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 mb-1">{t('customerCount')}</p>
                        <p className="text-lg font-bold text-gray-900">{displayData.metrics.customerCount}</p>
                        <p className="text-xs text-gray-400">{t('customerFollowers')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className=" flex-1">
                        <p className="text-sm text-gray-500 mb-1">{t('employeeCount')}</p>
                        <p className="text-lg font-bold text-gray-900">{displayData.metrics.employeeCount}</p>
                        <p className="text-xs text-gray-400">{t('companyEmployees')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 mb-1">{t('generatedProfit')}</p>
                        <p className="text-lg font-bold text-gray-900">{displayData.metrics.revenue}</p>
                        <p className="text-xs text-gray-400">{t('fromSubscriptions')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 mb-1">{t('paidInvoices')}</p>
                        <p className="text-lg font-bold text-gray-900">{displayData.metrics.paidInvoiceCount}</p>
                        <p className="text-xs text-gray-400">{t('successfullyCompleted')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stripe Keys Section - Always displayed but content changes based on isSubStripe */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Stripe API Keys</h3>
                  <div className="ml-auto flex items-center gap-2">
                    {displayData.isSubStripe ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {t('active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        {t('required')}
                      </span>
                    )}
                  </div>
                </div>
                
                {displayData.isSubStripe ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                    <div className="mb-4 flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-800">Stripe integration is configured</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600 mb-1">Subscription Started</p>
                        <p className="text-gray-900 font-medium">{displayData.stripeSubCreatedAt}</p>
                      </div>
                      
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-700">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payment Processing Information
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 ml-1">
                        <li>This company has Stripe integration enabled</li>
                        <li>Payment processing is active and working</li>
                        <li>API keys are securely stored and configured</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
                      <svg className="h-5 w-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium mb-1">No Stripe keys are set for this company</p>
                        <p className="text-sm">To accept payments, the company needs to add Stripe API keys.</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-gray-700">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Setup Instructions:
                      </h4>
                      <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 ml-1">
                        <li>Company manager needs to log in to their <a href="https://dashboard.stripe.com/apikeys" className="text-blue-600 hover:underline">Stripe Dashboard</a></li>
                        <li>Navigate to <span className="font-medium">Developers &gt; API keys</span></li>
                        <li>Copy the <span className="font-medium">Publishable key</span> and <span className="font-medium">Secret key</span></li>
                        <li>Add them in the company settings section</li>
                      </ol>
                      <div className="mt-3 text-xs flex items-center gap-1.5 text-amber-600">
                        <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Never share your secret key publicly.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {displayData.isSubStripe && (
                  <div className="text-sm text-gray-500 flex items-center gap-2 bg-amber-50 p-3 rounded-md border border-amber-200">
                    <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium text-amber-800">Security Notice</p>
                      <p className="text-amber-700">For security reasons, API keys are not displayed in the admin view. The company manager can access these in their dashboard.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 