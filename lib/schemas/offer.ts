import { z } from 'zod'

// Common service fields that appear in multiple services
const commonServiceFields = {
  startTime: z.string(),
  roundTripCostCHF: z.number().min(0),
  numberOfStaff: z.number().min(0),
  hourlyRateCHF: z.number().min(0),
  durationHours: z.number().min(0),
}

export const offerSchema = z.object({
  // Basic Settings
  customerId: z.number(),
  viewAppointmentState: z.string(),
  notesInOffer: z.string().optional(),
  notesNotInOffer: z.string().optional(),
  costsIncludeVAT: z.boolean(),
  costsExcludeVAT: z.boolean(),
  vatFree: z.boolean(),
  contactPersonInternalUserId: z.number().optional(),
  contactPersonFreeText: z.string().optional(),
  emailToCustomer: z.boolean(),
  languageCode: z.string(),

  // Locations
  locations: z.array(z.object({
    locationType: z.string(),
    addressIndex: z.number(),
    street: z.string(),
    zipCode: z.string(),
    city: z.string(),
    countryCode: z.string(),
    buildingType: z.string(),
    floor: z.string(),
    hasLift: z.boolean()
  })),

  // Packing Materials
  packingMaterials: z.array(z.object({
    description: z.string(),
    rentOrBuy: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0)
  })),

  // Move Service
  moveService: z.object({
    moveDate: z.string(),
    moveInDate: z.string(),
    moveStartTime: z.string(),
    roundTripCostCHF: z.number().min(0),
    selectedTariffDescription: z.string(),
    numberOfStaff: z.number().min(0),
    numberOfDeliveryTrucks: z.number().min(0),
    hourlyRateCHF: z.number().min(0),
    durationHours: z.number().min(0),
    disassemblyAssemblyBy: z.string()
  }).optional(),

  // Cleaning Service
  cleaningService: z.object({
    cleaningType: z.string(),
    fixedPriceRateCHF: z.number().min(0),
    hourlyRateCHFPerHour: z.number().min(0),
    durationHours: z.number().min(0),
    numberOfStaff: z.number().min(0),
    fillNailHoles: z.boolean(),
    withHighPressureCleaner: z.boolean(),
    cleaningDate: z.string(),
    cleaningStartTime: z.string(),
    deliveryDate: z.string(),
    deliveryTime: z.string(),
    discount: z.number().min(0),
    additionalCosts: z.array(z.object({
      description: z.string(),
      price: z.number().min(0)
    }))
  }).optional(),

  // Packing Service
  packingService: z.object({
    packingDate: z.string(),
    packingStartTime: z.string(),
    roundTripCostCHF: z.number().min(0),
    durationHours: z.number().min(0),
    selectedTariffDescription: z.string(),
    numberOfStaff: z.number().min(0),
    hourlyRateCHF: z.number().min(0),
    packingMaterialsCost: z.number().min(0)
  }).optional(),

  // Unpacking Service
  unpackingService: z.object({
    unpackingDate: z.string(),
    unpackingStartTime: z.string(),
    roundTripCostCHF: z.number().min(0),
    durationHours: z.number().min(0),
    selectedTariffDescription: z.string(),
    numberOfStaff: z.number().min(0),
    hourlyRateCHF: z.number().min(0),
    packingMaterialsCost: z.number().min(0)
  }).optional(),

  // Disposal Service
  disposalService: z.object({
    volumeRateCHFPerM3: z.number().min(0),
    flatRateDisposalCostCHF: z.number().min(0),
    estimatedVolumeM3: z.number().min(0),
    selectedEmployeePlanTariffDescription: z.string(),
    numberOfStaff: z.number().min(0),
    numberOfDeliveryTrucks: z.number().min(0),
    hourlyRateCHF: z.number().min(0),
    durationHours: z.number().min(0),
    disposalDate: z.string(),
    disposalStartTime: z.string(),
    roundTripCostCHF: z.number().min(0),
    additionalCostsText: z.string(),
    discount: z.number().min(0),
    furtherDiscounts: z.string()
  }).optional(),

  // Storage Service
  storageService: z.object({
    rateCHFPerM3PerMonth: z.number().min(0),
    volumeM3: z.number().min(0),
    additionalCostsText: z.string(),
    furtherDiscounts: z.string(),
    cost: z.number().min(0)
  }).optional(),

  // Transport Service
  transportService: z.object({
    transportTypeText: z.string(),
    fixedRateCHF: z.number().min(0),
    selectedHourlyTariffDescription: z.string(),
    numberOfStaff: z.number().min(0),
    numberOfDeliveryTrucks: z.number().min(0),
    hourlyRateCHF: z.number().min(0),
    durationHours: z.number().min(0),
    transportDate: z.string(),
    transportStartTime: z.string(),
    roundTripCostCHF: z.number().min(0),
    additionalCostsText: z.string(),
    cost: z.number().min(0),
    discount: z.number().min(0),
    concessionText: z.string(),
    furtherDiscounts: z.string()
  }).optional(),
})

export type OfferFormData = z.infer<typeof offerSchema> 