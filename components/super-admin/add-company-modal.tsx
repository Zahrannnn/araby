"use client"
import React, { useState,  } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  companyName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  vatNumber: string;
  subscriptionTypeId: number;
  isSubStripe: boolean;
  bank: string;
  nameOfBankAccount: string;
  iban: string;
  bic: string;
  transportInsurancePolicyNo: string;
  businessInsurancePolicyNo: string;
  subscriptionEndDate: string;
  managerEmail: string;
  managerUserName: string;
  password: string;
  firstName: string;
  lastName: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export function AddCompanyModal({ isOpen, onClose, onSuccess }: AddCompanyModalProps) {
  const t = useTranslations('superAdmin.companies.modal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);



  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    vatNumber: "",
    subscriptionTypeId: 1, 
    isSubStripe: false,
    bank: "",
    nameOfBankAccount: "",
    iban: "",
    bic: "",
    transportInsurancePolicyNo: "",
    businessInsurancePolicyNo: "",
    subscriptionEndDate: "",
    managerEmail: "",
    managerUserName: "",
    password: "",
    firstName: "",
    lastName: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
   
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };



 

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

  
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
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.subscriptionEndDate.trim()) newErrors.subscriptionEndDate = "Subscription end date is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }
    if (formData.managerEmail && !emailRegex.test(formData.managerEmail)) {
      newErrors.managerEmail = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
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

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = getCookie("auth-token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

     
      const response = await fetch("https://nedx.premiumasp.net/api/SuperAdmin/create-company", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

     
      if (logoFile) {
        try {
          const formData = new FormData();
          formData.append('logoFile', logoFile);
          
          await apiClient.post('/api/CompanySettings/saveupdate-company-logo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (logoError) {
          console.error("Error uploading logo:", logoError);
         
        }
      }
     
      setFormData({
        companyName: "",
        contactEmail: "",
        phoneNumber: "",
        address: "",
        city: "",
        zipCode: "",
        country: "",
        vatNumber: "",
        subscriptionTypeId: 1,
        isSubStripe: false,
        bank: "",
        nameOfBankAccount: "",
        iban: "",
        bic: "",
        transportInsurancePolicyNo: "",
        businessInsurancePolicyNo: "",
        subscriptionEndDate: "",
        managerEmail: "",
        managerUserName: "",
        password: "",
        firstName: "",
        lastName: "",
        notes: ""
      });
      setLogoFile(null);
      
      
      onClose();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error adding company:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while adding the company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0  backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 
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

     
        <div className="p-6">
          <div className="space-y-8">
           
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-sub-stripe"
                    checked={formData.isSubStripe}
                    onChange={(e) => handleInputChange('isSubStripe', e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    aria-label={t('isSubStripeLabel') || "Stripe Subscription"}
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
                    value={formData.subscriptionEndDate}
                    onChange={(e) => handleInputChange('subscriptionEndDate', e.target.value)}
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
                        value={formData.bank}
                        onChange={(e) => handleInputChange('bank', e.target.value)}
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
                        value={formData.nameOfBankAccount}
                        onChange={(e) => handleInputChange('nameOfBankAccount', e.target.value)}
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
                        value={formData.iban}
                        onChange={(e) => handleInputChange('iban', e.target.value)}
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
                        value={formData.bic}
                        onChange={(e) => handleInputChange('bic', e.target.value)}
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
                        value={formData.transportInsurancePolicyNo}
                        onChange={(e) => handleInputChange('transportInsurancePolicyNo', e.target.value)}
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
                        value={formData.businessInsurancePolicyNo}
                        onChange={(e) => handleInputChange('businessInsurancePolicyNo', e.target.value)}
                        disabled={isSubmitting}
                      />
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
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

        
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
                  <Label htmlFor="manager-password" className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('passwordLabel')} *
                  </Label>
                  <Input
                    id="manager-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                  <span>Saving...</span>
                </div>
              ) : (
                t('saveCompany')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 