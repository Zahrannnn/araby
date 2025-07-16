import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

const categories = [
  "",
  "Fuel / Kraftstoff",
  "Salaries / Gehälter",
  "Rent / Miete",
  "Utilities / Nebenkosten",
  "Vehicle Maintenance / Fahrzeugwartung",
  "Supplies / Bedarf",
  "Marketing & Advertising / Marketing & Werbung",
  "Office Supplies / Bürobedarf",
  "Software / Software/Abonnements",
  "Travel / Reisekosten",
  "Other / Sonstiges",
]

interface ExpensesFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  from?: string
  onFromChange: (value?: string) => void
  to?: string
  onToChange: (value?: string) => void
}

export function ExpensesFilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  from,
  onFromChange,
  to,
  onToChange,
}: ExpensesFilterBarProps) {
  const t = useTranslations()
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center w-full">
      <Input
        className="w-full md:w-1/3"
        placeholder={t("Search by description or category…")}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md border hover:bg-gray-200">
            {category || t("All Categories")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {categories.map(c => (
            <DropdownMenuItem key={c} onSelect={() => onCategoryChange(c)}>
              {c || t("All Categories")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}
    
    </div>
  )
} 