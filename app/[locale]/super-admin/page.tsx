"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';

// Dynamically import Recharts to avoid SSR issues
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

// TypeScript interfaces for API response
interface TopCards {
  currentMonthProfit: number;
  lastMonthProfit: number;
  totalProfit: number;
  totalSubscriptions: number;
  currentMonthSubscriptions: number;
}

interface MonthlyProfit {
  month: string;
  profit: number;
}

interface TopCompany {
  companyName: string;
  totalProfit: number;
  createdAt: string;
}

interface DashboardData {
  topCards: TopCards;
  monthlyProfits: MonthlyProfit[];
  topCompanies: TopCompany[];
}

const Page = () => {
  const t = useTranslations();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate percentage change for metrics
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE");
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get token from cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        const token = getCookie("auth-token");
        
        if (!token) {
          throw new Error(t('superAdmin.dashboard.noAuthToken'));
        }

        const response = await fetch(
          "https://crmproject.runasp.net/api/SuperAdmin/dashboard",
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

        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // Transform monthly profits data for chart
  const chartData = dashboardData?.monthlyProfits.map((item, index) => ({
    month: item.month,
    profit: item.profit,
    index: index + 1,
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('superAdmin.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-lg shadow-sm border max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('superAdmin.dashboard.errorLoading')}</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            {t('superAdmin.dashboard.retryButton')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { topCards, topCompanies } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t('superAdmin.dashboard.title')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {t('superAdmin.dashboard.subtitle')}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Current Monthly Profit */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-xs sm:text-sm">
              {t('superAdmin.dashboard.currentMonthProfit')}
            </span>
            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
              <svg
                width="48"
                height="39"
                viewBox="0 0 78 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-6 sm:w-12 sm:h-9"
              >
                <g filter="url(#filter0_d_0_1)">
                  <rect x="4" width="70" height="55" rx="15" fill="#2ECC71" />
                </g>
                <path
                  d="M27 33.9534C27 37.51 29.75 40.37 33.1233 40.37H40.0167C42.95 40.37 45.3333 37.8767 45.3333 34.76C45.3333 31.4234 43.8666 30.2134 41.7033 29.4434L30.6667 25.5934C28.5033 24.8234 27.0366 23.65 27.0366 20.2767C27.0366 17.1967 29.42 14.6667 32.3533 14.6667H39.2467C42.62 14.6667 45.37 17.5267 45.37 21.0834"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M36.1667 11V44.0367"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <filter
                    id="filter0_d_0_1"
                    x="0"
                    y="0"
                    width="78"
                    height="63"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_0_1"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_0_1"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-all">
              {formatCurrency(topCards.currentMonthProfit)}
            </span>
            <span className="text-green-600 text-xs sm:text-sm font-medium flex-shrink-0 ml-2">
              {calculatePercentage(topCards.currentMonthProfit, topCards.lastMonthProfit)}
            </span>
          </div>
        </div>

        {/* Total System Profit */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-xs sm:text-sm">{t('superAdmin.dashboard.totalSystemProfit')}</span>
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <svg
                width="48"
                height="39"
                viewBox="0 0 78 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-6 sm:w-12 sm:h-9"
              >
                <g filter="url(#filter0_d_0_2)">
                  <rect x="4" width="70" height="55" rx="15" fill="#58A9DF" />
                </g>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M26.7209 39.2194C26.2727 38.7054 26.2582 37.8548 26.6884 37.3194L34.2484 27.9132C34.4606 27.6492 34.7537 27.5 35.06 27.5C35.3663 27.5 35.6594 27.6492 35.8716 27.9132L40.46 33.6222L45.8975 26.8568L42.0235 22.4146L54.5 18.0938L51.3946 33.1602L47.5206 28.718L41.2716 36.4931C41.0594 36.757 40.7663 36.9062 40.46 36.9062C40.1537 36.9062 39.8606 36.757 39.6484 36.4931L35.06 30.7841L28.3116 39.1806C27.8813 39.716 27.1691 39.7333 26.7209 39.2194Z"
                  fill="white"
                />
                <defs>
                  <filter
                    id="filter0_d_0_2"
                    x="0"
                    y="0"
                    width="78"
                    height="63"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_0_1"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_0_1"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-all">
              {formatCurrency(topCards.totalProfit)}
            </span>
            <span className="text-green-600 text-xs sm:text-sm font-medium flex-shrink-0 ml-2">
              {topCards.totalProfit > 0 ? "+100%" : "0%"}
            </span>
          </div>
        </div>

        {/* Total Subscriptions */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-xs sm:text-sm">{t('superAdmin.dashboard.totalSubscriptions')}</span>
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <svg
                width="48"
                height="39"
                viewBox="0 0 78 63"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-6 sm:w-12 sm:h-9"
              >
                <g filter="url(#filter0_d_0_3)">
                  <rect x="4" width="70" height="55" rx="15" fill="#514F6E" />
                </g>
                <path
                  d="M42.6332 21C42.6332 22.7667 42.1332 24.4167 41.2165 25.8167C41.1499 25.95 41.0666 26.0667 40.9832 26.1833C39.3832 28.4833 36.6999 30 33.6999 30C28.7666 30 24.7499 25.9667 24.7499 21C24.7499 16.0333 28.7666 12 33.6999 12C36.7166 12 39.3999 13.5167 40.9832 15.8167C41.0666 15.9333 41.1499 16.05 41.2165 16.2C42.1332 17.6 42.6332 19.25 42.6332 21.0167V21Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M52.3333 21C52.3333 24.6667 49.3833 27.6333 45.7499 27.6333C43.9999 27.6333 42.4166 26.95 41.2333 25.8167C42.1499 24.4167 42.65 22.7667 42.65 21C42.65 19.2333 42.1499 17.5833 41.2333 16.1833C42.4166 15.05 43.9999 14.3667 45.7499 14.3667C49.3833 14.3667 52.3333 17.3333 52.3333 21Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 42C28.35 34.6333 38.9333 34.6 43.3333 41.9167L43.3833 42"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <filter
                    id="filter0_d_0_3"
                    x="0"
                    y="0"
                    width="78"
                    height="63"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_0_1"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_0_1"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {topCards.totalSubscriptions.toLocaleString()}
            </span>
            <span className="text-green-600 text-xs sm:text-sm font-medium flex-shrink-0 ml-2">
              {topCards.currentMonthSubscriptions > 0 ? "+100%" : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t('superAdmin.dashboard.monthlySubscriptionProfit')}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600">{t('superAdmin.dashboard.last12Months')}</span>
            <div className="flex items-center gap-2">
              <select
                className="text-xs sm:text-sm border border-gray-300 rounded px-2 sm:px-3 py-1"
                aria-label={t('superAdmin.dashboard.selectTimeRange')}
              >
                <option>März 2025</option>
              </select>
              <button
                className="text-gray-400 hover:text-gray-600 p-1"
                title={t('superAdmin.dashboard.moreOptions')}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 sm:h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(value) => `€${value}`}
                  width={60}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
              {t('superAdmin.dashboard.noChartData')}
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Companies Table */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          {t('superAdmin.dashboard.topCompanies')}
        </h2>

        {/* Mobile Cards View */}
        <div className="block sm:hidden space-y-4">
          {topCompanies.length > 0 ? (
            topCompanies.map((company, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {t('active')}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{company.companyName}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">{t('superAdmin.dashboard.totalProfit')}:</span>
                    <div className="font-medium">{formatCurrency(company.totalProfit)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('superAdmin.dashboard.joinDate')}:</span>
                    <div className="font-medium">{formatDate(company.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {t('superAdmin.dashboard.noCompaniesFound')}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-sm font-medium text-gray-500 pb-3">
                  #
                </th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">
                  <div className="flex items-center gap-1">
                    {t('superAdmin.dashboard.companyName')}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">
                  <div className="flex items-center gap-1">
                    {t('superAdmin.dashboard.totalProfit')}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">
                  <div className="flex items-center gap-1">
                    {t('superAdmin.dashboard.joinDate')}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">
                  <div className="flex items-center gap-1">
                    {t('status')}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                      />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {topCompanies.length > 0 ? (
                topCompanies.map((company, index) => (
                  <tr key={index} className={index < topCompanies.length - 1 ? "border-b border-gray-100" : ""}>
                    <td className="py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="py-4 text-sm text-gray-900">{company.companyName}</td>
                    <td className="py-4 text-sm text-gray-900">{formatCurrency(company.totalProfit)}</td>
                    <td className="py-4 text-sm text-gray-900">{formatDate(company.createdAt)}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {t('active')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {t('superAdmin.dashboard.noCompaniesFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
