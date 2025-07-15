"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { useOfferDetails } from '@/hooks/useCustomers'
import type { OfferDetails, OfferLocation, ServiceLineItem, PackingMaterial } from '@/lib/api'

interface ViewOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number | null;
}

export function ViewOfferModal({ isOpen, onClose, offerId }: ViewOfferModalProps) {
  const t = useTranslations('company.customers.viewModal.offerDetails');
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);
  
  // Fetch detailed offer data from API
  const { data: offerDetails, isLoading, error } = useOfferDetails(offerId);

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-red-500 mb-3">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('errorTitle')}</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : t('errorUnknown')}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onClose} variant="outline">
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!offerDetails) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  // Format time
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Format HH:MM
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle PDF download using API URL
  const handleDownloadPDF = async () => {
    if (!offerDetails?.pdfUrl) return;
    
    setIsDownloadingPDF(true);
    try {
      const fullPdfUrl = `https://crmproject.runasp.net${offerDetails.pdfUrl}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = fullPdfUrl;
      link.download = `Offer_${offerDetails.offerNumber}_${offerDetails.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // You could add a toast notification here
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('title', { offerNumber: offerDetails.offerNumber })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('subtitle', { customerName: offerDetails.customerName })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownloadPDF}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
              disabled={isDownloadingPDF || !offerDetails.pdfUrl}
            >
              {isDownloadingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {t('downloadPDF')}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-500 rounded"></div>
              <h3 className="text-lg font-medium text-gray-900">{t('basicInformation')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('offerNumber')}</p>
                <p className="text-gray-900">{offerDetails.offerNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('issueDate')}</p>
                <p className="text-gray-900">{formatDate(offerDetails.issueDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('status')}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offerDetails.status)}`}>
                  {offerDetails.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('totalAmount')}</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(offerDetails.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('discountAmount')}</p>
                <p className="text-gray-900">{formatCurrency(offerDetails.discountAmount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('customerName')}</p>
                <p className="text-gray-900">{offerDetails.customerName}</p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('locations')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offerDetails.locations.map((location: OfferLocation, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {location.locationType === 'Origin' ? t('origin') : t('destination')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">{t('address')}:</span> {location.street}</p>
                    <p><span className="font-medium">{t('cityZip')}:</span> {location.zipCode} {location.city}</p>
                    <p><span className="font-medium">{t('buildingType')}:</span> {location.buildingType}</p>
                    <p><span className="font-medium">{t('floor')}:</span> {location.floor}</p>
                    <p><span className="font-medium">{t('hasLift')}:</span> {location.hasLift ? t('yes') : t('no')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Line Items */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('serviceLineItems')}</h3>
            <div className="space-y-4">
              {offerDetails.serviceLineItems.map((service: ServiceLineItem, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                    <span className="font-semibold text-gray-900">{formatCurrency(service.totalLinePrice)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {service.serviceDetails.moveDate && (
                      <p><span className="font-medium">{t('moveDate')}:</span> {formatDate(service.serviceDetails.moveDate)}</p>
                    )}
                    {service.serviceDetails.moveStartTime && (
                      <p><span className="font-medium">{t('startTime')}:</span> {formatTime(service.serviceDetails.moveStartTime)}</p>
                    )}
                    {service.serviceDetails.selectedTariffDescription && (
                      <p><span className="font-medium">{t('tariff')}:</span> {service.serviceDetails.selectedTariffDescription}</p>
                    )}
                    {service.serviceDetails.numberOfStaff && (
                      <p><span className="font-medium">{t('numberOfStaff')}:</span> {service.serviceDetails.numberOfStaff}</p>
                    )}
                    {service.serviceDetails.durationHours && (
                      <p><span className="font-medium">{t('duration')}:</span> {service.serviceDetails.durationHours}h</p>
                    )}
                    {service.serviceDetails.hourlyRateCHF && (
                      <p><span className="font-medium">{t('hourlyRate')}:</span> {formatCurrency(service.serviceDetails.hourlyRateCHF)}/h</p>
                    )}
                    {service.serviceDetails.cleaningType && (
                      <p><span className="font-medium">{t('cleaningType')}:</span> {service.serviceDetails.cleaningType}</p>
                    )}
                    {service.serviceDetails.cleaningDate && (
                      <p><span className="font-medium">{t('cleaningDate')}:</span> {formatDate(service.serviceDetails.cleaningDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packing Materials */}
          {offerDetails.packingMaterials && offerDetails.packingMaterials.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('packingMaterials')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('description')}</th>
                      <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('type')}</th>
                      <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('quantity')}</th>
                      <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('unitPrice')}</th>
                      <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('totalPrice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerDetails.packingMaterials.map((material: PackingMaterial, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm text-gray-900">{material.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{material.rentOrBuy}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(material.unitPrice)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{formatCurrency(material.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {(offerDetails.notesInOffer || offerDetails.notesNotInOffer) && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('notes')}</h3>
              <div className="space-y-4">
                {offerDetails.notesInOffer && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('notesInOffer')}</h4>
                    <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded">{offerDetails.notesInOffer}</p>
                  </div>
                )}
                {offerDetails.notesNotInOffer && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('notesNotInOffer')}</h4>
                    <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded">{offerDetails.notesNotInOffer}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 