import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

const pageSizes = [10, 20, 50]

interface ExpensesPaginationProps {
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  totalPages?: number // optional, for future use
}

export function ExpensesPagination({ page, pageSize, onPageChange, onPageSizeChange, totalPages = 3 }: ExpensesPaginationProps) {
  const t = useTranslations()
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          {t("Prev")}
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={p === page ? "bg-[#f22e3e] text-white" : ""}
          >
            {p}
          </Button>
        ))}
        <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          {t("Next")}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span>{t("Items per page")}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md border hover:bg-gray-200">
              {pageSize}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {pageSizes.map(size => (
              <DropdownMenuItem key={size} onSelect={() => onPageSizeChange(size)}>
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 