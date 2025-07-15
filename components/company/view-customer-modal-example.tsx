"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ViewCustomerModal } from './view-customer-modal'
import type { Customer } from '@/lib/api'

// Example component showing how to use the ViewCustomerModal
export function ViewCustomerModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Sample customer data matching the API response structure
  const sampleCustomer: Customer = {
    customerId: 1,
    fullName: "Abdullah Mohamed",
    email: "abdullah@email.com",
    phoneNumber: "+41 44 123 4567",
    address: "Musterstraße 123",
    city: "Zürich",
    zipCode: "8001",
    country: "Schweiz",
    createdAt: "2023-03-15T00:00:00Z",
    notes: "VIP Kunde",
    offerCount: 5,
    taskCount: 3,
    totalProfit: 12500
  }

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer)
    // Add your edit logic here
    setIsModalOpen(false)
  }

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer)
    // Add your delete logic here
    setIsModalOpen(false)
  }

  return (
    <div className="p-4">
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        View Customer Details
      </Button>

      <ViewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        customer={sampleCustomer}
      />
    </div>
  )
} 