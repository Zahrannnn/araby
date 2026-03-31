'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { DollarSign, Users, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useDashboard } from '@/hooks/useDashboard'
import Image from 'next/image'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Page = () => {
  const t = useTranslations('companyDashboard')
  
  // Use React Query hook for dashboard data
  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch: fetchDashboardData,
  } = useDashboard()

  // Generate chart data from API response
  const revenueChartData = dashboardData ? {
    labels: dashboardData.monthlyFinanceChart.map(item => item.month),
    datasets: [
      {
        label: 'Einnahmen',
        data: dashboardData.monthlyFinanceChart.map(item => item.income),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
      {
        label: 'Ausgaben',
        data: dashboardData.monthlyFinanceChart.map(item => item.expenses),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Gewinn',
        data: dashboardData.monthlyFinanceChart.map(item => item.profit),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  } : {
    labels: [],
    datasets: [],
  }

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Generate service data from API response
  const serviceData = dashboardData ? dashboardData.revenueByService.map(service => {
    const maxRevenue = Math.max(...dashboardData.revenueByService.map(s => s.revenue))
    return {
      name: service.serviceType,
      amount: service.revenue,
      percentage: maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0
    }
  }) : []

  // Tasks doughnut chart data from API
  const tasksChartData = dashboardData ? {
    labels: [t('tasksChart.acceptedOffers'), t('tasksChart.pendingOffers'), t('tasksChart.rejectedOffers')],
    datasets: [
      {
        data: [
          dashboardData.offerStatusChart.accepted,
          dashboardData.offerStatusChart.pending,
          dashboardData.offerStatusChart.rejected
        ],
        backgroundColor: [
          '#ef4444', // Red
          '#fca5a5', // Light red/pink
          '#374151', // Dark gray
        ],
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  } : {
    labels: [],
    datasets: [],
  }

  const tasksChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center gap-3'>
            <Loader2 className='w-6 h-6 animate-spin text-red-600' />
            <span className='text-gray-600'>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='text-red-600 text-lg font-medium mb-2'>Error loading dashboard</div>
            <div className='text-gray-600 mb-4'>{error instanceof Error ? error.message : 'Failed to fetch dashboard data'}</div>
            <button 
              onClick={() => fetchDashboardData()}
              className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-gray-600'>No dashboard data available</div>
        </div>
      </div>
    )
  }

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `CHF ${Math.abs(amount).toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  // Calculate percentage change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        text: `${change.toFixed(1)}%`
      }
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        text: `${change.toFixed(1)}%`
      }
    }
    return {
      icon: TrendingUp,
      color: 'text-gray-600',
      text: '0%'
    }
  }

  const profitChange = getChangeIndicator(dashboardData.topCards.profitChangeFromLastMonth)

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <div>
           <div className='flex items-center gap-2'>
            <div className='w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center' >
           <Image src={`https://nedx.premiumasp.net/${dashboardData.companyLogoUrl}`} alt="logo" width={80} height={80} className='rounded-full' unoptimized />
           </div>
           <h1 className='text-2xl font-bold text-gray-900'>{t('title')}</h1>
           </div>
            <p className='text-sm text-gray-600'>{t('subtitle')}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-600'>{t('today')}</p>
            <p className='text-sm text-gray-900 font-medium'>{t('date')}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* Current Month Performance */}
        <div className='bg-white rounded-2xl p-6 border border-blue-200 shadow-sm'>
          <div className='flex items-start justify-between mb-6'>
            <div className='w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center'>
              <DollarSign className='text-red-600 w-7 h-7' />
            </div>
            <div className='flex items-center gap-1'>
              <profitChange.icon className={`w-4 h-4 ${profitChange.color}`} />
              <span className={`text-sm font-medium ${profitChange.color}`}>{profitChange.text}</span>
            </div>
          </div>
          
          <h3 className='text-gray-700 text-base font-medium mb-4'>{t('cards.currentMonth.title')}</h3>
          
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.currentMonth.monthlyIncome')}:</span>
              <span className='text-sm font-semibold text-red-600'>{formatCurrency(dashboardData.topCards.currentMonthIncome)}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.currentMonth.expenses')}:</span>
              <span className='text-sm font-semibold text-green-600'>{formatCurrency(dashboardData.topCards.totalExpenses)}</span>
            </div>
          </div>
          
          <div className='mt-6 pt-4 border-t border-gray-100'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>{t('cards.currentMonth.netProfit')}</span>
              <span className='text-lg font-bold text-red-600'>{formatCurrency(dashboardData.topCards.currentMonthProfit)}</span>
            </div>
            <p className='text-xs text-gray-500 mt-1'>{t('cards.currentMonth.profitChange')}</p>
          </div>
        </div>

        {/* Total Finance Performance */}
        <div className='bg-white rounded-2xl p-6 border border-blue-200 shadow-sm'>
          <div className='flex items-start justify-between mb-6'>
            <div className='w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center'>
              <TrendingUp className='text-blue-600 w-7 h-7' />
            </div>
          </div>
          
          <h3 className='text-gray-700 text-base font-medium mb-4'>{t('cards.totalFinance.title')}</h3>
          
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.totalFinance.totalIncome')}</span>
              <span className='text-sm font-semibold text-red-600'>{formatCurrency(dashboardData.topCards.totalIncome)}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.totalFinance.totalExpenses')}:</span>
              <span className='text-sm font-semibold text-red-600'>{formatCurrency(dashboardData.topCards.totalExpenses)}</span>
            </div>
          </div>
          
          <div className='mt-6 pt-4 border-t border-gray-100'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>{t('cards.totalFinance.grossProfit')}</span>
              <span className='text-lg font-bold text-red-600'>{formatCurrency(dashboardData.topCards.totalProfit)}</span>
            </div>
          </div>
        </div>

        {/* Offers and Customers */}
        <div className='bg-white rounded-2xl p-6 border border-blue-200 shadow-sm'>
          <div className='flex items-start justify-between mb-6'>
            <div className='w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center'>
              <Users className='text-green-600 w-7 h-7' />
            </div>
          </div>
          
          <h3 className='text-gray-700 text-base font-medium mb-4'>{t('cards.offersCustomers.title')}</h3>
          
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.offersCustomers.totalOffers')} :</span>
              <span className='text-sm font-semibold text-blue-600'>{dashboardData.topCards.totalOffers}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.offersCustomers.pendingOffers')} :</span>
              <span className='text-sm font-semibold text-orange-600'>{dashboardData.topCards.pendingOffers}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>{t('cards.offersCustomers.totalCustomers')}</span>
              <span className='text-sm font-semibold text-green-600'>{dashboardData.topCards.totalCustomers}</span>
            </div>
          </div>
          
          <div className='mt-6 pt-4 border-t border-gray-100'>
            <p className='text-xs text-gray-500'>{t('cards.offersCustomers.newCustomersMonth', { count: dashboardData.topCards.newCustomersThisMonth })}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Revenue Chart */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-semibold text-gray-900'>{t('charts.revenueExpensesProfit')}</h3>
          </div>
          <div className='h-64'>
            <Bar data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Service Revenue Breakdown */}
        <div className='bg-white rounded-lg p-6 shadow-sm border'>
          <div className='flex items-center mb-6'>
            <div className='w-1 h-6 bg-red-500 mr-3'></div>
            <h3 className='text-lg font-semibold text-gray-900'>{t('charts.revenueByServiceType')}</h3>
          </div>
          <div className='space-y-6'>
            {serviceData.map((service, index) => (
              <div key={index}>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-gray-700 text-sm font-medium'>{t(`servicess.${service.name.toLowerCase()}`)}</span>
                  <span className='font-semibold text-red-600 text-sm'>{formatCurrency(service.amount)}</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div 
                    className='bg-red-500 h-2 rounded-full transition-all duration-500'
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className='bg-white rounded-lg p-6 shadow-sm border'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1 h-6 bg-red-500 mr-3'></div>
            <h3 className='text-lg font-semibold text-gray-900'>{t('tasksList.title')}</h3>
          </div>
          <button className='text-red-600 text-sm hover:underline'>{t('tasksList.viewAll')}</button>
        </div>
        <div className='space-y-3'>
          {dashboardData.importantTasks.length > 0 ? (
            dashboardData.importantTasks.map((task, index) => {
              // Check if task is overdue by comparing dueDate with current date
              const isOverdue = new Date(task.dueDate) < new Date();
              
              return (
                <div key={index} className={`rounded-lg p-4 border-l-4 border-red-500 ${
                  isOverdue ? 'bg-red-50' : 
                  task.priority === 'high' ? 'bg-gray-50' : 'bg-gray-100'
                }`}>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900 mb-2'>{task.title}</h4>
                      <div className='flex items-center gap-4'>
                        <span className='text-sm text-gray-500'>{t('tasksList.taskStatus')}: {new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {task.priority === 'high' ? t('tasksList.priority.high') : 
                           task.priority === 'medium' ? t('tasksList.priority.medium') : t('tasksList.priority.low')}
                        </span>
                      </div>
                    </div>
                    {isOverdue && (
                      <div className='bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium ml-4'>
                        {t('tasksList.overdue')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback to static tasks when no API tasks are available
            <>
             

           
            </>
          )}
        </div>
      </div>

        {/* Tasks Doughnut Chart Section */}
       <div className='grid grid-cols-1 gap-6 mt-8'>
         <div className='bg-white rounded-lg p-6 shadow-sm border'>
           <div className='flex items-center mb-6'>
             <div className='w-1 h-6 bg-red-500 mr-3'></div>
             <h3 className='text-lg font-semibold text-gray-900'>{t('tasksChart.title')}</h3>
           </div>
           <div className='flex items-center justify-center gap-12'>
             {/* Chart */}
             <div className='w-64 h-64 flex-shrink-0'>
               <Doughnut data={tasksChartData} options={tasksChartOptions} />
             </div>
             
             {/* Legend */}
             <div className='flex flex-col gap-6'>
               {dashboardData && (() => {
                 const rejected = dashboardData.offerStatusChart.rejected || 0;
                 const total = dashboardData.offerStatusChart.accepted + dashboardData.offerStatusChart.pending + rejected;
                 const acceptedPercentage = total > 0 ? Math.round((dashboardData.offerStatusChart.accepted / total) * 100) : 0;
                 const pendingPercentage = total > 0 ? Math.round((dashboardData.offerStatusChart.pending / total) * 100) : 0;
                 const rejectedPercentage = total > 0 ? Math.round((rejected / total) * 100) : 0;
                 
                 return (
                   <>
                     <div className='flex items-center gap-4'>
                       <div className='w-4 h-4 bg-red-500 rounded-full flex-shrink-0'></div>
                       <span className='text-sm font-medium text-gray-700'>{t('tasksChart.acceptedOffers')} {acceptedPercentage}%</span>
                     </div>
                     <div className='flex items-center gap-4'>
                       <div className='w-4 h-4 bg-red-300 rounded-full flex-shrink-0'></div>
                       <span className='text-sm font-medium text-gray-700'>{t('tasksChart.pendingOffers')} {pendingPercentage}%</span>
                     </div>
                     <div className='flex items-center gap-4'>
                       <div className='w-4 h-4 bg-gray-700 rounded-full flex-shrink-0'></div>
                       <span className='text-sm font-medium text-gray-700'>{t('tasksChart.rejectedOffers')} {rejectedPercentage}%</span>
                     </div>
                   </>
                 );
               })()}
             </div>
           </div>
         </div>
       </div>
    </div>
  )
}

export default Page