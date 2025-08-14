"use client"
import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { companyApi, googleCalendarApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Building2, User2, BarChart2, Eye, EyeOff, Copy, Info, CheckCircle, AlertCircle,
  CreditCard, Calendar, Mail, Phone, MapPin, Hash, FileText, Clock, Shield, Key, Save, Calendar as CalendarIcon,
  Upload, 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const ViewCompanyPage: React.FC = () => {
  const t = useTranslations('company.settings')
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['company-settings'],
    queryFn: companyApi.getCurrentCompanySettings,
    staleTime: 5 * 60 * 1000,
  })

  const queryClient = useQueryClient()
  const {
    data: stripeKeys,
    isLoading: isStripeLoading,
    error: stripeError,
  } = useQuery({
    queryKey: ['company-stripe-keys'],
    queryFn: companyApi.getStripeKeys,
    staleTime: 5 * 60 * 1000,
    enabled: !!data?.companyInfo?.isSubStripe, 
  })

  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const pubKeyRef = useRef<HTMLInputElement>(null!)
  const secKeyRef = useRef<HTMLInputElement>(null!)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { mutate: saveStripeKeys, isPending: isSaving } = useMutation<void, Error, { publishableKey: string; secretKey: string }>({
    mutationFn: companyApi.setStripeKeys,
    onSuccess: () => {
      setFormSuccess(t('stripeKeys.keysSaved'))
      setFormError(null)
      queryClient.invalidateQueries({ queryKey: ['company-stripe-keys'] })
    },
    onError: (err: Error) => {
      setFormError(err.message || t('stripeKeys.keysSaveError'))
      setFormSuccess(null)
    },
  })

  const { mutate: connectGoogleCalendar, isPending: isConnecting } = useMutation({
    mutationFn: googleCalendarApi.getConnectUrl,
    onSuccess: (data) => {
      window.location.href = data.redirectUrl
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Failed to connect to Google Calendar')
      setFormSuccess(null)
    },
  })

  const { mutate: uploadLogo, isPending: isLogoUploading } = useMutation({
    mutationFn: async (file: File) => {
      return companyApi.uploadCompanyLogo(file);
    },
    onSuccess: () => {
      setUploadSuccess(t('uploadSuccess'))
      setUploadError(null)
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
      setLogoFile(null)
    },
    onError: (err: Error) => {
      setUploadError(err.message || t('uploadError'))
      setUploadSuccess(null)
    },
  })

  function handleStripeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    if (!publishableKey.trim() || !secretKey.trim()) {
      setFormError(t('stripeKeys.bothKeysRequired'))
      return
    }
    saveStripeKeys({ publishableKey, secretKey })
  }

  function handleCopy(ref: React.RefObject<HTMLInputElement>) {
    if (ref.current) {
      ref.current.select()
      document.execCommand('copy')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0])
      setUploadError(null)
      setUploadSuccess(null)
    }
  }

  function handleLogoUpload() {
    if (logoFile) {
      uploadLogo(logoFile)
    } else {
      setUploadError(t('pleaseSelectFile'))
    }
  }

  function triggerFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  console.log(data?.companyInfo.companyLogoUrl);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-muted/50 via-background to-white py-10 px-4 md:px-6 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="pb-3 border-b border-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg flex items-center justify-center w-12 h-12">
                  {data?.companyInfo?.companyLogoUrl ? (
                    <Image
                      src={`https://nedx.premiumasp.net/${data.companyInfo.companyLogoUrl}`}
                      alt="Company Logo"
                      className="w-full h-full object-cover rounded"
                      width={100}
                      height={100}
                      loading="lazy"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{t('title')}</CardTitle>
                  <CardDescription>{t('subtitle')}</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => connectGoogleCalendar()}
                disabled={isConnecting}
                className="bg-white hover:bg-white/90 text-black border border-gray-200 shadow-sm flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"></span>
                    <span>{t('connecting')}</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    <span>{t('connectGoogleCalendar')}</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground text-lg">{t('loading')}</div>
            ) : error ? (
              <div className="py-16 text-center text-destructive text-lg">{(error as Error).message}</div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Logo Upload Section */}
               

                {/* Company Info */}
                <section className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('companyInfo')}</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.name')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.email')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.phone')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.address')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">{t('fields.city')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">{t('fields.zip')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.zipCode}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">{t('fields.country')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.country}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.vatNumber')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.vatNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.subscription')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.subsType}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">{t('fields.stripeSub')}:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.companyInfo.isSubStripe ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">{t('fields.active')}</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600 font-medium">{t('fields.inactive')}</span></>
                        )}
                      </span>
                    </div>
                    {data.companyInfo.isSubStripe && data.companyInfo.stripeSubCreatedAt && (
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-muted-foreground opacity-0" />
                        <span className="text-muted-foreground">{t('fields.stripeCreated')}:</span>
                        <span className="font-medium text-foreground ml-auto">{data.companyInfo.stripeSubCreatedAt?.slice(0, 10)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.endsOn')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.subscriptionEndDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.status')}:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.companyInfo.isActive ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">{t('fields.active')}</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 font-medium">{t('fields.inactive')}</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.created')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.createdAt?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-start gap-2.5 mt-1">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{t('fields.notes')}:</span>
                      <span className="font-medium text-foreground ml-auto text-right">{data.companyInfo.notes || '-'}</span>
                    </div>
                    {/* Banking Information Section */}
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">{t('fields.bankingInformation')}</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{t('fields.bank')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.bank || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">{t('fields.accountName')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.nameOfBankAccount || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">{t('fields.iban')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.iban || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">{t('fields.bic')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.bic || '-'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Insurance Information Section */}
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">{t('fields.insuranceInformation')}</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{t('fields.transportInsurance')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.transportInsurancePolicyNo || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">{t('fields.businessInsurance')}:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.businessInsurancePolicyNo || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Manager Info */}
                <section className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('managerInfo')}</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.name')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.firstName} {data.managerInfo.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.email')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.username')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.userName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.status')}:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.managerInfo.isActive ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">{t('fields.active')}</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 font-medium">{t('fields.inactive')}</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.created')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.createdAt?.slice(0, 10)}</span>
                    </div>
                  </div>
                </section>
                <section className="bg-white rounded-xl h-fit shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {/* <p className="w-5 h-5 text-primary" /> */}
                    </div>
                    <h3 className="font-semibold text-lg">{t('companyLogo')}</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  
                  <div className="flex flex-col items-center gap-4 py-4">
                    
                    
                    <div className="w-full">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        aria-label="Upload company logo"
                      />
                      
                      <div className="flex flex-col gap-3">
                        <Button 
                          type="button" 
                          onClick={triggerFileInput}
                          variant="outline" 
                          className="w-full border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {logoFile ? logoFile.name.substring(0, 20) + (logoFile.name.length > 20 ? '...' : '') : t('selectLogo')}
                        </Button>
                        
                        <Button 
                          type="button" 
                          onClick={handleLogoUpload}
                          disabled={!logoFile || isLogoUploading}
                          className="w-full"
                        >
                          {isLogoUploading ? (
                            <>
                              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></span>
                              <span>{t('uploading')}</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              <span>{t('uploadLogo')}</span>
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {uploadError && (
                        <div className="mt-3 text-destructive text-sm animate-fade-in flex items-center gap-1.5 p-2 bg-destructive/10 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          {uploadError}
                        </div>
                      )}
                      
                      {uploadSuccess && (
                        <div className="mt-3 text-green-600 text-sm animate-fade-in flex items-center gap-1.5 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          {uploadSuccess}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>{t('logoUploadRecommendation')}</p>
                        <p>{t('logoSupportedFormats')}</p>
                      </div>
                    </div>
                  </div>
                </section>
                {/* Metrics */}
                <section className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('metrics')}</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.subscriptionDate')}:</span>
                      <span className="font-medium text-foreground ml-auto">{data.metrics.subscriptionDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.customers')}:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">{data.metrics.customerCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.employees')}:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">{data.metrics.employeeCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.totalProfit')}:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-green-50 rounded-full text-green-600 font-medium">${data.metrics.totalProfit}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('fields.paidInvoices')}:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">{data.metrics.paidInvoiceCount}</span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
            {/* Stripe Keys Section */}
            {data?.companyInfo?.isSubStripe && (
              <div className="mt-10">
                <Card className="border-0 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                  <CardHeader className="pb-3 border-b border-muted/20 flex flex-row items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold tracking-tight">{t('stripeKeys.title')}</CardTitle>
                      <CardDescription>{t('stripeKeys.subtitle')}</CardDescription>
                    </div>
                    {!stripeKeys?.publishableKey && (
                      <span className="ml-auto text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{t('stripeKeys.requiredForPayments')}</span>
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isStripeLoading ? (
                      <div className="py-16 text-center text-muted-foreground text-lg flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
                        <span>{t('loading') || 'Laden...'}</span>
                      </div>
                    ) : stripeError ? (
                      <div className="py-16 text-center text-destructive text-lg flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8" />
                        <span>{(stripeError as Error).message}</span>
                      </div>
                    ) : stripeKeys && stripeKeys.publishableKey ? (
                      <div className="mb-6">
                        <div className="mb-3 text-sm font-medium flex items-center gap-2 text-primary/80">
                          <CheckCircle className="w-4 h-4" />
                          {t('stripeKeys.currentKeys')}
                        </div>
                        <div className="flex flex-col gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Input
                              ref={pubKeyRef}
                              readOnly
                              value={stripeKeys.publishableKey}
                              className="font-mono text-xs bg-white/80 cursor-pointer focus:ring-2 focus:ring-primary/30 border-muted/30"
                              onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)}
                              aria-label={t('stripeKeys.publishableKey')}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)} title={t('stripeKeys.copyKey')} className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              ref={secKeyRef}
                              readOnly
                              type={showSecret ? 'text' : 'password'}
                              value={stripeKeys.secretKey}
                              className="font-mono text-xs bg-white/80 cursor-pointer focus:ring-2 focus:ring-primary/30 border-muted/30"
                              onClick={() => secKeyRef.current && handleCopy(secKeyRef)}
                              aria-label={t('stripeKeys.secretKey')}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(v => !v)} title={showSecret ? t('stripeKeys.hideSecret') : t('stripeKeys.showSecret')} className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => secKeyRef.current && handleCopy(secKeyRef)} title={t('stripeKeys.copyKey')} className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          {t('stripeKeys.updateKeys')}
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent my-4" />
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
                          <Info className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">{t('stripeKeys.noKeysSet')}</p>
                            <p className="text-sm">{t('stripeKeys.needKeysMessage')}</p>
                          </div>
                        </div>
                        <div className="mt-4 bg-muted/20 p-4 rounded-lg border border-muted/30">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-primary" />
                            {t('stripeKeys.setupInstructions')}
                          </h4>
                          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground ml-1">
                            <li>{t('stripeKeys.setupSteps.step1')}</li>
                            <li>{t('stripeKeys.setupSteps.step2')}</li>
                            <li>{t('stripeKeys.setupSteps.step3')}</li>
                            <li>{t('stripeKeys.setupSteps.step4')}</li>
                          </ol>
                          <div className="mt-3 text-xs flex items-center gap-1.5 text-amber-600">
                            <Shield className="w-3.5 h-3.5" />
                            {t('stripeKeys.securityWarning')}
                          </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent my-4" />
                      </div>
                    )}
                    <form className="flex flex-col gap-4 max-w-md" onSubmit={handleStripeSubmit} autoComplete="off">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publishableKey" className="text-sm font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('stripeKeys.publishableKey')}
                        </label>
                        <Input
                          id="publishableKey"
                          type="text"
                          placeholder="pk_live_..."
                          value={publishableKey}
                          onChange={e => setPublishableKey(e.target.value)}
                          autoComplete="off"
                          disabled={isSaving}
                          className="bg-white/90 border-muted/30 focus-visible:ring-primary/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="secretKey" className="text-sm font-medium flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                          {t('stripeKeys.secretKey')}
                        </label>
                        <div className="relative flex items-center">
                          <Input
                            id="secretKey"
                            type={showSecret ? 'text' : 'password'}
                            placeholder="sk_live_..."
                            value={secretKey}
                            onChange={e => setSecretKey(e.target.value)}
                            autoComplete="off"
                            disabled={isSaving}
                            className="bg-white/90 pr-10 border-muted/30 focus-visible:ring-primary/30"
                          />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowSecret(v => !v)} tabIndex={-1}>
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      {formError && (
                        <div className="text-destructive text-sm animate-fade-in flex items-center gap-1.5 p-2 bg-destructive/10 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          {formError}
                        </div>
                      )}
                      {formSuccess && (
                        <div className="text-green-600 text-sm animate-fade-in flex items-center gap-1.5 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          {formSuccess}
                        </div>
                      )}
                      <Button
                        variant="default"
                        type="submit"
                        disabled={isSaving}
                        className={`w-fit min-w-[120px] transition gap-1.5 ${formError ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                      >
                        {isSaving ? (
                          <>
                            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                            <span>{t('stripeKeys.saving')}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{t('stripeKeys.save')}</span>
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ViewCompanyPage