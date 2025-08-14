/**
 * Offer types and interfaces
 */
import type { PaginatedResponse } from './common';

/**
 * Basic offer entity
 */
export interface Offer {
  offerId: number;
  offerNumber: string;
  issueDate: string;
  serviceTypeOverall: string;
  totalAmount: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Sent';
}

/**
 * Offer list response
 */
export interface OffersResponse extends PaginatedResponse<Offer> {}

/**
 * Offer location information
 */
export interface OfferLocation {
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

/**
 * Additional cost item
 */
export interface AdditionalCost {
  description: string;
  amount: number;
}

/**
 * Service details for different service types
 */
export interface ServiceDetails {
  // Move service details
  moveDate?: string;
  moveInDate?: string | null;
  moveStartTime?: string;
  roundTripCostCHF?: number;
  selectedTariffDescription?: string;
  numberOfStaff?: number;
  numberOfDeliveryTrucks?: number;
  hourlyRateCHF?: number;
  durationHours?: number;
  disassemblyAssemblyBy?: string;
  
  // Cleaning service details
  cleaningType?: string;
  fixedPriceRateCHF?: number;
  hourlyRateCHFPerHour?: number | null;
  fillNailHoles?: boolean;
  withHighPressureCleaner?: boolean;
  cleaningDate?: string;
  cleaningStartTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  discount?: number;
  additionalCosts?: AdditionalCost[];
  
  // Packing service details
  packingDate?: string;
  packingStartTime?: string;
  packingMaterialsCost?: number;
  
  // Unpacking service details
  unpackingDate?: string;
  unpackingStartTime?: string;
  
  // Disposal service details
  disposalDate?: string;
  disposalStartTime?: string;
  volumeRateCHFPerM3?: number;
  flatRateDisposalCostCHF?: number;
  estimatedVolumeM3?: number;
  selectedEmployeePlanTariffDescription?: string | null;
  additionalCostsText?: string;
  furtherDiscounts?: string;
  
  // Storage service details
  rateCHFPerM3PerMonth?: number;
  volumeM3?: number;
  cost?: number;
  
  // Transport service details
  transportDate?: string;
  transportStartTime?: string;
  transportTypeText?: string;
  fixedRateCHF?: number;
  selectedHourlyTariffDescription?: string | null;
  concessionText?: string;
}

/**
 * Service line item
 */
export interface ServiceLineItem {
  serviceType: string;
  totalLinePrice: number;
  serviceDetails: ServiceDetails;
  additionalCosts: AdditionalCost[];
}

/**
 * Packing material item
 */
export interface PackingMaterial {
  description: string;
  rentOrBuy: 'Rent' | 'Buy';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Detailed offer information
 */
export interface OfferDetails {
  offerId: number;
  offerNumber: string;
  customerId: number;
  customerName: string;
  issueDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Sent';
  totalAmount: number;
  discountAmount: number;
  pdfUrl: string;
  googleCalendarEventId: string;
  notesInOffer: string;
  notesNotInOffer: string;
  locations: OfferLocation[];
  serviceLineItems: ServiceLineItem[];
  packingMaterials: PackingMaterial[];
  createdByName: string;
} 