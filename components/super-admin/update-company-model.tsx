"use client"
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCompanyDetails } from '@/hooks/useCompanyDetails'

interface UpdateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  companyId: number | null;
}

interface UpdateFormData {
  companyName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  vatNumber: string;
  subscriptionTypeId: number;
  subscriptionEndDate: string;
  managerEmail: string;
  managerUserName: string;
  firstName: string;
  lastName: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export function UpdateCompanyModal({ isOpen, onClose, onSuccess, companyId }: UpdateCompanyModalProps) {
  const t = useTranslations('superAdmin.companies.updateModal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  
  // Fetch company details
  const { data: companyDetails, isLoading, error } = useCompanyDetails(companyId);

  const [formData, setFormData] = useState<UpdateFormData>({
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    vatNumber: "",
    subscriptionTypeId: 1,
    subscriptionEndDate: "",
    managerEmail: "",
    managerUserName: "",
    firstName: "",
    lastName: "",
    notes: ""
  });

  // Populate form data when company details are loaded
  useEffect(() => {
    if (companyDetails) {
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        companyName: companyDetails.companyInfo.companyName || "",
        contactEmail: companyDetails.companyInfo.contactEmail || "",
        phoneNumber: companyDetails.companyInfo.phoneNumber || "",
        address: companyDetails.companyInfo.address || "",
        city: companyDetails.companyInfo.city || "",
        zipCode: companyDetails.companyInfo.zipCode || "",
        country: companyDetails.companyInfo.country || "",
        vatNumber: companyDetails.companyInfo.vatNumber || "",
        subscriptionTypeId: companyDetails.companyInfo.subscriptionTypeId || 1,
        subscriptionEndDate: formatDateTimeLocal(companyDetails.companyInfo.subscriptionEndDate),
        managerEmail: companyDetails.managerInfo.email || "",
        managerUserName: companyDetails.managerInfo.userName || "",
        firstName: companyDetails.managerInfo.firstName || "",
        lastName: companyDetails.managerInfo.lastName || "",
        notes: companyDetails.companyInfo.notes || ""
      });
    }
  }, [companyDetails]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof UpdateFormData, value: string | number) => {
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
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.managerEmail.trim()) newErrors.managerEmail = "Manager email is required";
    if (!formData.managerUserName.trim()) newErrors.managerUserName = "Username is required";
    if (!formData.subscriptionEndDate.trim()) newErrors.subscriptionEndDate = "Subscription end date is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    if (formData.managerEmail && !emailRegex.test(formData.managerEmail)) {
      newErrors.managerEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!companyId) {
      setSubmitError("Company ID is required for update");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = getCookie("auth-token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare update payload
      const updatePayload = {
        companyId: companyId,
        ...formData
      };

      const response = await fetch(`https://nedx.premiumasp.net/api/SuperAdmin/update-company/${companyId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      onClose();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error updating company:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while updating the company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-600">Loading company details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Company</h3>
            <p className="text-gray-600 mb-4">Unable to load company details for editing.</p>
            <Button onClick={handleClose} className="bg-red-500 hover:bg-red-600 text-white">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              disabled={isSubmitting}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{t('dashboard')}</span>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
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
                  <span className="text-sm text-gray-500">{t('companyManagement')}</span>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-gray-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">{t('generalSettings')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('companyNameLabel')} *
                  </Label>
                  <Input
                    id="company-name"
                    placeholder={t('companyNamePlaceholder')}
                    className={`w-full ${errors.companyName ? 'border-red-500' : ''}`}
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('contactEmailLabel')} *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder={t('contactEmailPlaceholder')}
                    className={`w-full ${errors.contactEmail ? 'border-red-500' : ''}`}
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                </div>

                <div>
                  <Label htmlFor="postal-code" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('postalCodeLabel')} *
                  </Label>
                  <Input
                    id="postal-code"
                    placeholder={t('postalCodePlaceholder')}
                    className={`w-full ${errors.zipCode ? 'border-red-500' : ''}`}
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                </div>

                <div>
                  <Label htmlFor="phone-number" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('phoneNumberLabel')} *
                  </Label>
                  <Input
                    id="phone-number"
                    placeholder={t('phoneNumberPlaceholder')}
                    className={`w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('countryLabel')} *
                  </Label>
                  <Input
                    id="country"
                    placeholder={t('countryPlaceholder')}
                    className={`w-full ${errors.country ? 'border-red-500' : ''}`}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('addressLabel')} *
                  </Label>
                  <Input
                    id="address"
                    placeholder={t('addressPlaceholder')}
                    className={`w-full ${errors.address ? 'border-red-500' : ''}`}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="ust-id" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('vatIdLabel')}
                  </Label>
                  <Input
                    id="ust-id"
                    placeholder={t('vatIdPlaceholder')}
                    className="w-full"
                    value={formData.vatNumber}
                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('cityLabel')} *
                  </Label>
                  <Input
                    id="city"
                    placeholder={t('cityPlaceholder')}
                    className={`w-full ${errors.city ? 'border-red-500' : ''}`}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="subscription-plan" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('subscriptionPlanLabel')}
                  </Label>
                  <select
                    id="subscription-plan"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.subscriptionTypeId}
                    onChange={(e) => handleInputChange('subscriptionTypeId', Number(e.target.value))}
                    disabled={isSubmitting}
                    aria-label="Subscription Plan"
                  >
                    <option value={1}>Monthly Subscription</option>
                    <option value={2}>Yearly Subscription</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subscription-end" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('subscriptionEndLabel')} *
                  </Label>
                  <Input
                    id="subscription-end"
                    type="datetime-local"
                    className={`w-full ${errors.subscriptionEndDate ? 'border-red-500' : ''}`}
                    value={formData.subscriptionEndDate}
                    onChange={(e) => handleInputChange('subscriptionEndDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.subscriptionEndDate && <p className="text-red-500 text-xs mt-1">{errors.subscriptionEndDate}</p>}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('notesLabel')}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t('notesPlaceholder')}
                    className="w-full min-h-[80px]"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Manager Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('managerInformation')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="manager-first-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('firstNameLabel')} *
                  </Label>
                  <Input
                    id="manager-first-name"
                    placeholder={t('firstNamePlaceholder')}
                    className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="manager-username" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('usernameLabel')} *
                  </Label>
                  <Input
                    id="manager-username"
                    placeholder={t('usernamePlaceholder')}
                    className={`w-full ${errors.managerUserName ? 'border-red-500' : ''}`}
                    value={formData.managerUserName}
                    onChange={(e) => handleInputChange('managerUserName', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.managerUserName && <p className="text-red-500 text-xs mt-1">{errors.managerUserName}</p>}
                </div>

                <div>
                  <Label htmlFor="manager-last-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('lastNameLabel')} *
                  </Label>
                  <Input
                    id="manager-last-name"
                    placeholder={t('lastNamePlaceholder')}
                    className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <Label htmlFor="manager-email" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('emailAddressLabel')} *
                  </Label>
                  <Input
                    id="manager-email"
                    type="email"
                    placeholder={t('emailAddressPlaceholder')}
                    className={`w-full ${errors.managerEmail ? 'border-red-500' : ''}`}
                    value={formData.managerEmail}
                    onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.managerEmail && <p className="text-red-500 text-xs mt-1">{errors.managerEmail}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6"
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white px-6"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                t('updateCompany')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
