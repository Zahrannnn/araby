/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerSchema, type OfferFormData } from '@/lib/schemas/offer'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

const defaultValues: OfferFormData = {
  customerId: 0,
  viewAppointmentState: '',
  notesInOffer: '',
  notesNotInOffer: '',
  costsIncludeVAT: false,
  costsExcludeVAT: false,
  vatFree: false,
  contactPersonInternalUserId: undefined,
  contactPersonFreeText: '',
  emailToCustomer: false,
  languageCode: 'de',
  locations: [],
  packingMaterials: [],
}

export function useOfferForm(offerId?: number) {
  const queryClient = useQueryClient()
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues,
  })

  const { mutate: createOffer, isPending: isCreating } = useMutation({
    mutationFn: (data: OfferFormData) => apiClient.post('/Offers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })

  const { mutate: updateOffer, isPending: isUpdating } = useMutation({
    mutationFn: (data: OfferFormData) => 
      apiClient.put(`/Offers/${offerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })

  const onSubmit = (data: OfferFormData) => {
    if (offerId) {
      updateOffer(data)
    } else {
      createOffer(data)
    }
  }

  const addLocation = () => {
    const currentLocations = form.getValues('locations')
    form.setValue('locations', [
      ...currentLocations,
      {
        locationType: '',
        addressIndex: currentLocations.length + 1,
        street: '',
        zipCode: '',
        city: '',
        countryCode: '',
        buildingType: '',
        floor: '',
        hasLift: false,
      },
    ])
  }

  const removeLocation = (index: number) => {
    const currentLocations = form.getValues('locations')
    form.setValue(
      'locations',
      currentLocations.filter((_, i) => i !== index)
    )
  }

  const addPackingMaterial = () => {
    const currentMaterials = form.getValues('packingMaterials')
    form.setValue('packingMaterials', [
      ...currentMaterials,
      {
        description: '',
        rentOrBuy: 'buy',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      },
    ])
  }

  const removePackingMaterial = (index: number) => {
    const currentMaterials = form.getValues('packingMaterials')
    form.setValue(
      'packingMaterials',
      currentMaterials.filter((_, i) => i !== index)
    )
  }

  const toggleService = (serviceType: string) => {
    if (selectedServices.includes(serviceType)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceType))
      // Clear service data
      form.setValue(`${serviceType}Service` as any, undefined)
    } else {
      setSelectedServices([...selectedServices, serviceType])
      // Initialize service data with defaults based on type
      switch (serviceType) {
        case 'move':
          form.setValue('moveService', {
            moveDate: '',
            moveInDate: '',
            moveStartTime: '',
            roundTripCostCHF: 0,
            selectedTariffDescription: '',
            numberOfStaff: 0,
            numberOfDeliveryTrucks: 0,
            hourlyRateCHF: 0,
            durationHours: 0,
            disassemblyAssemblyBy: '',
          })
          break
        case 'cleaning':
          form.setValue('cleaningService', {
            cleaningType: '',
            fixedPriceRateCHF: 0,
            hourlyRateCHFPerHour: 0,
            durationHours: 0,
            numberOfStaff: 0,
            fillNailHoles: false,
            withHighPressureCleaner: false,
            cleaningDate: '',
            cleaningStartTime: '',
            deliveryDate: '',
            deliveryTime: '',
            discount: 0,
            additionalCosts: [],
          })
          break
        // Add cases for other services...
      }
    }
  }

  return {
    form,
    selectedServices,
    isSubmitting: isCreating || isUpdating,
    onSubmit: form.handleSubmit(onSubmit),
    addLocation,
    removeLocation,
    addPackingMaterial,
    removePackingMaterial,
    toggleService,
  }
} 