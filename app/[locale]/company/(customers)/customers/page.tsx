"use client"

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCustomers } from '@/hooks/useCustomers'
import { useDebounce } from '@/app/hooks/useDebounce'
import { AddCustomerModal } from '@/components/company/add-customer-modal'
import { ViewCustomerModal } from '@/components/company/view-customer-modal'
import { UpdateCustomerModal } from '@/components/company/update-customer-modal'
import { DeleteCustomerModal } from '@/components/company/delete-customer-modal'
import type { Customer } from '@/lib/api'

const Page = () => {
  const t = useTranslations('company.customers')
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Create query parameters object
  const queryParams = useMemo(() => ({
    pageIndex: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearchTerm.trim() || undefined,
  }), [currentPage, itemsPerPage, debouncedSearchTerm])

  // Use React Query hook for fetching customers
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useCustomers(queryParams)

  const customers = data?.customers || []
  const totalCount = data?.totalCount || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Reset to first page when search term changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, searchTerm])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Handle view customer
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  // Handle edit customer from view modal
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsUpdateModalOpen(true)
    setIsViewModalOpen(false)
  }

  // Handle delete customer (can be called from table or view modal)
  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
    setIsViewModalOpen(false) // Close view modal if open
  }

  const handleDeleteSuccess = () => {
    console.log('Customer deleted successfully')
    setSelectedCustomer(null)
    // The useDeleteCustomer hook will automatically refetch the data
  }

  const handleUpdateSuccess = () => {
    console.log('Customer updated successfully')
    setSelectedCustomer(null)
    // The useUpdateCustomer hook will automatically refetch the data
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleRetry = () => {
    refetch()
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 border-l-4 border-red-500 pl-4">
              {t('title')}
            </h1>
            <p className="text-gray-600 pl-4">
              {t('subtitle')}
            </p>
          </div>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="h-5 w-5" />
            {t('addCustomer')}
          </Button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">{t('errorLoading')}</h3>
                  <p className="text-red-600 text-sm mt-1">{error instanceof Error ? error.message : String(error)}</p>
                </div>
              </div>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {t('retry')}
              </Button>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('customerName')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('email')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('phoneNumber')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('city')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('registrationDate')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
                        <span className="text-gray-500">{t('loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((customer: Customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {customer.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customer.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Edit Button - Blue pencil icon */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          {/* View Button - Blue eye icon */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                          {/* Delete Button - Red trash icon */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? t('noCustomersFound') : t('noCustomers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        {!isLoading && customers.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" className="h-8 px-3 bg-red-500 text-white border-red-500">
                {currentPage}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {t('showingResults', {
                  from: (currentPage - 1) * itemsPerPage + 1,
                  to: Math.min(currentPage * itemsPerPage, totalCount),
                  total: totalCount
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={itemsPerPage} 
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
                aria-label="Items per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">{t('perPage')}</span>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            // Optional: You can add a success notification here
            console.log('Customer added successfully');
          }}
        />

        {/* View Customer Modal */}
        <ViewCustomerModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          customer={selectedCustomer}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />

        {/* Update Customer Modal */}
        <UpdateCustomerModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          customer={selectedCustomer}
          onSuccess={handleUpdateSuccess}
        />

        {/* Delete Customer Modal */}
        <DeleteCustomerModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
          customer={selectedCustomer}
        />
      </div>
    </div>
  )
}

export default Page