/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArchiveBoxIcon, ChevronLeftIcon, PlusIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ArchiveIcon, PackageIcon, TrashIcon } from 'lucide-react'
import { TruckIcon } from 'lucide-react'
import { ServiceDetailsModal, ServiceType } from './service-details-modal'
import { PackingMaterialModal, type PackingMaterial } from './packing-material-modal'
import { cookieUtils } from '@/lib/utils/cookies'
import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/app/hooks/useDebounce'
// Add imports for alert components
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add status enum and options
enum OfferStatus {
  Pending = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3,
  Canceled = 4
}

const STATUS_OPTIONS = [
  { value: OfferStatus.Pending, label: 'Pending' },
  { value: OfferStatus.Sent, label: 'Sent' },
  { value: OfferStatus.Accepted, label: 'Accepted' },
  { value: OfferStatus.Rejected, label: 'Rejected' },
  { value: OfferStatus.Canceled, label: 'Canceled' }
] as const;

interface Customer {
  id: number;
  fullName: string;
}

interface Location {
  locationType: string;
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
  additionalCosts: AdditionalCost[];
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
  additionalCosts: AdditionalCost[];
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
  additionalCosts: AdditionalCost[];
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
  discount: number;
  furtherDiscounts: string;
  additionalCosts: AdditionalCost[];
}

interface StorageService {
  rateCHFPerM3PerMonth: number;
  volumeM3: number;
  additionalCosts: AdditionalCost[];
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
  cost: number;
  discount: number;
  concessionText: string;
  furtherDiscounts: string;
  additionalCosts: AdditionalCost[];
}

interface OfferData {
  customerId: number;
  notesInOffer: string;
  notesNotInOffer: string;
  costsIncludeVAT: boolean;
  costsExcludeVAT: boolean;
  vatFree: boolean;
  emailToCustomer: boolean;
  languageCode: string;
  locations: Location[];
  packingMaterials: PackingMaterial[];
  moveService?: MoveService | null;
  cleaningService?: CleaningService | null;
  packingService?: PackingService | null;
  unpackingService?: UnpackingService | null;
  disposalService?: DisposalService | null;
  storageService?: StorageService | null;
  transportService?: TransportService | null;
  status?: OfferStatus; // Added status field
}

const initialOfferData: OfferData = {
  customerId: 0,
  notesInOffer: '',
  notesNotInOffer: '',
  costsIncludeVAT: true,
  costsExcludeVAT: false,
  vatFree: false,
  emailToCustomer: true,
  languageCode: 'en', // Set default to English
  locations: [{
    locationType: '',
    addressIndex: 1,
    street: '',
    zipCode: '',
    city: '',
    countryCode: '',
    buildingType: '',
    floor: '',
    hasLift: false
  }],
  packingMaterials: [],
  moveService: null,
  cleaningService: null,
  packingService: null,
  unpackingService: null,
  disposalService: null,
  storageService: null,
  transportService: null
}

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId?: number;
}

// Add language options constant
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' }
] as const;

