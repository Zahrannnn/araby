"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

// Service Types
export type AdditionalCost = {
  description: string;
  price: number;
}

export type MoveService = {
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

export type CleaningService = {
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

export type PackingService = {
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

export type UnpackingService = {
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

export type DisposalService = {
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

export type StorageService = {
  rateCHFPerM3PerMonth: number;
  volumeM3: number;
  cost: number;
  additionalCosts: AdditionalCost[];
}

export type TransportService = {
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
  additionalCosts: AdditionalCost[];
}

export type ServiceType =
  | { type: 'move'; data: MoveService }
  | { type: 'cleaning'; data: CleaningService }
  | { type: 'packing'; data: PackingService }
  | { type: 'unpacking'; data: UnpackingService }
  | { type: 'disposal'; data: DisposalService }
  | { type: 'storage'; data: StorageService }
  | { type: 'transport'; data: TransportService };

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType['type'];
  initialData?: ServiceType['data'] | null;
  onSave: (data: ServiceType['data']) => void;
}

// Default additional costs for different service types
const DEFAULT_MOVE_ADDITIONAL_COSTS: AdditionalCost[] = [
  { description: "Expenses (Per Diem)", price: 20.00 },
  { description: "Piano (Standard)", price: 250.00 },
  { description: "Piano (Large)", price: 350.00 },
  { description: "Furniture Lift (Included)", price: 0.00 },
  { description: "Furniture Lift (Standard)", price: 250.00 },
  { description: "Furniture Lift (Large)", price: 350.00 },
  { description: "Heavy Goods Surcharge (Standard)", price: 150.00 },
  { description: "Heavy Goods Surcharge (Large)", price: 250.00 },
  { description: "Safe (Standard)", price: 350.00 },
  { description: "Safe (Large)", price: 450.00 },
  { description: "Waterbed Service", price: 500.00 }
];

const DEFAULT_PACKING_ADDITIONAL_COSTS: AdditionalCost[] = [
  { description: "Expenses (Per Diem)", price: 20.00 },
  { description: "Packing Material Fee", price: 0.00 }
];

const DEFAULT_UNPACKING_ADDITIONAL_COSTS: AdditionalCost[] = [
  { description: "Expenses (Per Diem)", price: 20.00 },
  { description: "Packing Material Fee", price: 0.00 }
];

const DEFAULT_DISPOSAL_ADDITIONAL_COSTS: AdditionalCost[] = [
  { description: "Expenses (Per Diem)", price: 20.00 }
];

const getInitialServiceData = (type: ServiceType['type']): ServiceType['data'] => {
  switch (type) {
    case 'move':
      return {
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
        additionalCosts: DEFAULT_MOVE_ADDITIONAL_COSTS
      };
    case 'cleaning':
      return {
        cleaningType: '',
        fixedPriceRateCHF: 0,
        hourlyRateCHFPerHour: null,
        durationHours: null,
        numberOfStaff: 0,
        fillNailHoles: false,
        withHighPressureCleaner: false,
        cleaningDate: '',
        cleaningStartTime: '',
        deliveryDate: '',
        deliveryTime: '',
        discount: 0,
        additionalCosts: []
      };
    case 'packing':
      return {
        packingDate: '',
        packingStartTime: '',
        roundTripCostCHF: 0,
        durationHours: 0,
        selectedTariffDescription: '',
        numberOfStaff: 0,
        hourlyRateCHF: 0,
        packingMaterialsCost: 0,
        additionalCosts: DEFAULT_PACKING_ADDITIONAL_COSTS
      };
    case 'unpacking':
      return {
        unpackingDate: '',
        unpackingStartTime: '',
        roundTripCostCHF: 0,
        durationHours: 0,
        selectedTariffDescription: '',
        numberOfStaff: 0,
        hourlyRateCHF: 0,
        packingMaterialsCost: 0,
        additionalCosts: DEFAULT_UNPACKING_ADDITIONAL_COSTS
      };
    case 'disposal':
      return {
        volumeRateCHFPerM3: 0,
        flatRateDisposalCostCHF: 0,
        estimatedVolumeM3: 0,
        selectedEmployeePlanTariffDescription: null,
        numberOfStaff: null,
        numberOfDeliveryTrucks: null,
        hourlyRateCHF: null,
        durationHours: null,
        disposalDate: '',
        disposalStartTime: '',
        roundTripCostCHF: 0,
        discount: 0,
        furtherDiscounts: '',
        additionalCosts: DEFAULT_DISPOSAL_ADDITIONAL_COSTS
      };
    case 'storage':
      return {
        rateCHFPerM3PerMonth: 0,
        volumeM3: 0,
        cost: 0,
        additionalCosts: []
      };
    case 'transport':
      return {
        transportTypeText: '',
        fixedRateCHF: 0,
        selectedHourlyTariffDescription: null,
        numberOfStaff: 0,
        numberOfDeliveryTrucks: 0,
        hourlyRateCHF: null,
        durationHours: null,
        transportDate: '',
        transportStartTime: '',
        roundTripCostCHF: 0,
        cost: 0,
        discount: 0,
        additionalCosts: []
      };
  }
};

export function ServiceDetailsModal({ isOpen, onClose, serviceType, initialData, onSave }: ServiceDetailsModalProps) {
  const t = useTranslations('company.offers.serviceDetails')
  const [formData, setFormData] = useState<ServiceType['data']>(() => {
    if (initialData) {
      return initialData;
    }
    return getInitialServiceData(serviceType);
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serviceType) {
      // If initialData is provided, use it; otherwise, use the default data with predefined additional costs
      if (initialData && initialData !== null) {
        setFormData(initialData);
      } else {
        const defaultData = getInitialServiceData(serviceType);
        setFormData(defaultData);
      }
    }
  }, [initialData, serviceType]);

  const formatTimeForAPI = (time: string): string => {
    if (!time) return '';
    // Convert time to TimeSpan format ("HH:mm:ss")
    const [hours, minutes] = time.split(':').map(Number);
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:00`;
  };
  


  const formatTimeForDisplay = (time: string): string => {
    if (!time) return '';
    // If it's in HH:mm:ss format, return just HH:mm
    if (time.includes(':')) {
      return time.slice(0, 5);
    }
    return time;
  };

  const handleInputChange = (field: string, value: string | number | boolean | null | AdditionalCost[]) => {
    // Special handling for time fields
    if (
      field.toLowerCase().includes('time') && 
      typeof value === 'string' && 
      !field.includes('Date')
    ) {
      // Ensure time value is in correct format
      const formattedTime = formatTimeForAPI(value);
      value = formattedTime || value;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for the field when it's being changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Basic validation for required fields (adapt as needed for each service type)
    if (serviceType === 'move' && (formData as MoveService).moveDate === '') {
      newErrors.moveDate = 'Move date is required';
      isValid = false;
    }
    if (serviceType === 'move' && (formData as MoveService).moveInDate === '') {
      newErrors.moveInDate = 'Move-in date is required';
      isValid = false;
    }
    if ((formData as MoveService).roundTripCostCHF < 0) {
      newErrors.roundTripCostCHF = 'Round trip cost cannot be negative';
      isValid = false;
    }

    if ((formData as CleaningService).cleaningType === '' && serviceType === 'cleaning') {
      newErrors.cleaningType = 'Cleaning type is required';
      isValid = false;
    }
    if ((formData as CleaningService).fixedPriceRateCHF < 0 && serviceType === 'cleaning') {
      newErrors.fixedPriceRateCHF = 'Fixed price rate cannot be negative';
      isValid = false;
    }
    if ((formData as CleaningService).hourlyRateCHFPerHour !== null && (formData as CleaningService).hourlyRateCHFPerHour! < 0 && serviceType === 'cleaning') {
      newErrors.hourlyRateCHFPerHour = 'Hourly rate cannot be negative';
      isValid = false;
    }
    if ((formData as CleaningService).durationHours !== null && (formData as CleaningService).durationHours! < 0 && serviceType === 'cleaning') {
      newErrors.durationHours = 'Duration cannot be negative';
      isValid = false;
    }
    if ((formData as CleaningService).numberOfStaff < 0 && serviceType === 'cleaning') {
      newErrors.numberOfStaff = 'Number of staff cannot be negative';
      isValid = false;
    }

    if ((formData as PackingService).packingDate === '' && serviceType === 'packing') {
      newErrors.packingDate = 'Packing date is required';
      isValid = false;
    }
    if ((formData as PackingService).durationHours < 0 && serviceType === 'packing') {
      newErrors.durationHours = 'Duration cannot be negative';
      isValid = false;
    }

    if ((formData as DisposalService).disposalDate === '' && serviceType === 'disposal') {
      newErrors.disposalDate = 'Disposal date is required';
      isValid = false;
    }
    if ((formData as DisposalService).estimatedVolumeM3 < 0 && serviceType === 'disposal') {
      newErrors.estimatedVolumeM3 = 'Estimated volume cannot be negative';
      isValid = false;
    }

    if ((formData as StorageService).rateCHFPerM3PerMonth < 0 && serviceType === 'storage') {
      newErrors.rateCHFPerM3PerMonth = 'Rate cannot be negative';
      isValid = false;
    }
    if ((formData as StorageService).volumeM3 < 0 && serviceType === 'storage') {
      newErrors.volumeM3 = 'Volume cannot be negative';
      isValid = false;
    }

    if ((formData as TransportService).transportDate === '' && serviceType === 'transport') {
      newErrors.transportDate = 'Transport date is required';
      isValid = false;
    }
    if ((formData as TransportService).fixedRateCHF < 0 && serviceType === 'transport') {
      newErrors.fixedRateCHF = 'Fixed rate cannot be negative';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen || !serviceType) return null;

  const renderMoveServiceForm = (data: MoveService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('moveDate')}</label>
        <Input
          type="date"
          value={data.moveDate?.split('T')[0] || ''}
          onChange={(e) => handleInputChange('moveDate', `${e.target.value}T00:00:00`)}
          className={errors.moveDate ? 'border-red-500' : ''}
        />
        {errors.moveDate && <p className="text-red-500 text-sm mt-1">{errors.moveDate}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('moveInDate')}</label>
        <Input
          type="date"
          value={data.moveInDate?.split('T')[0] || ''}
          onChange={(e) => handleInputChange('moveInDate', `${e.target.value}T00:00:00`)}
          className={errors.moveInDate ? 'border-red-500' : ''}
        />
        {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('moveStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.moveStartTime)}
          onChange={(e) => handleInputChange('moveStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('roundTripCostCHF')}</label>
        <Input
          type="number"
          value={data.roundTripCostCHF}
          onChange={(e) => handleInputChange('roundTripCostCHF', parseFloat(e.target.value))}
          className={errors.roundTripCostCHF ? 'border-red-500' : ''}
        />
        {errors.roundTripCostCHF && <p className="text-red-500 text-sm mt-1">{errors.roundTripCostCHF}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectedTariffDescription')}</label>
        <Input
          value={data.selectedTariffDescription}
          onChange={(e) => handleInputChange('selectedTariffDescription', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input
          type="number"
          value={data.numberOfStaff}
          onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfDeliveryTrucks')}</label>
        <Input
          type="number"
          value={data.numberOfDeliveryTrucks}
          onChange={(e) => handleInputChange('numberOfDeliveryTrucks', parseInt(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHF')}</label>
        <Input
          type="number"
          value={data.hourlyRateCHF}
          onChange={(e) => handleInputChange('hourlyRateCHF', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input
          type="number"
          value={data.durationHours}
          onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('disassemblyAssemblyBy')}</label>
        <Input
          value={data.disassemblyAssemblyBy}
          onChange={(e) => handleInputChange('disassemblyAssemblyBy', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCleaningServiceForm = (data: CleaningService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('cleaningType')}</label>
        <Select
          value={data.cleaningType}
          onValueChange={(value) => handleInputChange('cleaningType', value)}
        >
          <SelectTrigger className={errors.cleaningType ? 'border-red-500' : ''}>
            <SelectValue placeholder={t('selectCleaningType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">{t('basicCleaning')}</SelectItem>
            <SelectItem value="deep">{t('deepCleaning')}</SelectItem>
            <SelectItem value="window">{t('windowCleaning')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.cleaningType && <p className="text-red-500 text-sm mt-1">{errors.cleaningType}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('fixedPriceRateCHF')}</label>
        <Input
          type="number"
          value={data.fixedPriceRateCHF}
          onChange={(e) => handleInputChange('fixedPriceRateCHF', parseFloat(e.target.value))}
          className={errors.fixedPriceRateCHF ? 'border-red-500' : ''}
        />
        {errors.fixedPriceRateCHF && <p className="text-red-500 text-sm mt-1">{errors.fixedPriceRateCHF}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHFPerHour')}</label>
        <Input
          type="number"
          value={data.hourlyRateCHFPerHour || ''}
          onChange={(e) => handleInputChange('hourlyRateCHFPerHour', parseFloat(e.target.value) || null)}
          className={errors.hourlyRateCHFPerHour ? 'border-red-500' : ''}
        />
        {errors.hourlyRateCHFPerHour && <p className="text-red-500 text-sm mt-1">{errors.hourlyRateCHFPerHour}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input
          type="number"
          value={data.durationHours || ''}
          onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value) || null)}
          className={errors.durationHours ? 'border-red-500' : ''}
        />
        {errors.durationHours && <p className="text-red-500 text-sm mt-1">{errors.durationHours}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input
          type="number"
          value={data.numberOfStaff}
          onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value))}
          className={errors.numberOfStaff ? 'border-red-500' : ''}
        />
        {errors.numberOfStaff && <p className="text-red-500 text-sm mt-1">{errors.numberOfStaff}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="fillNailHoles"
          checked={data.fillNailHoles}
          onCheckedChange={(checked) => handleInputChange('fillNailHoles', checked as boolean)}
        />
        <label htmlFor="fillNailHoles" className="text-sm font-medium text-gray-700">
          {t('fillNailHoles')}
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="withHighPressureCleaner"
          checked={data.withHighPressureCleaner}
          onCheckedChange={(checked) => handleInputChange('withHighPressureCleaner', checked as boolean)}
        />
        <label htmlFor="withHighPressureCleaner" className="text-sm font-medium text-gray-700">
          {t('withHighPressureCleaner')}
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('cleaningDate')}</label>
        <Input
          type="date"
          value={data.cleaningDate?.split('T')[0]}
          onChange={(e) => handleInputChange('cleaningDate', `${e.target.value}T00:00:00`)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('cleaningStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.cleaningStartTime)}
          onChange={(e) => handleInputChange('cleaningStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('deliveryDate')}</label>
        <Input
          type="date"
          value={data.deliveryDate?.split('T')[0]}
          onChange={(e) => handleInputChange('deliveryDate', `${e.target.value}T00:00:00`)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('deliveryTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.deliveryTime)}
          onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('discount')}</label>
        <Input
          type="number"
          value={data.discount}
          onChange={(e) => handleInputChange('discount', parseFloat(e.target.value))}
        />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPackingServiceForm = (data: PackingService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('packingDate')}</label>
        <Input type="date" value={data.packingDate?.split('T')[0] || ''} onChange={(e) => handleInputChange('packingDate', `${e.target.value}T00:00:00`)} className={errors.packingDate ? 'border-red-500' : ''} />
        {errors.packingDate && <p className="text-red-500 text-sm mt-1">{errors.packingDate}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('packingStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.packingStartTime)}
          onChange={(e) => handleInputChange('packingStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('roundTripCostCHF')}</label>
        <Input type="number" value={data.roundTripCostCHF} onChange={(e) => handleInputChange('roundTripCostCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input type="number" value={data.durationHours} onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value))} className={errors.durationHours ? 'border-red-500' : ''} />
        {errors.durationHours && <p className="text-red-500 text-sm mt-1">{errors.durationHours}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectedTariffDescription')}</label>
        <Input value={data.selectedTariffDescription} onChange={(e) => handleInputChange('selectedTariffDescription', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input type="number" value={data.numberOfStaff} onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHF')}</label>
        <Input type="number" value={data.hourlyRateCHF} onChange={(e) => handleInputChange('hourlyRateCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('packingMaterialsCost')}</label>
        <Input type="number" value={data.packingMaterialsCost} onChange={(e) => handleInputChange('packingMaterialsCost', parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUnpackingServiceForm = (data: UnpackingService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('unpackingDate')}</label>
        <Input type="date" value={data.unpackingDate?.split('T')[0] || ''} onChange={(e) => handleInputChange('unpackingDate', `${e.target.value}T00:00:00`)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('unpackingStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.unpackingStartTime)}
          onChange={(e) => handleInputChange('unpackingStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('roundTripCostCHF')}</label>
        <Input type="number" value={data.roundTripCostCHF} onChange={(e) => handleInputChange('roundTripCostCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input type="number" value={data.durationHours} onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectedTariffDescription')}</label>
        <Input value={data.selectedTariffDescription} onChange={(e) => handleInputChange('selectedTariffDescription', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input type="number" value={data.numberOfStaff} onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHF')}</label>
        <Input type="number" value={data.hourlyRateCHF} onChange={(e) => handleInputChange('hourlyRateCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('packingMaterialsCost')}</label>
        <Input type="number" value={data.packingMaterialsCost} onChange={(e) => handleInputChange('packingMaterialsCost', parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDisposalServiceForm = (data: DisposalService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volumeRateCHFPerM3')}</label>
        <Input type="number" value={data.volumeRateCHFPerM3} onChange={(e) => handleInputChange('volumeRateCHFPerM3', parseFloat(e.target.value))} className={errors.volumeRateCHFPerM3 ? 'border-red-500' : ''} />
        {errors.volumeRateCHFPerM3 && <p className="text-red-500 text-sm mt-1">{errors.volumeRateCHFPerM3}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('flatRateDisposalCostCHF')}</label>
        <Input type="number" value={data.flatRateDisposalCostCHF} onChange={(e) => handleInputChange('flatRateDisposalCostCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('estimatedVolumeM3')}</label>
        <Input type="number" value={data.estimatedVolumeM3} onChange={(e) => handleInputChange('estimatedVolumeM3', parseFloat(e.target.value))} className={errors.estimatedVolumeM3 ? 'border-red-500' : ''} />
        {errors.estimatedVolumeM3 && <p className="text-red-500 text-sm mt-1">{errors.estimatedVolumeM3}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectedEmployeePlanTariffDescription')}</label>
        <Input value={data.selectedEmployeePlanTariffDescription || ''} onChange={(e) => handleInputChange('selectedEmployeePlanTariffDescription', e.target.value || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input type="number" value={data.numberOfStaff || ''} onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfDeliveryTrucks')}</label>
        <Input type="number" value={data.numberOfDeliveryTrucks || ''} onChange={(e) => handleInputChange('numberOfDeliveryTrucks', parseInt(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHF')}</label>
        <Input type="number" value={data.hourlyRateCHF || ''} onChange={(e) => handleInputChange('hourlyRateCHF', parseFloat(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input type="number" value={data.durationHours || ''} onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('disposalDate')}</label>
        <Input type="date" value={data.disposalDate?.split('T')[0] || ''} onChange={(e) => handleInputChange('disposalDate', `${e.target.value}T00:00:00`)} className={errors.disposalDate ? 'border-red-500' : ''} />
        {errors.disposalDate && <p className="text-red-500 text-sm mt-1">{errors.disposalDate}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('disposalStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.disposalStartTime)}
          onChange={(e) => handleInputChange('disposalStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('roundTripCostCHF')}</label>
        <Input type="number" value={data.roundTripCostCHF} onChange={(e) => handleInputChange('roundTripCostCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('discount')}</label>
        <Input type="number" value={data.discount} onChange={(e) => handleInputChange('discount', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('furtherDiscounts')}</label>
        <Input value={data.furtherDiscounts} onChange={(e) => handleInputChange('furtherDiscounts', e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStorageServiceForm = (data: StorageService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('rateCHFPerM3PerMonth')}</label>
        <Input type="number" value={data.rateCHFPerM3PerMonth} onChange={(e) => handleInputChange('rateCHFPerM3PerMonth', parseFloat(e.target.value))} className={errors.rateCHFPerM3PerMonth ? 'border-red-500' : ''} />
        {errors.rateCHFPerM3PerMonth && <p className="text-red-500 text-sm mt-1">{errors.rateCHFPerM3PerMonth}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('volumeM3')}</label>
        <Input type="number" value={data.volumeM3} onChange={(e) => handleInputChange('volumeM3', parseFloat(e.target.value))} className={errors.volumeM3 ? 'border-red-500' : ''} />
        {errors.volumeM3 && <p className="text-red-500 text-sm mt-1">{errors.volumeM3}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('cost')}</label>
        <Input type="number" value={data.cost} onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTransportServiceForm = (data: TransportService) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('transportTypeText')}</label>
        <Input value={data.transportTypeText} onChange={(e) => handleInputChange('transportTypeText', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('fixedRateCHF')}</label>
        <Input type="number" value={data.fixedRateCHF} onChange={(e) => handleInputChange('fixedRateCHF', parseFloat(e.target.value))} className={errors.fixedRateCHF ? 'border-red-500' : ''} />
        {errors.fixedRateCHF && <p className="text-red-500 text-sm mt-1">{errors.fixedRateCHF}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectedHourlyTariffDescription')}</label>
        <Input value={data.selectedHourlyTariffDescription || ''} onChange={(e) => handleInputChange('selectedHourlyTariffDescription', e.target.value || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfStaff')}</label>
        <Input type="number" value={data.numberOfStaff} onChange={(e) => handleInputChange('numberOfStaff', parseInt(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfDeliveryTrucks')}</label>
        <Input type="number" value={data.numberOfDeliveryTrucks} onChange={(e) => handleInputChange('numberOfDeliveryTrucks', parseInt(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('hourlyRateCHF')}</label>
        <Input type="number" value={data.hourlyRateCHF || ''} onChange={(e) => handleInputChange('hourlyRateCHF', parseFloat(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('durationHours')}</label>
        <Input type="number" value={data.durationHours || ''} onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value) || null)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('transportDate')}</label>
        <Input type="date" value={data.transportDate?.split('T')[0] || ''} onChange={(e) => handleInputChange('transportDate', `${e.target.value}T00:00:00`)} className={errors.transportDate ? 'border-red-500' : ''} />
        {errors.transportDate && <p className="text-red-500 text-sm mt-1">{errors.transportDate}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('transportStartTime')}</label>
        <Input
          type="time"
          value={formatTimeForDisplay(data.transportStartTime)}
          onChange={(e) => handleInputChange('transportStartTime', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('roundTripCostCHF')}</label>
        <Input type="number" value={data.roundTripCostCHF} onChange={(e) => handleInputChange('roundTripCostCHF', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('cost')}</label>
        <Input type="number" value={data.cost} onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('discount')}</label>
        <Input type="number" value={data.discount} onChange={(e) => handleInputChange('discount', parseFloat(e.target.value))} />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('additionalCosts')}</label>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              const newCosts = [...(data.additionalCosts || []), { description: '', price: 0 }]
              handleInputChange('additionalCosts', newCosts)
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('addCost')}
          </Button>
        </div>
        <div className="space-y-4">
          {(data.additionalCosts || []).map((cost, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('costDescription')}
                  value={cost.description}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, description: e.target.value }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder={t('price')}
                  value={cost.price}
                  onChange={(e) => {
                    const newCosts = [...(data.additionalCosts || [])]
                    newCosts[index] = { ...cost, price: parseFloat(e.target.value) }
                    handleInputChange('additionalCosts', newCosts)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newCosts = [...(data.additionalCosts || [])]
                  newCosts.splice(index, 1)
                  handleInputChange('additionalCosts', newCosts)
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderServiceForm = () => {
    if (!formData) return null;

    switch (serviceType) {
      case 'move':
        return renderMoveServiceForm(formData as MoveService);
      case 'cleaning':
        return renderCleaningServiceForm(formData as CleaningService);
      case 'packing':
        return renderPackingServiceForm(formData as PackingService);
      case 'unpacking':
        return renderUnpackingServiceForm(formData as UnpackingService);
      case 'disposal':
        return renderDisposalServiceForm(formData as DisposalService);
      case 'storage':
        return renderStorageServiceForm(formData as StorageService);
      case 'transport':
        return renderTransportServiceForm(formData as TransportService);
      default:
        return <div>Service type not supported</div>;
    }
  };

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
              {t(`${serviceType}Service`)}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderServiceForm()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  )
}