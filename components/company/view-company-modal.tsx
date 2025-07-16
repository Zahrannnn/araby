"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { companyApi } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Building2, User2, BarChart2, Eye, EyeOff, Copy, Info } from 'lucide-react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'

// Types are imported from the API client

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
    <div className="min-h-screen w-full bg-gradient-to-br from-muted/50 to-white py-10 px-0 md:px-0 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              Company Settings
            </h1>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground text-lg">Loading...</div>
            ) : error ? (
              <div className="py-16 text-center text-destructive text-lg">{(error as Error).message}</div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Info */}
                <section className="bg-white rounded-lg shadow-sm p-5 flex flex-col gap-3 border border-muted/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">Company Info</span>
                  </div>
                  <hr className="my-2 border-muted/40" />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Name: <span className="font-medium text-foreground">{data.companyInfo.companyName}</span></span>
                    <span className="text-muted-foreground">Email: <span className="font-medium text-foreground">{data.companyInfo.contactEmail}</span></span>
                    <span className="text-muted-foreground">Phone: <span className="font-medium text-foreground">{data.companyInfo.phoneNumber}</span></span>
                    <span className="text-muted-foreground">Address: <span className="font-medium text-foreground">{data.companyInfo.address}</span></span>
                    <span className="text-muted-foreground">City: <span className="font-medium text-foreground">{data.companyInfo.city}</span></span>
                    <span className="text-muted-foreground">ZIP: <span className="font-medium text-foreground">{data.companyInfo.zipCode}</span></span>
                    <span className="text-muted-foreground">Country: <span className="font-medium text-foreground">{data.companyInfo.country}</span></span>
                    <span className="text-muted-foreground">VAT Number: <span className="font-medium text-foreground">{data.companyInfo.vatNumber}</span></span>
                    <span className="text-muted-foreground">Subscription Type: <span className="font-medium text-foreground">{data.companyInfo.subsType}</span></span>
                    <span className="text-muted-foreground">Subscription End: <span className="font-medium text-foreground">{data.companyInfo.subscriptionEndDate?.slice(0,10)}</span></span>
                    <span className="text-muted-foreground">Active: <span className={data.companyInfo.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{data.companyInfo.isActive ? 'Yes' : 'No'}</span></span>
                    <span className="text-muted-foreground">Created At: <span className="font-medium text-foreground">{data.companyInfo.createdAt?.slice(0,10)}</span></span>
                    <span className="text-muted-foreground">Notes: <span className="font-medium text-foreground">{data.companyInfo.notes || '-'}</span></span>
                  </div>
                </section>
                {/* Manager Info */}
                <section className="bg-white rounded-lg shadow-sm p-5 flex flex-col gap-3 border border-muted/40">
                  <div className="flex items-center gap-2 mb-2">
                    <User2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">Manager Info</span>
                  </div>
                  <hr className="my-2 border-muted/40" />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Name: <span className="font-medium text-foreground">{data.managerInfo.firstName} {data.managerInfo.lastName}</span></span>
                    <span className="text-muted-foreground">Email: <span className="font-medium text-foreground">{data.managerInfo.email}</span></span>
                    <span className="text-muted-foreground">Username: <span className="font-medium text-foreground">{data.managerInfo.userName}</span></span>
                    <span className="text-muted-foreground">Active: <span className={data.managerInfo.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{data.managerInfo.isActive ? 'Yes' : 'No'}</span></span>
                    <span className="text-muted-foreground">Created At: <span className="font-medium text-foreground">{data.managerInfo.createdAt?.slice(0,10)}</span></span>
                  </div>
                </section>
                {/* Metrics */}
                <section className="bg-white rounded-lg shadow-sm p-5 flex flex-col gap-3 border border-muted/40">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">Metrics</span>
                  </div>
                  <hr className="my-2 border-muted/40" />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Subscription Date: <span className="font-medium text-foreground">{data.metrics.subscriptionDate?.slice(0,10)}</span></span>
                    <span className="text-muted-foreground">Customers: <span className="font-medium text-foreground">{data.metrics.customerCount}</span></span>
                    <span className="text-muted-foreground">Employees: <span className="font-medium text-foreground">{data.metrics.employeeCount}</span></span>
                    <span className="text-muted-foreground">Total Profit: <span className="font-medium text-foreground">{data.metrics.totalProfit}</span></span>
                    <span className="text-muted-foreground">Paid Invoices: <span className="font-medium text-foreground">{data.metrics.paidInvoiceCount}</span></span>
                  </div>
                </section>
              </div>
            ) : null}
            {/* Stripe Keys Section */}
            <div className="mt-10">
              <Card className="border border-muted/40 shadow-sm bg-muted/30">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                 <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="28" rx="6" fill="#635BFF"/><text x="7" y="20" font-size="15" fill="white" font-family="Arial, sans-serif">S</text></svg>
                  <span className="font-semibold text-lg">Stripe API Keys</span>
                 {!stripeKeys?.publishableKey && (
                   <span className="ml-2 text-muted-foreground flex items-center gap-1 text-xs">
                     <Info className="w-4 h-4" />
                     <span>Required for accepting payments</span>
                   </span>
                 )}
                </CardHeader>
                <CardContent>
                  {isStripeLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading Stripe keys...</div>
                  ) : stripeError ? (
                    <div className="py-8 text-center text-destructive">{(stripeError as Error).message}</div>
                  ) : stripeKeys && stripeKeys.publishableKey ? (
                    <div className="mb-6">
                      <div className="mb-2 text-sm text-muted-foreground">Current Stripe keys for this company:</div>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Input
                            ref={pubKeyRef}
                            readOnly
                            value={stripeKeys.publishableKey}
                            className="font-mono text-xs bg-white/80 cursor-pointer focus:ring-2 focus:ring-primary/30"
                            onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)}
                            aria-label="Publishable Key"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => pubKeyRef.current && handleCopy(pubKeyRef)} title="Copy Publishable Key">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            ref={secKeyRef}
                            readOnly
                            type={showSecret ? 'text' : 'password'}
                            value={stripeKeys.secretKey}
                            className="font-mono text-xs bg-white/80 cursor-pointer focus:ring-2 focus:ring-primary/30"
                            onClick={() => secKeyRef.current && handleCopy(secKeyRef)}
                            aria-label="Secret Key"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(v => !v)} title={showSecret ? 'Hide Secret' : 'Show Secret'}>
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button type="button" variant="outline" size="icon" onClick={() => secKeyRef.current && handleCopy(secKeyRef)} title="Copy Secret Key">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">To update, enter new keys below and save.</div>
                      <hr className="my-4 border-muted/40" />
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="mb-2 text-sm text-muted-foreground flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        No Stripe keys are set for this company.
                      </div>
                      <div className="text-sm mb-2">To accept payments, you need to add your Stripe API keys.</div>
                      <ol className="list-decimal list-inside text-sm mb-2">
                        <li>Log in to your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Dashboard</a>.</li>
                        <li>Go to <b>Developers &gt; API keys</b>.</li>
                        <li>Copy your <b>Publishable key</b> and <b>Secret key</b>.</li>
                        <li>Paste them below and click <b>Save</b>.</li>
                      </ol>
                      <div className="text-xs text-muted-foreground">Never share your secret key publicly.</div>
                      <hr className="my-4 border-muted/40" />
                    </div>
                  )}
                  <form className="flex flex-col gap-4 max-w-md" onSubmit={handleStripeSubmit} autoComplete="off">
                    <Input
                      type="text"
                      placeholder="Publishable Key (pk_live_...)"
                      value={publishableKey}
                      onChange={e => setPublishableKey(e.target.value)}
                      autoComplete="off"
                      disabled={isSaving}
                      className="bg-white/90"
                    />
                    <div className="relative flex items-center">
                      <Input
                        type={showSecret ? 'text' : 'password'}
                        placeholder="Secret Key (sk_live_...)"
                        value={secretKey}
                        onChange={e => setSecretKey(e.target.value)}
                        autoComplete="off"
                        disabled={isSaving}
                        className="bg-white/90 pr-10"
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowSecret(v => !v)} tabIndex={-1}>
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {formError && <div className="text-destructive text-sm animate-fade-in">{formError}</div>}
                    {formSuccess && <div className="text-green-600 text-sm animate-fade-in">{formSuccess}</div>}
                    <Button type="submit" disabled={isSaving} className={`w-fit min-w-[120px] transition ${formError ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}>{isSaving ? 'Saving...' : 'Save'}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ViewCompanyPage