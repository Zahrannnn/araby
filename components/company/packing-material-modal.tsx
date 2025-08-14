"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

export interface PackingMaterial {
  description: string;
  rentOrBuy: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PackingMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: PackingMaterial) => void;
}

export function PackingMaterialModal({ isOpen, onClose, onSave }: PackingMaterialModalProps) {
  const t = useTranslations('company.offers.packingMaterial')
  const [material, setMaterial] = useState<PackingMaterial>({
    description: '',
    rentOrBuy: 'buy',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0
  })

  const handleChange = (field: keyof PackingMaterial, value: string | number) => {
    setMaterial(prev => {
      const updated = { ...prev, [field]: value }
    
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = updated.quantity * updated.unitPrice
      }
      return updated
    })
  }

  const handleSubmit = () => {
    onSave(material)
    setMaterial({
      description: '',
      rentOrBuy: 'buy',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
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
              {t('addMaterial')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <Input
              value={material.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('enterDescription')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('rentOrBuy')}
            </label>
            <Select
              value={material.rentOrBuy}
              onValueChange={(value) => handleChange('rentOrBuy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">{t('rent')}</SelectItem>
                <SelectItem value="buy">{t('buy')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('unitPrice')}
              </label>
              <Input
                type="number"
                value={material.unitPrice}
                onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('totalPrice')}
            </label>
            <Input
              type="number"
              value={material.totalPrice}
              disabled
            />
          </div>
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