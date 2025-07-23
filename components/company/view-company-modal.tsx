"use client"
import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { companyApi, googleCalendarApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Building2, User2, BarChart2, Eye, EyeOff, Copy, Info, CheckCircle, AlertCircle,
  CreditCard, Calendar, Mail, Phone, MapPin, Hash, FileText, Clock, Shield, Key, Save, Calendar as CalendarIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ViewCompanyPage: React.FC = () => {
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
    enabled: !!data?.companyInfo?.isSubStripe, // Only fetch if Stripe is enabled
  })

  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const pubKeyRef = useRef<HTMLInputElement>(null!)
  const secKeyRef = useRef<HTMLInputElement>(null!)

  const { mutate: saveStripeKeys, isPending: isSaving } = useMutation<void, Error, { publishableKey: string; secretKey: string }>({
    mutationFn: companyApi.setStripeKeys,
    onSuccess: () => {
      setFormSuccess('Stripe keys saved successfully.')
      setFormError(null)
      queryClient.invalidateQueries({ queryKey: ['company-stripe-keys'] })
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Failed to save Stripe keys')
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

  function handleStripeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    if (!publishableKey.trim() || !secretKey.trim()) {
      setFormError('Both keys are required.')
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-muted/50 via-background to-white py-10 px-4 md:px-6 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="pb-3 border-b border-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">Company Settings</CardTitle>
                  <CardDescription>Manage your company information and API keys</CardDescription>
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
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    <span>Connect Google Calendar</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground text-lg">Loading...</div>
            ) : error ? (
              <div className="py-16 text-center text-destructive text-lg">{(error as Error).message}</div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Info */}
                <section className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Company Info</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">ZIP:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.zipCode}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.country}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">VAT Number:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.vatNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Subscription:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.subsType}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                      <span className="text-muted-foreground">Stripe Sub:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.companyInfo.isSubStripe ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">Active</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600 font-medium">Inactive</span></>
                        )}
                      </span>
                    </div>
                    {data.companyInfo.isSubStripe && data.companyInfo.stripeSubCreatedAt && (
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-muted-foreground opacity-0" />
                        <span className="text-muted-foreground">Stripe Created:</span>
                        <span className="font-medium text-foreground ml-auto">{data.companyInfo.stripeSubCreatedAt?.slice(0, 10)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ends on:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.subscriptionEndDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.companyInfo.isActive ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">Active</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 font-medium">Inactive</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium text-foreground ml-auto">{data.companyInfo.createdAt?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-start gap-2.5 mt-1">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Notes:</span>
                      <span className="font-medium text-foreground ml-auto text-right">{data.companyInfo.notes || '-'}</span>
                    </div>
                    {/* Banking Information Section */}
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">Banking Information</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.bank || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.nameOfBankAccount || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">IBAN:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.iban || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">BIC:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.bic || '-'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Insurance Information Section */}
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-2">Insurance Information</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Transport Insurance:</span>
                          <span className="font-medium text-foreground ml-auto">{data.companyInfo.transportInsurancePolicyNo || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-muted-foreground opacity-0" />
                          <span className="text-muted-foreground">Business Insurance:</span>
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
                    <h3 className="font-semibold text-lg">Manager Info</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.firstName} {data.managerInfo.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.userName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {data.managerInfo.isActive ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-medium">Active</span></>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600 font-medium">Inactive</span></>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium text-foreground ml-auto">{data.managerInfo.createdAt?.slice(0, 10)}</span>
                    </div>
                  </div>
                </section>
                {/* Metrics */}
                <section className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 border border-muted/30 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Metrics</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent" />
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Subscription Date:</span>
                      <span className="font-medium text-foreground ml-auto">{data.metrics.subscriptionDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Customers:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">{data.metrics.customerCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Employees:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-primary font-medium">{data.metrics.employeeCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Total Profit:</span>
                      <span className="font-medium text-foreground ml-auto flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-green-50 rounded-full text-green-600 font-medium">${data.metrics.totalProfit}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Paid Invoices:</span>
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
                      <CardTitle className="text-xl font-bold tracking-tight">Stripe API Keys</CardTitle>
                      <CardDescription>Configure your payment processing credentials</CardDescription>
                    </div>
                    {!stripeKeys?.publishableKey && (
                      <span className="ml-auto text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Required for payments</span>
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isStripeLoading ? (
                      <div className="py-16 text-center text-muted-foreground text-lg flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
                        <span>Loading Stripe keys...</span>
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
                          Current Stripe keys for this company:
                        </div>
                        <div className="flex flex-col gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Input
                              ref={pubKeyRef}
                              readOnly
                              value={stripeKeys.publishableKey}
                              className="font-mono text-xs bg-white/80 cursor-pointer focus:ring-2 focus:ring-primary/30 border-muted/30"
                              onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)}
                              aria-label="Publishable Key"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)} title="Copy Publishable Key" className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
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
                              aria-label="Secret Key"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(v => !v)} title={showSecret ? 'Hide Secret' : 'Show Secret'} className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => secKeyRef.current && handleCopy(secKeyRef)} title="Copy Secret Key" className="border-muted/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          To update, enter new keys below and save.
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent my-4" />
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
                          <Info className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">No Stripe keys are set for this company</p>
                            <p className="text-sm">To accept payments, you need to add your Stripe API keys.</p>
                          </div>
                        </div>
                        <div className="mt-4 bg-muted/20 p-4 rounded-lg border border-muted/30">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-primary" />
                            Setup Instructions:
                          </h4>
                          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground ml-1">
                            <li>Log in to your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">Stripe Dashboard</a>.</li>
                            <li>Go to <span className="font-medium text-foreground">Developers &gt; API keys</span>.</li>
                            <li>Copy your <span className="font-medium text-foreground">Publishable key</span> and <span className="font-medium text-foreground">Secret key</span>.</li>
                            <li>Paste them below and click <span className="font-medium text-foreground">Save</span>.</li>
                          </ol>
                          <div className="mt-3 text-xs flex items-center gap-1.5 text-amber-600">
                            <Shield className="w-3.5 h-3.5" />
                            Never share your secret key publicly.
                          </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-muted/50 via-muted/30 to-transparent my-4" />
                      </div>
                    )}
                    <form className="flex flex-col gap-4 max-w-md" onSubmit={handleStripeSubmit} autoComplete="off">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publishableKey" className="text-sm font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-muted-foreground" />
                          Publishable Key
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
                          Secret Key
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
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
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