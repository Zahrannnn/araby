"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateCustomer, useCustomer } from '@/hooks/useCustomers'
import type { Customer } from '@/lib/api'

interface UpdateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer: Customer | null;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export function UpdateCustomerModal({ isOpen, onClose, onSuccess, customer }: UpdateCustomerModalProps) {
  const t = useTranslations('company.customers.updateModal');

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    notes: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch full customer details when modal is opened
  const { data: fullCustomerData, isLoading: isLoadingCustomer } = useCustomer(
    isOpen && customer ? customer.customerId : null
  );

  // Use custom hook for updating customer
  const updateCustomerMutation = useUpdateCustomer();

  // Populate form when customer changes or when full data is loaded
  useEffect(() => {
    if (isOpen && (fullCustomerData || customer)) {
      // Use full customer data if available, otherwise fall back to the passed customer
      const customerData = fullCustomerData || customer;
      
      if (customerData) {
        console.log('Customer data for form population:', customerData);
        console.log('Address:', customerData.address);
        console.log('Country:', customerData.country);
        console.log('ZipCode:', customerData.zipCode);
        
        // Split fullName into firstName and lastName
        const nameParts = customerData.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          firstName,
          lastName,
          email: customerData.email || '',
          phoneNumber: customerData.phoneNumber || '',
          address: customerData.address || '',
          city: customerData.city || '',
          zipCode: customerData.zipCode || '',
          country: customerData.country || '',
          notes: customerData.notes || ''
        });
        setErrors({});
      }
    }
  }, [isOpen, customer, fullCustomerData]);

  if (!isOpen || !customer) return null;

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = t('validation.firstNameRequired') || "Vorname ist erforderlich";
    if (!formData.lastName.trim()) newErrors.lastName = t('validation.lastNameRequired') || "Nachname ist erforderlich";
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired') || "E-Mail-Adresse ist erforderlich";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = t('validation.phoneRequired') || "Telefonnummer ist erforderlich";
    if (!formData.address.trim()) newErrors.address = t('validation.addressRequired') || "Adresse ist erforderlich";
    if (!formData.city.trim()) newErrors.city = t('validation.cityRequired') || "Stadt ist erforderlich";
    if (!formData.zipCode.trim()) newErrors.zipCode = t('validation.zipCodeRequired') || "Postleitzahl ist erforderlich";
    if (!formData.country.trim()) newErrors.country = t('validation.countryRequired') || "Land ist erforderlich";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid') || "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    updateCustomerMutation.mutate({
      customerId: customer.customerId,
      ...formData
    }, {
      onSuccess: () => {
        // Call success callback and close modal
        onSuccess?.();
        onClose();
      },
      onError: (error: Error) => {
        console.error('Error updating customer:', error);
      },
    });
  };

  const handleClose = () => {
    if (!updateCustomerMutation.isPending) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              disabled={updateCustomerMutation.isPending || isLoadingCustomer}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title', { customerName: customer.fullName })}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Error Display */}
        {updateCustomerMutation.error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {updateCustomerMutation.error.message || 'Fehler beim Aktualisieren des Kunden'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingCustomer && (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-700">{t('loading') || 'Loading customer data...'}</span>
          </div>
        )}

        {/* Form Content */}
        {!isLoadingCustomer && (
          <div className="p-6">
            <div className="space-y-8">
              {/* Customer Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('customerInformation')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="first-name" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('firstName')}
                    </Label>
                    <Input
                      id="first-name"
                      placeholder={t('firstNamePlaceholder')}
                      className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="phone-number" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('phoneNumber')}
                    </Label>
                    <Input
                      id="phone-number"
                      placeholder={t('phoneNumberPlaceholder')}
                      className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="last-name" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('lastName')}
                    </Label>
                    <Input
                      id="last-name"
                      placeholder={t('lastNamePlaceholder')}
                      className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('address')}
                    </Label>
                    <Input
                      id="address"
                      placeholder={t('addressPlaceholder')}
                      className={`w-full ${errors.address ? 'border-red-500' : ''}`}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('city')}
                    </Label>
                    <Input
                      id="city"
                      placeholder={t('cityPlaceholder')}
                      className={`w-full ${errors.city ? 'border-red-500' : ''}`}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <Label htmlFor="zip-code" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('zipCode')}
                    </Label>
                    <Input
                      id="zip-code"
                      placeholder={t('zipCodePlaceholder')}
                      className={`w-full ${errors.zipCode ? 'border-red-500' : ''}`}
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('country')}
                    </Label>
                    <Input
                      id="country"
                      placeholder={t('countryPlaceholder')}
                      className={`w-full ${errors.country ? 'border-red-500' : ''}`}
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={updateCustomerMutation.isPending}
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('notes')}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t('notesPlaceholder')}
                    className="w-full min-h-[80px]"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={updateCustomerMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-6"
                disabled={updateCustomerMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white px-6"
                onClick={handleSubmit}
                disabled={updateCustomerMutation.isPending}
              >
                {updateCustomerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Aktualisieren...</span>
                  </div>
                ) : (
                  t('update')
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 