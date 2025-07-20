"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArchiveBoxIcon, ChevronLeftIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ArchiveIcon, PackageIcon, TrashIcon } from 'lucide-react'
import { TruckIcon } from 'lucide-react'
import { ServiceDetailsModal, ServiceType } from './service-details-modal'
import { PackingMaterialModal, type PackingMaterial } from './packing-material-modal'
import { cookieUtils } from '@/lib/utils/cookies'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface Location {
  locationType: 'Origin' | 'Destination';
  addressIndex: number;
  street: string;
  zipCode: string;
  city: string;
  countryCode: string;
  buildingType: string;
  floor: string;
  hasLift: boolean;
}

interface AdditionalCost {
  description: string;
  price: number;
}

interface MoveService {
  moveDate: string;
  moveInDate: string;
  moveStartTime: string;
  roundTripCostCHF: number;
  selectedTariffDescription: string;
  numberOfStaff: number;
  numberOfDeliveryTrucks: number;
  hourlyRateCHF: number;
  durationHours: number;
  disassemblyAssemblyBy: string;
}

interface CleaningService {
  cleaningType: string;
  fixedPriceRateCHF: number;
  hourlyRateCHFPerHour: number | null;
  durationHours: number | null;
  numberOfStaff: number;
  fillNailHoles: boolean;
  withHighPressureCleaner: boolean;
  cleaningDate: string;
  cleaningStartTime: string;
  deliveryDate: string;
  deliveryTime: string;
  discount: number;
  additionalCosts: AdditionalCost[];
}

interface PackingService {
  packingDate: string;
  packingStartTime: string;
  roundTripCostCHF: number;
  durationHours: number;
  selectedTariffDescription: string;
  numberOfStaff: number;
  hourlyRateCHF: number;
  packingMaterialsCost: number;
}

interface UnpackingService {
  unpackingDate: string;
  unpackingStartTime: string;
  roundTripCostCHF: number;
  durationHours: number;
  selectedTariffDescription: string;
  numberOfStaff: number;
  hourlyRateCHF: number;
  packingMaterialsCost: number;
}

interface DisposalService {
  volumeRateCHFPerM3: number;
  flatRateDisposalCostCHF: number;
  estimatedVolumeM3: number;
  selectedEmployeePlanTariffDescription: string | null;
  numberOfStaff: number | null;
  numberOfDeliveryTrucks: number | null;
  hourlyRateCHF: number | null;
  durationHours: number | null;
  disposalDate: string;
  disposalStartTime: string;
  roundTripCostCHF: number;
  additionalCostsText: string;
  discount: number;
  furtherDiscounts: string;
}

interface StorageService {
  rateCHFPerM3PerMonth: number;
  volumeM3: number;
  additionalCostsText: string;
  furtherDiscounts: string;
  cost: number;
}

interface TransportService {
  transportTypeText: string;
  fixedRateCHF: number;
  selectedHourlyTariffDescription: string | null;
  numberOfStaff: number;
  numberOfDeliveryTrucks: number;
  hourlyRateCHF: number | null;
  durationHours: number | null;
  transportDate: string;
  transportStartTime: string;
  roundTripCostCHF: number;
  additionalCostsText: string;
  cost: number;
  discount: number;
  concessionText: string;
  furtherDiscounts: string;
}

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId?: number;
}

interface OfferData {
  customerId: number;
  viewAppointmentState: string;
  notesInOffer: string;
  notesNotInOffer: string;
  costsIncludeVAT: boolean;
  costsExcludeVAT: boolean;
  vatFree: boolean;
  contactPersonInternalUserId: number;
  contactPersonFreeText: string;
  emailToCustomer: boolean;
  customerEmail: string;
  languageCode: string;
  locations: Location[];
  packingMaterials: PackingMaterial[];
  moveService?: MoveService;
  cleaningService?: CleaningService;
  packingService?: PackingService;
  unpackingService?: UnpackingService;
  disposalService?: DisposalService;
  storageService?: StorageService;
  transportService?: TransportService;
}

