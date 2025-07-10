"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Type definitions based on the actual API response structure
interface Company {
  companyId: number;
  companyName: string;
  status: string; // "مفعلة" for active, other values for inactive
  createdAt: string;
  managerEmail: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
}

interface CompaniesResponse {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  items: Company[];
}

const Page = () => {
  const t = useTranslations()
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Get token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const token = getCookie("auth-token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Build query parameters
      const params = new URLSearchParams({
        pageIndex: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      if (activeFilter !== null) {
        params.append('isActive', activeFilter.toString());
      }

      const response = await fetch(
        `https://crmproject.runasp.net/api/SuperAdmin/companies?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CompaniesResponse = await response.json();
      setCompanies(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(data.pageIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching companies data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, activeFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle search input - now only updates the immediate searchTerm state
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE");
  };

  // Check if company is active based on status
  const isCompanyActive = (status: string) => {
    return status === "مفعلة";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('superAdmin.companies.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center bg-white p-6 rounded-lg shadow-sm border max-w-md w-full">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('superAdmin.companies.errorLoading')}</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {t('superAdmin.companies.retry')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 border-l-4 border-red-500 pl-4">
              {t('superAdmin.companies.title')}
            </h1>
            <p className="text-gray-600 pl-4">
              {t('superAdmin.companies.subtitle')} ({t('superAdmin.companies.totalCompanies', { count: totalCount })})
            </p>
          </div>
          <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md">
            {t('superAdmin.companies.addCompany')}
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <Input
                type="text"
                placeholder={t('superAdmin.companies.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeFilter === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter(null)}
              >
                {t('superAdmin.companies.all')}
              </Button>
              <Button 
                variant={activeFilter === true ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter(true)}
              >
                {t('superAdmin.companies.active')}
              </Button>
              <Button 
                variant={activeFilter === false ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter(false)}
              >
                {t('superAdmin.companies.inactive')}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.companyName')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.companyStatus')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.creationDate')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.managerEmail')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.phoneNumber')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.address')}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">
                    {t('superAdmin.companies.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <tr key={company.companyId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{company.companyName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isCompanyActive(company.status)
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            isCompanyActive(company.status) ? "bg-green-500" : "bg-gray-500"
                          }`}></div>
                          {isCompanyActive(company.status) ? t('superAdmin.companies.active') : t('superAdmin.companies.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(company.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{company.managerEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{company.phoneNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{company.address}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600">
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
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {debouncedSearchTerm ? t('superAdmin.companies.noCompaniesFound') : t('superAdmin.companies.noCompanies')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
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
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">{t('superAdmin.companies.perPage')}</span>
          </div>
        </div>

        {/* Total count info */}
        {companies.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {t('superAdmin.companies.showingResults', {
                from: ((currentPage - 1) * pageSize) + 1,
                to: Math.min(currentPage * pageSize, totalCount),
                total: totalCount
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page