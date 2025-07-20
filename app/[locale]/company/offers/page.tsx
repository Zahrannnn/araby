"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, PencilLine } from 'lucide-react'
import { format } from 'date-fns'
import { useDebounce } from '@/app/hooks/useDebounce'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { ViewOfferModal } from '@/components/company/view-offer-modal'
import { EditOfferModal } from '@/components/company/edit-offer-modal'

interface Offer {
  offerId: number
  offerNumber: string
  clientName: string
  issueDate: string
  status: string
  totalAmount: number
  numberOfServices: number
}

interface OffersResponse {
  pageIndex: number
  totalPages: number
  totalCount: number
  items: Offer[]
}

export default function OffersPage() {
  const t = useTranslations('company.offers')
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editOfferId, setEditOfferId] = useState<number | undefined>(undefined)
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch offers data
  const { data, isLoading, error } = useQuery<OffersResponse>({
    queryKey: ['offers', currentPage, pageSize, debouncedSearchTerm, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          pageIndex: currentPage.toString(),
          pageSize: pageSize.toString()
        })

        if (debouncedSearchTerm) {
          params.append('searchWord', debouncedSearchTerm)
        }
        if (status && status !== 'all') {
          params.append('status', status)
        }

        console.log('Fetching offers:', `/api/Offers?${params.toString()}`)
        const response = await apiClient.get<OffersResponse>(`/Offers?${params.toString()}`)
        console.log('API Response:', response.data)
        return response.data
      } catch (err) {
        console.error('API Error:', err)
        throw err
      }
    }
  })

  // Log state changes
  console.log('Current State:', {
    currentPage,
    pageSize,
    searchTerm: debouncedSearchTerm,
    status,
    isLoading,
    error,
    data
  })

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle view offer click
  const handleViewOffer = (offerId: number) => {
    setSelectedOfferId(offerId)
    setIsOfferModalOpen(true)
  }

  // Handle edit offer click
  const handleEditOffer = (offerId: number) => {
    setEditOfferId(offerId)
    setIsEditModalOpen(true)
  }

  // Handle create new offer click
  const handleCreateOffer = () => {
    setEditOfferId(undefined)
    setIsEditModalOpen(true)
  }

  // Handle modal close and data refetch
  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditOfferId(undefined)
    // Invalidate the offers query to refetch the latest data
    queryClient.invalidateQueries({ queryKey: ['offers'] })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Actions Row */}
      <div className="flex justify-between items-center">
        <Input 
          placeholder={t('searchPlaceholder')}
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="destructive" onClick={handleCreateOffer}>
          {t('createNew')}
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex justify-end">
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="Accepted">{t('statusAccepted')}</SelectItem>
            <SelectItem value="Pending">{t('statusPending')}</SelectItem>
            <SelectItem value="Rejected">{t('statusRejected')}</SelectItem>
            <SelectItem value="Sent">{t('statusSent')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('table.offerNumber')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('table.customerName')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('table.status')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('table.issueDate')}</th>
                <th className="text-right text-sm font-medium text-gray-500 px-6 py-4">{t('table.amount')}</th>
                <th className="text-center text-sm font-medium text-gray-500 px-6 py-4">{t('table.services')}</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
                      <span className="text-gray-500">{t('loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                    {error instanceof Error ? error.message : t('error')}
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {t('noOffers')}
                  </td>
                </tr>
              ) : (
                data.items.map((offer) => (
                  <tr key={offer.offerId} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{offer.offerNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{offer.clientName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {t(`status${offer.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {format(new Date(offer.issueDate), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      CHF {offer.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {offer.numberOfServices}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          className="text-gray-400 hover:text-gray-500"
                          aria-label={t('actions.view')}
                          onClick={() => handleViewOffer(offer.offerId)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-500"
                          aria-label={t('actions.edit')}
                          onClick={() => handleEditOffer(offer.offerId)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <div className="flex items-center justify-between px-6 py-4">
         
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              aria-label={t('pagination.previous')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              className="min-w-[2.5rem]"
            >
              {currentPage}
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= (data?.totalPages || 1)}
              onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
              aria-label={t('pagination.next')}
            >
              →
            </Button>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 /Page</SelectItem>
                <SelectItem value="20">20 /Page</SelectItem>
                <SelectItem value="50">50 /Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* View Offer Modal */}
      <ViewOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false)
          setSelectedOfferId(null)
        }}
        offerId={selectedOfferId}
      />

      {/* Edit/Create Offer Modal */}
      <EditOfferModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        offerId={editOfferId}
      />
    </div>
  )
}