export function EditOfferModal({ isOpen, onClose, offerId }: EditOfferModalProps) {
  const t = useTranslations('company.offers.editModal')
  const [selectedService, setSelectedService] = useState<ServiceType['type'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [offerData, setOfferData] = useState<OfferData>({
    customerId: 1,
    viewAppointmentState: 'Fatto',
    notesInOffer: '',
    notesNotInOffer: '',
    costsIncludeVAT: true,
    costsExcludeVAT: false,
    vatFree: false,
    contactPersonInternalUserId: 5,
    contactPersonFreeText: 'Lumi Alimi',
    emailToCustomer: true,
    customerEmail: 'mario.rossi@example.it',
    languageCode: 'it',
    locations: [{
      locationType: 'Origin',
      addressIndex: 1,
      street: '',
      zipCode: '',
      city: '',
      countryCode: '',
      buildingType: '',
      floor: '',
      hasLift: false
    }],
    packingMaterials: []
  })
  const [isPackingMaterialModalOpen, setIsPackingMaterialModalOpen] = useState(false)
  const router = useRouter()
  // Fetch offer data when editing
  useEffect(() => {
    async function fetchOfferData() {
      if (!offerId) {
        // Reset form for new offer
        setOfferData({
          customerId: 1,
          viewAppointmentState: 'Fatto',
          notesInOffer: '',
          notesNotInOffer: '',
          costsIncludeVAT: true,
          costsExcludeVAT: false,
          vatFree: false,
          contactPersonInternalUserId: 5,
          contactPersonFreeText: 'Lumi Alimi',
          emailToCustomer: true,
          customerEmail: 'mario.rossi@example.it',
          languageCode: 'it',
          locations: [{
            locationType: 'Origin',
            addressIndex: 1,
            street: '',
            zipCode: '',
            city: '',
            countryCode: '',
            buildingType: '',
            floor: '',
            hasLift: false
          }],
          packingMaterials: []
        })
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get(`/Offers/${offerId}`)
        console.log('Fetched offer data:', response.data)
        setOfferData(response.data)
      } catch (err) {
        console.error('Error fetching offer:', err)
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to load offer data'
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchOfferData()
    }
  }, [isOpen, offerId])

  const handleInputChange = <K extends keyof OfferData>(
    field: K,
    value: OfferData[K]
  ) => {
    setOfferData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field: keyof Pick<OfferData, 'emailToCustomer' | 'costsIncludeVAT' | 'costsExcludeVAT' | 'vatFree'>) => {
    return (checked: boolean) => {
      setOfferData(prev => ({
        ...prev,
        [field]: checked
      }))
    }
  }

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const handleServiceClick = (type: ServiceType['type']) => {
    setSelectedService(type)
  }

  const handleServiceSave = (data: ServiceType['data']) => {
    setOfferData(prev => ({
      ...prev,
      [`${selectedService}Service`]: data
    }))
    setSelectedService(null)
  }

  const handleAddLocation = () => {
    setOfferData(prev => ({
      ...prev,
      locations: [...prev.locations, {
        locationType: 'Destination',
        addressIndex: prev.locations.length + 1,
        street: '',
        zipCode: '',
        city: '',
        countryCode: '',
        buildingType: '',
        floor: '',
        hasLift: false
      }]
    }))
  }

  const handleRemoveLocation = (index: number) => {
    setOfferData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }))
  }

  const handleLocationChange = (index: number, field: keyof Location, value: string | number | boolean) => {
    setOfferData(prev => ({
      ...prev,
      locations: prev.locations.map((location, i) => {
        if (i === index) {
          return { ...location, [field]: value }
        }
        return location
      })
    }))
  }

  const handleAddPackingMaterial = (material: PackingMaterial) => {
    setOfferData(prev => ({
      ...prev,
      packingMaterials: [...prev.packingMaterials, material]
    }))
    setIsPackingMaterialModalOpen(false)
  }

  const handleRemovePackingMaterial = (index: number) => {
    setOfferData(prev => ({
      ...prev,
      packingMaterials: prev.packingMaterials.filter((_, i) => i !== index)
    }))
  }

  const calculateTotalPackingMaterialsCost = () => {
    return offerData.packingMaterials.reduce((total, material) => total + material.totalPrice, 0)
  }

  const isServiceConfigured = (type: ServiceType['type']) => {
    return !!offerData[`${type}Service`]
  }

  const validateOfferData = (): string | null => {
    if (!offerData.customerId) {
      return t('validation.customerRequired')
    }
    if (!offerData.locations.length) {
      return t('validation.locationRequired')
    }
    
    // Validate locations
    for (const location of offerData.locations) {
      if (!location.street || !location.zipCode || !location.city || !location.countryCode) {
        return t('validation.locationFieldsRequired')
      }
    }

    // Validate at least one service is configured
    const serviceKeys = [
      'moveService',
      'cleaningService',
      'packingService',
      'unpackingService',
      'disposalService',
      'storageService',
      'transportService'
    ] as const

    const hasAnyService = serviceKeys.some(key => !!offerData[key])

    if (!hasAnyService) {
      return t('validation.serviceRequired')
    }

    return null
  }

  const handleSaveOffer = async () => {
    try {
      setError(null)
      setIsSubmitting(true)

      // Validate data before sending
      const validationError = validateOfferData()
      if (validationError) {
        setError(validationError)
        return
      }

      const endpoint = offerId 
        ? `https://crmproject.runasp.net/api/Offers/${offerId}` 
        : 'https://crmproject.runasp.net/api/Offers'

      console.log('Saving offer data:', {
        endpoint,
        method: offerId ? 'PUT' : 'POST',
        data: offerData
      })

      const response = await fetch(endpoint, {
        method: offerId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookieUtils.getToken()}`,
        },
        body: JSON.stringify(offerData)
      })
      
      if (!response.ok) {
        let errorMessage = `Failed to save offer: ${response.status} ${response.statusText}`
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          try {
            const errorResponse = await response.json()
            if (errorResponse) {
              errorMessage = errorResponse.message || 
                            errorResponse.title || 
                            errorResponse.error ||
                            errorMessage
            }
          } catch (parseError) {
            console.error('Error parsing error response:', parseError)
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Check if we have a JSON response
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        try {
          const data = await response.json()
          console.log('Offer saved successfully:', data)
          router.refresh()
        } catch (parseError) {
          console.warn('Could not parse success response as JSON:', parseError)
        }
      } else {
        console.log('Offer saved successfully (no JSON response)')
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving offer:', error)
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while saving the offer'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderServiceCard = (
    type: ServiceType['type'],
    icon: React.ReactNode,
    title: string,
    description: string
  ) => (
    <Card 
      className={`cursor-pointer hover:border-red-500 transition-colors ${
        isServiceConfigured(type) ? 'border-red-500' : ''
      }`}
      onClick={() => handleServiceClick(type)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        {icon}
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
        {isServiceConfigured(type) && (
          <div className="mt-2 text-xs text-red-500">{t('configured')}</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button 
              variant="default" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {offerId ? t('editTitle') : t('createTitle')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('basicSettings')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pdfLanguage')}
                </label>
                <Select
                  value={offerData.languageCode}
                  onValueChange={(value) => handleInputChange('languageCode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emailToCustomer" 
                  checked={offerData.emailToCustomer}
                  onCheckedChange={handleCheckboxChange('emailToCustomer')}
                />
                <label htmlFor="emailToCustomer" className="text-sm font-medium text-gray-700">
                  {t('emailToCustomer')}
                </label>
              </div>
            </div>
          </section>

          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('customerInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customer')}
                </label>
                <Input 
                  type="number"
                  value={offerData.customerId}
                  onChange={(e) => handleInputChange('customerId', parseInt(e.target.value))}
                  placeholder={t('selectCustomer')} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contactPerson')}
                </label>
                <Input 
                  value={offerData.contactPersonFreeText}
                  onChange={(e) => handleInputChange('contactPersonFreeText', e.target.value)}
                  placeholder={t('selectContact')} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('status')}
                </label>
                <Input 
                  value={offerData.viewAppointmentState}
                  onChange={(e) => handleInputChange('viewAppointmentState', e.target.value)}
                  placeholder={t('selectStatus')} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customerEmail')}
                </label>
                <Input 
                  type="email"
                  value={offerData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder={t('enterCustomerEmail')} 
                />
              </div>
            </div>
          </section>

          {/* Services */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('servicess')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderServiceCard(
                'move',
                <TruckIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.moving'),
                t('services.movingDesc')
              )}
              {renderServiceCard(
                'cleaning',
                <SparklesIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.cleaning'),
                t('services.cleaningDesc')
              )}
              {renderServiceCard(
                'packing',
                <PackageIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.packing'),
                t('services.packingDesc')
              )}
              {renderServiceCard(
                'unpacking',
                <ArchiveIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.unpacking'),
                t('services.unpackingDesc')
              )}
              {renderServiceCard(
                'disposal',
                <TrashIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.disposal'),
                t('services.disposalDesc')
              )}
              {renderServiceCard(
                'storage',
                <ArchiveBoxIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.storage'),
                t('services.storageDesc')
              )}
              {renderServiceCard(
                'transport',
                <TruckIcon className="h-8 w-8 text-red-500 mb-2" />,
                t('services.specialTransport'),
                t('services.specialTransportDesc')
              )}
            </div>
          </section>

          {/* Locations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('locations')}</h3>
              <Button variant="default" className="gap-2" onClick={handleAddLocation}>
                <PlusIcon className="h-4 w-4" />
                {t('addLocation')}
              </Button>
            </div>
            <div className="space-y-6">
              {offerData.locations.map((location, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{t('location')} {location.addressIndex}</h4>
                      {offerData.locations.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveLocation(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('locationType')}
                        </label>
                        <Select
                          value={location.locationType}
                          onValueChange={(value) => handleLocationChange(index, 'locationType', value as 'Origin' | 'Destination')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectLocationType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Origin">{t('origin')}</SelectItem>
                            <SelectItem value="Destination">{t('destination')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('addressIndex')}
                        </label>
                        <Input
                          type="number"
                          value={location.addressIndex}
                          onChange={(e) => handleLocationChange(index, 'addressIndex', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('street')}
                        </label>
                        <Input
                          value={location.street}
                          onChange={(e) => handleLocationChange(index, 'street', e.target.value)}
                          placeholder={t('enterStreetAddress')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('zipCode')}
                        </label>
                        <Input
                          value={location.zipCode}
                          onChange={(e) => handleLocationChange(index, 'zipCode', e.target.value)}
                          placeholder={t('enterZipCode')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('city')}
                        </label>
                        <Input
                          value={location.city}
                          onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                          placeholder={t('enterCity')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('countryCode')}
                        </label>
                        <Input
                          value={location.countryCode}
                          onChange={(e) => handleLocationChange(index, 'countryCode', e.target.value)}
                          placeholder={t('enterCountryCode')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('floor')}
                        </label>
                        <Input
                          value={location.floor}
                          onChange={(e) => handleLocationChange(index, 'floor', e.target.value)}
                          placeholder={t('enterFloor')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('buildingType')}
                        </label>
                        <Input
                          value={location.buildingType}
                          onChange={(e) => handleLocationChange(index, 'buildingType', e.target.value)}
                          placeholder={t('enterBuildingType')}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`hasLift-${index}`}
                            checked={location.hasLift}
                            onCheckedChange={(checked) => handleLocationChange(index, 'hasLift', checked as boolean)}
                          />
                          <label htmlFor={`hasLift-${index}`} className="text-sm font-medium text-gray-700">
                            {t('hasLift')}
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Packing Materials */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('packingMaterials')}</h3>
              <Button 
                variant="default" 
                className="gap-2" 
                onClick={() => setIsPackingMaterialModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4" />
                {t('addMaterial')}
              </Button>
            </div>
            {offerData.packingMaterials.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <PackageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">{t('noMaterialsYet')}</p>
                  <Button 
                    variant="default" 
                    className="gap-2" 
                    onClick={() => setIsPackingMaterialModalOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4" />
                    {t('addMaterial')}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4 font-medium">{t('description')}</th>
                            <th className="text-left py-2 px-4 font-medium">{t('rentOrBuy')}</th>
                            <th className="text-right py-2 px-4 font-medium">{t('quantity')}</th>
                            <th className="text-right py-2 px-4 font-medium">{t('unitPrice')}</th>
                            <th className="text-right py-2 px-4 font-medium">{t('totalPrice')}</th>
                            <th className="py-2 px-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {offerData.packingMaterials.map((material, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-2 px-4">{material.description}</td>
                              <td className="py-2 px-4">{t(material.rentOrBuy)}</td>
                              <td className="py-2 px-4 text-right">{material.quantity}</td>
                              <td className="py-2 px-4 text-right">
                                {material.unitPrice.toFixed(2)} CHF
                              </td>
                              <td className="py-2 px-4 text-right">
                                {material.totalPrice.toFixed(2)} CHF
                              </td>
                              <td className="py-2 px-4">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleRemovePackingMaterial(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={4} className="py-2 px-4 text-right">
                              {t('total')}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {calculateTotalPackingMaterialsCost().toFixed(2)} CHF
                            </td>
                            <td className="py-2 px-4"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    className="gap-2" 
                    onClick={() => setIsPackingMaterialModalOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4" />
                    {t('addMaterial')}
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('notes')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notesInOffer')}
                </label>
                <Textarea 
                  value={offerData.notesInOffer}
                  onChange={(e) => handleInputChange('notesInOffer', e.target.value)}
                  placeholder={t('enterNotesInOffer')}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notesNotInOffer')}
                </label>
                <Textarea 
                  value={offerData.notesNotInOffer}
                  onChange={(e) => handleInputChange('notesNotInOffer', e.target.value)}
                  placeholder={t('enterNotesNotInOffer')}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </section>

          {/* VAT Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('vatSettings')}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="costsIncludeVAT"
                  checked={offerData.costsIncludeVAT}
                  onCheckedChange={handleCheckboxChange('costsIncludeVAT')}
                />
                <label htmlFor="costsIncludeVAT" className="text-sm font-medium text-gray-700">
                  {t('costsIncludeVAT')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="costsExcludeVAT"
                  checked={offerData.costsExcludeVAT}
                  onCheckedChange={handleCheckboxChange('costsExcludeVAT')}
                />
                <label htmlFor="costsExcludeVAT" className="text-sm font-medium text-gray-700">
                  {t('costsExcludeVAT')}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vatFree"
                  checked={offerData.vatFree}
                  onCheckedChange={handleCheckboxChange('vatFree')}
                />
                <label htmlFor="vatFree" className="text-sm font-medium text-gray-700">
                  {t('vatFree')}
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Add error display */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSaveOffer}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('saving')}
              </div>
            ) : (
              offerId ? t('saveChanges') : t('createOffer')
            )}
          </Button>
        </div>

        {/* Service Details Modal */}
        <ServiceDetailsModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          serviceType={selectedService!}
          initialData={selectedService ? offerData[`${selectedService}Service`] : undefined}
          onSave={handleServiceSave}
        />

        {/* Packing Material Modal */}
        <PackingMaterialModal
          isOpen={isPackingMaterialModalOpen}
          onClose={() => setIsPackingMaterialModalOpen(false)}
          onSave={handleAddPackingMaterial}
        />
      </div>
    </div>
  )
} 