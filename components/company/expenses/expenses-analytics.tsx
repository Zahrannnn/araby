import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { useExpensesCategoryChart, useExpensesMonthlyChart } from "@/hooks/useExpenses"
import type { TooltipItem } from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const dateRanges = [
  { label: "This Month", value: "this_month" },
  { label: "Last 6 Months", value: "last_6_months" },
  { label: "This Year", value: "this_year" },
  { label: "Custom…", value: "custom" },
]

const monthlyMock = [
  { month: "أغسطس", total: 0 },
  { month: "سبتمبر", total: 0 },
  { month: "أكتوبر", total: 0 },
  { month: "نوفمبر", total: 0 },
  { month: "ديسمبر", total: 0 },
  { month: "يناير", total: 0 },
  { month: "فبراير", total: 0 },
  { month: "مارس", total: 0 },
  { month: "أبريل", total: 0 },
  { month: "مايو", total: 0 },
  { month: "يونيو", total: 5500 },
  { month: "يوليو", total: 1500 },
]

const categoryMock = [
  { category: "صيانة مركبات", total: 3000 },
  { category: "تسويق وإعلان", total: 2500 },
  { category: "متنوعة", total: 1500 },
]

export function ExpensesAnalytics() {
  const t = useTranslations()
  const [range, setRange] = useState(dateRanges[0].value)

  const { data: monthlyData, isLoading: loadingMonthly, error: errorMonthly } = useExpensesMonthlyChart()
  const { data: categoryData, isLoading: loadingCategory, error: errorCategory } = useExpensesCategoryChart()

  const monthly = Array.isArray(monthlyData) && monthlyData.length > 0 ? monthlyData : monthlyMock
  const categories = Array.isArray(categoryData) && categoryData.length > 0 ? categoryData : []

  const lineData = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: "Total",
        data: monthly.map((m) => m.total),
        borderColor: "#334155",
        backgroundColor: "#33415533",
        pointBackgroundColor: "#334155",
        pointBorderColor: "#334155",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
    },
  }

  const pieData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => c.total),
        backgroundColor: [
          "#f22e3e", // red for largest
          "#64748b",
          "#cbd5e1",
        ],
        borderWidth: 0,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: { boxWidth: 16, boxHeight: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'pie'>) {
            const value = context.raw as number
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0)
            const percent = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${value} CHF (${percent}%)`
          },
        },
      },
    },
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <Card className="flex-1 min-w-[320px]">
        <CardHeader>
          <CardTitle>{t("Monthly Total Expenses (Last 12 Months)")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-center justify-center">
            {loadingMonthly ? (
              <span className="text-muted-foreground">{t("Loading...")}</span>
            ) : errorMonthly ? (
              <span className="text-destructive">{t("Error loading chart")}</span>
            ) : (
              <Line data={lineData} options={lineOptions} />
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 min-w-[320px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("Expenses by Category")}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md border hover:bg-gray-200">
                {dateRanges.find(r => r.value === range)?.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dateRanges.map(r => (
                <DropdownMenuItem key={r.value} onSelect={() => setRange(r.value)}>
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="h-56 flex items-center justify-center">
            {loadingCategory ? (
              <span className="text-muted-foreground">{t("Loading...")}</span>
            ) : errorCategory ? (
              <span className="text-destructive">{t("Error loading chart")}</span>
            ) : (
              <Pie data={pieData} options={pieOptions} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 