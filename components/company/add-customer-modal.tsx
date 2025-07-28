"use client"
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAddCustomer } from '@/hooks/useAddCustomer'

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
  [key: string]: string;
}

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const t = useTranslations('company.customers.modal');

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

  // Use custom hook for adding customer
  const createCustomerMutation = useAddCustomer({
    onSuccess: () => {
      // Reset form
      setFormData({
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
      setErrors({});
      
      // Call success callback and close modal
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      console.error('Error creating customer:', error);
    },
  });

  if (!isOpen) return null;

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

    createCustomerMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!createCustomerMutation.isPending) {
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
              disabled={createCustomerMutation.isPending}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('title') || 'Neuen Kunden hinzufügen'}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t('breadcrumb') || 'Kundendaten eingeben, um neuen Kunden hinzuzufügen'}</span>
          </div>
        </div>

        {/* Error Display */}
        {createCustomerMutation.error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {createCustomerMutation.error.message || 'Fehler beim Hinzufügen des Kunden'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
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
                  {t('customerInformation') || 'Kundeninformationen'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="first-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('firstName') || 'Vorname'}
                  </Label>
                  <Input
                    id="first-name"
                    placeholder={t('firstNamePlaceholder') || 'Vorname des Managers'}
                    className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone-number" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('phoneNumber') || 'Telefonnummer'}
                  </Label>
                  <Input
                    id="phone-number"
                    placeholder={"Phone: +41 44 1234567 (Zurich landline) or +41 79 123 45 67 (mobile)"}
                    className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="last-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('lastName') || 'Nachname'}
                  </Label>
                  <Input
                    id="last-name"
                    placeholder={t('lastNamePlaceholder') || 'Nachname des Managers'}
                    className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('address') || 'Adresse'}
                  </Label>
                  <Input
                    id="address"
                    placeholder={"Bahnhofstrasse 15"}
                    className={`w-full ${errors.address ? 'border-red-500' : ''}`}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('email') || 'E-Mail-Adresse'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder') || 'manager@company.com'}
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('city') || 'Stadt'}
                  </Label>
                  <Input
                    id="city"
                    placeholder={"Basel"}
                    className={`w-full ${errors.city ? 'border-red-500' : ''}`}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* ZIP Code */}
                <div>
                  <Label htmlFor="zip-code" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('zipCode') || 'Postleitzahl'}
                  </Label>
                  <Input
                    id="zip-code"
                    placeholder={t('zipCodePlaceholder') || '10115'}
                    className={`w-full ${errors.zipCode ? 'border-red-500' : ''}`}
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('country') || 'Land'}
                  </Label>
                  <Input
                    id="country"
                    placeholder={"Switzerland"}
                    className={`w-full ${errors.country ? 'border-red-500' : ''}`}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={createCustomerMutation.isPending}
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('notes') || 'Notizen'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={t('notesPlaceholder') || 'Notizen'}
                  className="w-full min-h-[80px]"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={createCustomerMutation.isPending}
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
              disabled={createCustomerMutation.isPending}
            >
              {t('cancel') || 'Abbrechen'}
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white px-6"
              onClick={handleSubmit}
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{'Speichern...'}</span>
                </div>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 