export function EditOfferModal({ isOpen, onClose, offerId }: EditOfferModalProps) {
  const t = useTranslations('company.offers.editModal')
  const [selectedService, setSelectedService] = useState<ServiceType['type'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [offerData, setOfferData] = useState<OfferData>(initialOfferData)
  const [isPackingMaterialModalOpen, setIsPackingMaterialModalOpen] = useState(false)
  const router = useRouter()

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearch = useDebounce(customerSearch, 300)

  // Fetch offer data when editing
  useEffect(() => {
    async function fetchOfferData() {
      if (!offerId) {
        setOfferData(initialOfferData)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.get(`/Offers/${offerId}`)
        console.log('Fetched offer data:', response.data)

        // Extract services from the response data
        const {
          moveService,
          cleaningService,
          packingService,
          unpackingService,
          disposalService,
          storageService,
          transportService,
          ...restData
        } = response.data

        // Create services object with services that might be null
        const services = {
          moveService: moveService || null,
          cleaningService: cleaningService || null,
          packingService: packingService || null,
          unpackingService: unpackingService || null,
          disposalService: disposalService || null,
          storageService: storageService || null,
          transportService: transportService || null
        }

        // Set the offer data with properly structured services
        setOfferData({
          ...restData,
          ...services,
          // Ensure required fields have default values if missing
          locations: restData.locations || initialOfferData.locations,
          packingMaterials: restData.packingMaterials || initialOfferData.packingMaterials,
          languageCode: restData.languageCode || initialOfferData.languageCode,
          costsIncludeVAT: restData.costsIncludeVAT ?? initialOfferData.costsIncludeVAT,
          costsExcludeVAT: restData.costsExcludeVAT ?? initialOfferData.costsExcludeVAT,
          vatFree: restData.vatFree ?? initialOfferData.vatFree,
          emailToCustomer: restData.emailToCustomer ?? initialOfferData.emailToCustomer,
        })
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

  // Search customers when input changes
  useEffect(() => {
    async function searchCustomers() {
      if (!debouncedSearch) {
        setCustomers([])
        return
      }

      try {
        setIsSearching(true)
        const response = await apiClient.get<Customer[]>(`/Task/customers?searchName=${debouncedSearch}`)
        setCustomers(response.data)
      } catch (err) {
        console.error('Error searching customers:', err)
        setCustomers([])
      } finally {
        setIsSearching(false)
      }
    }

    searchCustomers()
  }, [debouncedSearch])

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
      if (field === 'emailToCustomer') {
        setOfferData(prev => ({
          ...prev,
          [field]: checked
        }))
      } else {
        // For VAT settings, make them mutually exclusive
        setOfferData(prev => ({
          ...prev,
          costsIncludeVAT: field === 'costsIncludeVAT' ? checked : false,
          costsExcludeVAT: field === 'costsExcludeVAT' ? checked : false,
          vatFree: field === 'vatFree' ? checked : false
        }))
      }
    }
  }

  // Add status update handler
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const statusValue = parseInt(newStatus)
      
      console.log('Updating status:', {
        offerId,
        newStatus: statusValue,
        endpoint: `https://nedx.premiumasp.net/api/Offers/${offerId}/status`
      })

      const response = await fetch(`https://nedx.premiumasp.net/api/Offers/${offerId}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookieUtils.getToken()}`
        },
        body: JSON.stringify(statusValue)
      })

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status} ${response.statusText}`)
      }

      // Update local state after successful API call
      setOfferData(prev => ({
        ...prev,
        status: statusValue as OfferStatus
      }))

      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while updating the status'
      )
    } finally {
      setIsSubmitting(false)
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
    setSelectedService(type);
    // Don't initialize the service data here - let the ServiceDetailsModal handle it
  }

  const handleServiceSave = (data: ServiceType['data']) => {
    // Only update the service data if we received valid data from the modal
    if (data) {
      setOfferData(prev => ({
        ...prev,
        [`${selectedService}Service`]: data
      }));
    }
    
    setSelectedService(null);
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
    return !!offerData[`${type}Service`] && offerData[`${type}Service`] !== null
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

    const hasAnyService = serviceKeys.some(key => !!offerData[key] && offerData[key] !== null)

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

      // Create a copy of the data to modify before sending
      const dataToSend = JSON.parse(JSON.stringify(offerData))
      
      // Ensure customerId is a valid number
      if (dataToSend.customerId === 0) {
        setError('A valid customer must be selected')
        setIsSubmitting(false)
        return
      }
      
      // Process the data to match the exact format of the working request
      const processServiceData = (service: Record<string, unknown>) => {
        if (!service) return null
        
        // Process date fields in the service
        Object.keys(service).forEach(key => {
          // Handle empty string dates
          if (typeof service[key] === 'string' && key.toLowerCase().includes('date') && service[key] === '') {
            service[key] = null
            return
          }
          
          // Format date fields to match the working example (with Z suffix)
          if (typeof service[key] === 'string' && key.toLowerCase().includes('date') && service[key]) {
            // Make sure the date string ends with Z for UTC timezone
            if (!service[key].toString().endsWith('Z')) {
              // Remove any existing timezone info and add Z
              const dateStr = service[key].toString().replace(/\.\d+Z?$/, '');
              service[key] = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
            }
          }
          
          // Ensure time fields are in the correct format (HH:MM:SS)
          if (typeof service[key] === 'string' && 
              (key.toLowerCase().includes('time') && !key.toLowerCase().includes('date'))) {
            const timeStr = service[key].toString();
            if (timeStr && !timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
              // Add seconds if missing
              if (timeStr.match(/^\d{2}:\d{2}$/)) {
                service[key] = `${timeStr}:00`;
              }
            }
          }
          
          // Ensure numeric fields are actual numbers
          if (key.toLowerCase().includes('cost') || 
              key.toLowerCase().includes('price') || 
              key.toLowerCase().includes('rate') || 
              key.toLowerCase().includes('hours') || 
              key.toLowerCase().includes('number')) {
            if (service[key] === '') {
              service[key] = null;
            } else if (service[key] !== null && typeof service[key] === 'string') {
              service[key] = parseFloat(service[key] as string) || 0;
            }
          }
        })
        
        // Ensure additionalCosts is always an array
        if (!service.additionalCosts) {
          service.additionalCosts = [];
        }
        
        return service
      }
      
      // Process all services
      if (dataToSend.moveService) dataToSend.moveService = processServiceData(dataToSend.moveService)
      if (dataToSend.cleaningService) dataToSend.cleaningService = processServiceData(dataToSend.cleaningService)
      if (dataToSend.packingService) dataToSend.packingService = processServiceData(dataToSend.packingService)
      if (dataToSend.unpackingService) dataToSend.unpackingService = processServiceData(dataToSend.unpackingService)
      if (dataToSend.disposalService) dataToSend.disposalService = processServiceData(dataToSend.disposalService)
      if (dataToSend.storageService) dataToSend.storageService = processServiceData(dataToSend.storageService)
      if (dataToSend.transportService) dataToSend.transportService = processServiceData(dataToSend.transportService)
      
      // Process packing materials to ensure numeric values
      if (dataToSend.packingMaterials && Array.isArray(dataToSend.packingMaterials)) {
        dataToSend.packingMaterials = dataToSend.packingMaterials.map((material: PackingMaterial) => ({
          ...material,
          quantity: typeof material.quantity === 'string' ? parseInt(material.quantity as string, 10) : material.quantity,
          unitPrice: typeof material.unitPrice === 'string' ? parseFloat(material.unitPrice as string) : material.unitPrice,
          totalPrice: typeof material.totalPrice === 'string' ? parseFloat(material.totalPrice as string) : material.totalPrice
        }));
      }

      console.log('Saving offer data:', {
        method: offerId ? 'PUT' : 'POST',
        data: dataToSend
      })
      
      // Log the actual JSON payload to help diagnose issues
      console.log('JSON payload:', JSON.stringify(dataToSend, null, 2))

      // Get the token
      const token = cookieUtils.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make direct API call with explicit headers
      try {
        const url = offerId 
          ? `https://nedx.premiumasp.net/api/Offers/${offerId}` 
          : 'https://nedx.premiumasp.net/api/Offers';
        
        const response = await fetch(url, {
          method: offerId ? 'PUT' : 'POST',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        // Success - refresh and close
        console.log('API call successful');
        router.refresh();
        onClose();
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // If the direct API call fails, try the form submission approach as fallback
        try {
          await handleSaveOfferWithForm(dataToSend);
        } catch (formError) {
          throw new Error(
            apiError instanceof Error 
              ? apiError.message 
              : 'Failed to save offer via API'
          );
        }
      }
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

  // If the above direct API call fails due to CORS, you can use this as a fallback
  const handleSaveOfferWithForm = async (dataToSend: OfferData) => {
    try {
      // Alternative approach using XMLHttpRequest which might handle CORS differently
      const token = cookieUtils.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = offerId 
          ? `https://nedx.premiumasp.net/api/Offers/${offerId}` 
          : 'https://nedx.premiumasp.net/api/Offers';
        
        xhr.open(offerId ? 'PUT' : 'POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Accept', '*/*');
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('XHR successful response:', xhr.responseText);
            router.refresh();
            onClose();
            resolve();
          } else {
            console.error('XHR error response:', {
              status: xhr.status,
              statusText: xhr.statusText,
              response: xhr.responseText
            });
            reject(new Error(`XHR request failed: ${xhr.status} ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR network error');
          reject(new Error('Network error occurred'));
        };
        
        console.log('Sending XHR request with payload:', JSON.stringify(dataToSend));
        xhr.send(JSON.stringify(dataToSend));
      });
    } catch (error) {
      console.error('Error with XHR submission:', error);
      throw error;
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
          {/* Add status selector for existing offers */}
          {offerId && (
            <div className="flex items-center gap-3">
              <Select
                value={offerData.status?.toString() || '0'}
                onValueChange={handleStatusUpdate}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue>
                    {STATUS_OPTIONS.find(opt => opt.value === offerData.status)?.label || 'Pending'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem 
                      key={value} 
                      value={value.toString()}
                      className={cn(
                        value === OfferStatus.Accepted && "text-green-600",
                        value === OfferStatus.Rejected && "text-red-600",
                        value === OfferStatus.Canceled && "text-gray-600",
                        value === OfferStatus.Sent && "text-blue-600",
                        value === OfferStatus.Pending && "text-yellow-600"
                      )}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Add email notification alert for edit mode */}
        {offerId && (
          <div className="px-6 pt-4 flex justify-center">
            <Alert className="border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm w-full">
                {t('emailNotificationAlert')}
              </AlertDescription>
            </Alert>
          </div>
        )}

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
                    {LANGUAGE_OPTIONS.map(({ code, label }) => (
                      <SelectItem key={code} value={code}>
                        {label}
                      </SelectItem>
                    ))}
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
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('customer')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder={t('searchCustomer')}
                    className="pr-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    </div>
                  )}
                </div>
                {customers.length > 0 && (
                  <div className=" z-10 mt-1 w-fit bg-white shadow-lg rounded-md border">
                    <ul className="py-1 max-h-60 overflow-auto">
                      {customers.map((customer) => (
                        <li
                          key={customer.id}
                          className={cn(
                            "px-3 py-2 cursor-pointer hover:bg-gray-100",
                            offerData.customerId === customer.id && "bg-red-50"
                          )}
                          onClick={() => {
                            setOfferData(prev => ({ ...prev, customerId: customer.id }))
                            setCustomerSearch(customer.fullName)
                            setCustomers([])
                          }}
                        >
                          <div className="flex items-center">
                            {offerData.customerId === customer.id && (
                              <CheckIcon className="h-4 w-4 mr-2 text-red-500" />
                            )}
                            <span>{customer.fullName}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
          initialData={selectedService && offerData[`${selectedService}Service`] ? offerData[`${selectedService}Service`] : undefined}
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