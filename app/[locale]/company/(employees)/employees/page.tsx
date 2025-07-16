"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslations } from 'next-intl'
import { ViewEmployeeModal } from '@/components/company/view-employee-modal'
import { DeleteEmployeeModal } from '@/components/company/delete-employee-modal'
import { AddEmployeeModal } from '@/components/company/add-employee-modal'
import { UpdateEmployeeModal } from '@/components/company/update-employee-modal'
import type { Employee } from '@/lib/api'

const Page = () => {
  const t = useTranslations('company.employees')
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [employeeToUpdate, setEmployeeToUpdate] = useState<Employee | null>(null)

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Create query parameters object
  const queryParams = useMemo(() => ({
    pageIndex: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearchTerm.trim() || undefined,
  }), [currentPage, itemsPerPage, debouncedSearchTerm])

  // Use React Query hook for fetching employees
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useEmployees(queryParams)

  // Use delete employee mutation
  const deleteEmployee = useDeleteEmployee()

  const employees = data?.employees || []
  const totalCount = data?.totalCount || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle view employee
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewModalOpen(true)
  }

  // Handle edit employee
  const handleEditEmployee = (employee: Employee) => {
    // Split the full name into first and last name if they're not already present
    const employeeData = {
      ...employee,
      firstName: employee.firstName || employee.fullName.split(' ')[0],
      lastName: employee.lastName || employee.fullName.split(' ').slice(1).join(' '),
    }
    setEmployeeToUpdate(employeeData)
    setIsUpdateModalOpen(true)
  }

  // Handle delete employee
  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return

    try {
      setIsDeleting(true)
      await deleteEmployee.mutateAsync(employeeToDelete.id)
      
      // Close modal and reset state
      setIsDeleteModalOpen(false)
      setEmployeeToDelete(null)
      
    } catch (error) {
      console.error('Error deleting employee:', error)
      // Show error in the UI
      alert(t('deleteError.description'))
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('active')}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t('deactivated')}
        </span>
      )
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">
                {t('errorLoading')}
              </div>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : t('errorUnknown')}
              </p>
              <Button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-600 text-white">
                {t('retry')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-red-500 pl-4">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1 pl-4">
                {t('subtitle')}
              </p>
            </div>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              {t('addEmployee')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {employees.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-lg mb-2">
                {t('noEmployeesFound')}
              </div>
              <p className="text-gray-400">
                {searchTerm.trim() 
                  ? t('noEmployeesForSearch')
                  : t('noEmployees')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('employeeName')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('username')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('creationDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('city')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee: Employee, index: number) => (
                      <tr key={employee.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-red-600">
                                  {employee.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.fullName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(employee.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewEmployee(employee)}
                              className="p-1 h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              aria-label={t('viewEmployee')}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="p-1 h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                              aria-label={t('editEmployee')}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee)}
                              className="p-1 h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                              aria-label={t('deleteEmployee')}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                      {t('showingResults', {
                        from: ((currentPage - 1) * itemsPerPage) + 1,
                        to: Math.min(currentPage * itemsPerPage, totalCount),
                        total: totalCount
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm"
                    >
                      {t('previous')}
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : 
                                       currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                       currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0 text-sm"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm"
                    >
                      {t('next')}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label={t('perPage')}
                      title={t('perPage')}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">{t('perPage')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Employee Modal */}
      <ViewEmployeeModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEmployee(null)
        }}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEmployeeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setEmployeeToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        employee={employeeToDelete}
        isDeleting={isDeleting}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          refetch()
        }}
      />

      {/* Update Employee Modal */}
      <UpdateEmployeeModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setEmployeeToUpdate(null)
        }}
        onSuccess={() => {
          setIsUpdateModalOpen(false)
          setEmployeeToUpdate(null)
          refetch()
        }}
        employee={employeeToUpdate}
      />
    </div>
  )
}

export default Page
