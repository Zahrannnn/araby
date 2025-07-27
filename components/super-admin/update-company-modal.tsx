"use client"
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCompanyDetails } from '@/hooks/useCompanyDetails'
import { queryKeys } from '@/lib/api'

interface UpdateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  companyId: number | null;
}

interface CompanyFormData {
  companyName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  vatNumber: string;
  notes: string;
  subscriptionTypeId: number;
  subscriptionEndDate: string;
  isActive: boolean;
  isSubStripe: boolean;
  bank: string;
  nameOfBankAccount: string;
  iban: string;
  bic: string;
  transportInsurancePolicyNo: string;
  businessInsurancePolicyNo: string;
}

interface ManagerFormData {
  email: string;
  firstName: string;
  lastName: string;
  newPassword: string;
  isActive: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function UpdateCompanyModal({ isOpen, onClose, onSuccess, companyId }: UpdateCompanyModalProps) {
  const t = useTranslations('superAdmin.companies.updateModal');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  
  // Fetch company details
  const { data: companyDetails, isLoading, error } = useCompanyDetails(companyId);

  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>({
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    vatNumber: "",
    notes: "",
    subscriptionTypeId: 1,
    subscriptionEndDate: "",
    isActive: true,
    isSubStripe: false,
    bank: "",
    nameOfBankAccount: "",
    iban: "",
    bic: "",
    transportInsurancePolicyNo: "",
    businessInsurancePolicyNo: ""
  });

  const [managerFormData, setManagerFormData] = useState<ManagerFormData>({
    email: "",
    firstName: "",
    lastName: "",
    newPassword: "",
    isActive: true
  });

  const [managerId, setManagerId] = useState<number | null>(null);

  // Populate form data when company details are loaded
  useEffect(() => {
    if (companyDetails) {
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setCompanyFormData({
        companyName: companyDetails.companyInfo.companyName || "",
        contactEmail: companyDetails.companyInfo.contactEmail || "",
        phoneNumber: companyDetails.companyInfo.phoneNumber || "",
        address: companyDetails.companyInfo.address || "",
        city: companyDetails.companyInfo.city || "",
        zipCode: companyDetails.companyInfo.zipCode || "",
        country: companyDetails.companyInfo.country || "",
        vatNumber: companyDetails.companyInfo.vatNumber || "",
        notes: companyDetails.companyInfo.notes || "",
        subscriptionTypeId: companyDetails.companyInfo.subscriptionTypeId || 1,
        subscriptionEndDate: formatDateTimeLocal(companyDetails.companyInfo.subscriptionEndDate),
        isActive: companyDetails.companyInfo.isActive,
        isSubStripe: companyDetails.companyInfo.isSubStripe || false,
        bank: companyDetails.companyInfo.bank || "",
        nameOfBankAccount: companyDetails.companyInfo.nameOfBankAccount || "",
        iban: companyDetails.companyInfo.iban || "",
        bic: companyDetails.companyInfo.bic || "",
        transportInsurancePolicyNo: companyDetails.companyInfo.transportInsurancePolicyNo || "",
        businessInsurancePolicyNo: companyDetails.companyInfo.businessInsurancePolicyNo || ""
      });

      setManagerFormData({
        email: companyDetails.managerInfo.email || "",
        firstName: companyDetails.managerInfo.firstName || "",
        lastName: companyDetails.managerInfo.lastName || "",
        newPassword: "", // Always empty for security
        isActive: companyDetails.managerInfo.isActive
      });

      setManagerId(companyDetails.managerInfo.id);
    }
  }, [companyDetails]);

  if (!isOpen) return null;

  const handleCompanyInputChange = (field: keyof CompanyFormData, value: string | number | boolean) => {
    setCompanyFormData(prev => ({
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

  const handleManagerInputChange = (field: keyof ManagerFormData, value: string | boolean) => {
    setManagerFormData(prev => ({
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

    // Company validation
    if (!companyFormData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!companyFormData.contactEmail.trim()) newErrors.contactEmail = "Contact email is required";
    if (!companyFormData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!companyFormData.address.trim()) newErrors.address = "Address is required";
    if (!companyFormData.city.trim()) newErrors.city = "City is required";
    if (!companyFormData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!companyFormData.country.trim()) newErrors.country = "Country is required";
    if (!companyFormData.subscriptionEndDate.trim()) newErrors.subscriptionEndDate = "Subscription end date is required";

    // Manager validation
    if (!managerFormData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!managerFormData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!managerFormData.email.trim()) newErrors.email = "Manager email is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (companyFormData.contactEmail && !emailRegex.test(companyFormData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    if (managerFormData.email && !emailRegex.test(managerFormData.email)) {
      newErrors.email = "Please enter a valid email address";
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

    if (!companyId || !managerId) {
      setSubmitError("Company ID and Manager ID are required for update");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = getCookie("auth-token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // First, update company information
      const companyResponse = await fetch(`https://nedx.premiumasp.net/api/SuperAdmin/update-company/${companyId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyFormData)
      });

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update company: ${companyResponse.status}`);
      }

      // Second, update manager information
      const managerResponse = await fetch(`https://nedx.premiumasp.net/api/SuperAdmin/update-manager/${managerId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(managerFormData)
      });

      if (!managerResponse.ok) {
        const errorData = await managerResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update manager: ${managerResponse.status}`);
      }

      onClose();
      if (onSuccess) onSuccess();
      
      // Invalidate the company details query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: queryKeys.companyDetails(companyId) });
      
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
                    value={companyFormData.companyName}
                    onChange={(e) => handleCompanyInputChange('companyName', e.target.value)}
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
                    value={companyFormData.contactEmail}
                    onChange={(e) => handleCompanyInputChange('contactEmail', e.target.value)}
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
                    value={companyFormData.zipCode}
                    onChange={(e) => handleCompanyInputChange('zipCode', e.target.value)}
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
                    value={companyFormData.phoneNumber}
                    onChange={(e) => handleCompanyInputChange('phoneNumber', e.target.value)}
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
                    value={companyFormData.country}
                    onChange={(e) => handleCompanyInputChange('country', e.target.value)}
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
                    value={companyFormData.address}
                    onChange={(e) => handleCompanyInputChange('address', e.target.value)}
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
                    value={companyFormData.vatNumber}
                    onChange={(e) => handleCompanyInputChange('vatNumber', e.target.value)}
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
                    value={companyFormData.city}
                    onChange={(e) => handleCompanyInputChange('city', e.target.value)}
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
                    value={companyFormData.subscriptionTypeId}
                    onChange={(e) => handleCompanyInputChange('subscriptionTypeId', Number(e.target.value))}
                    disabled={isSubmitting}
                    aria-label="Subscription Plan"
                  >
                    <option value={1}>Monthly Subscription</option>
                    <option value={2}>Yearly Subscription</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="is-sub-stripe"
                    checked={companyFormData.isSubStripe}
                    onChange={(e) => handleCompanyInputChange('isSubStripe', e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    aria-label="Stripe Subscription"
                  />
                  <Label htmlFor="is-sub-stripe" className="text-sm font-medium text-gray-700">
                    {t('isSubStripeLabel') || "Stripe Subscription"}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="subscription-end" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('subscriptionEndLabel')} *
                  </Label>
                  <Input
                    id="subscription-end"
                    type="datetime-local"
                    className={`w-full ${errors.subscriptionEndDate ? 'border-red-500' : ''}`}
                    value={companyFormData.subscriptionEndDate}
                    onChange={(e) => handleCompanyInputChange('subscriptionEndDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.subscriptionEndDate && <p className="text-red-500 text-xs mt-1">{errors.subscriptionEndDate}</p>}
                </div>

                {/* Banking Information */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('bankingInfoLabel') || "Banking Information"}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('bankLabel') || "Bank"}
                      </Label>
                      <Input
                        id="bank"
                        placeholder={t('bankPlaceholder') || "Bank name"}
                        className="w-full"
                        value={companyFormData.bank}
                        onChange={(e) => handleCompanyInputChange('bank', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-name" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('accountNameLabel') || "Account Name"}
                      </Label>
                      <Input
                        id="account-name"
                        placeholder={t('accountNamePlaceholder') || "Name on bank account"}
                        className="w-full"
                        value={companyFormData.nameOfBankAccount}
                        onChange={(e) => handleCompanyInputChange('nameOfBankAccount', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('ibanLabel') || "IBAN"}
                      </Label>
                      <Input
                        id="iban"
                        placeholder={t('ibanPlaceholder') || "IBAN number"}
                        className="w-full"
                        value={companyFormData.iban}
                        onChange={(e) => handleCompanyInputChange('iban', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bic" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('bicLabel') || "BIC"}
                      </Label>
                      <Input
                        id="bic"
                        placeholder={t('bicPlaceholder') || "BIC/SWIFT code"}
                        className="w-full"
                        value={companyFormData.bic}
                        onChange={(e) => handleCompanyInputChange('bic', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('insuranceInfoLabel') || "Insurance Information"}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transport-insurance" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('transportInsuranceLabel') || "Transport Insurance Policy No."}
                      </Label>
                      <Input
                        id="transport-insurance"
                        placeholder={t('transportInsurancePlaceholder') || "Transport insurance policy number"}
                        className="w-full"
                        value={companyFormData.transportInsurancePolicyNo}
                        onChange={(e) => handleCompanyInputChange('transportInsurancePolicyNo', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                <div>
                      <Label htmlFor="business-insurance" className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('businessInsuranceLabel') || "Business Insurance Policy No."}
                      </Label>
                      <Input
                        id="business-insurance"
                        placeholder={t('businessInsurancePlaceholder') || "Business insurance policy number"}
                        className="w-full"
                        value={companyFormData.businessInsurancePolicyNo}
                        onChange={(e) => handleCompanyInputChange('businessInsurancePolicyNo', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Status */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Company Status *
                  </Label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="status-active"
                        name="companyStatus"
                        value="true"
                        checked={companyFormData.isActive === true}
                        onChange={() => handleCompanyInputChange('isActive', true)}
                        disabled={isSubmitting}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 caret-green-400"
                        aria-label="Set company status to active"
                      />
                      <Label htmlFor="status-active" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Active
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="status-inactive"
                        name="companyStatus"
                        value="false"
                        checked={companyFormData.isActive === false}
                        onChange={() => handleCompanyInputChange('isActive', false)}
                        disabled={isSubmitting}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        aria-label="Set company status to inactive"
                      />
                      <Label htmlFor="status-inactive" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Inactive
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('notesLabel')}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={t('notesPlaceholder')}
                    className="w-full min-h-[80px]"
                    value={companyFormData.notes}
                    onChange={(e) => handleCompanyInputChange('notes', e.target.value)}
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
                    value={managerFormData.firstName}
                    onChange={(e) => handleManagerInputChange('firstName', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="manager-last-name" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('lastNameLabel')} *
                  </Label>
                  <Input
                    id="manager-last-name"
                    placeholder={t('lastNamePlaceholder')}
                    className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
                    value={managerFormData.lastName}
                    onChange={(e) => handleManagerInputChange('lastName', e.target.value)}
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
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                    value={managerFormData.email}
                    onChange={(e) => handleManagerInputChange('email', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="manager-password" className="text-sm font-medium text-gray-700 mb-2 block">
                    New Password (optional)
                  </Label>
                  <Input
                    id="manager-password"
                    type="password"
                    placeholder="Enter new password (leave blank to keep current)"
                    className="w-full"
                    value={managerFormData.newPassword}
                    onChange={(e) => handleManagerInputChange('newPassword', e.target.value)}
                    disabled={isSubmitting}
                  />
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
