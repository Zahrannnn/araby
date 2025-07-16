import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Pencil, Trash2 } from "lucide-react"
import { useExpenses } from "@/hooks/useExpenses"
import { expensesApi, queryClient } from "@/lib/api"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"

interface Expense {
  expenseId: number
  expenseDate: string
  description: string
  category: string
  amountCHF: number
  paidByName: string
}

interface ExpensesTableProps {
  search?: string
  category?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
  onEdit?: (row: Expense) => void
}

function InlineAlert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between" role="alert">
      <span>{message}</span>
      <button
        className="ml-4 text-red-700 font-bold text-lg focus:outline-none"
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        ×
      </button>
    </div>
  )
}

export function ExpensesTable({ search = "", category = "", from, to, page = 1, pageSize = 10, onEdit }: ExpensesTableProps) {
  const t = useTranslations()
  const { data, isLoading, error } = useExpenses({ page, pageSize, search, category, from, to })
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmRow, setConfirmRow] = useState<Expense | null>(null)

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t("Loading...")}</div>
  }
  if (error) {
    return <div className="p-6 text-destructive">{t("Error loading expenses")}</div>
  }

  const rows = (data && typeof data === 'object' && data !== null && 'items' in data && Array.isArray((data as { items?: unknown }).items) ? (data as { items: Expense[] }).items : [])

  async function handleDelete(row: Expense) {
    setDeletingId(row.expenseId)
    setDeleteError(null)
    try {
      await expensesApi.deleteExpense(row.expenseId)
      await queryClient.invalidateQueries({ queryKey: ["expenses"] })
    } catch (err) {
      setDeleteError((err as Error)?.message || t("Error deleting expense"))
    } finally {
      setDeletingId(null)
      setConfirmRow(null)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      {deleteError && <InlineAlert message={deleteError} onClose={() => setDeleteError(null)} />}
      <Dialog open={!!confirmRow} onOpenChange={open => { if (!open) setConfirmRow(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Delete Expense")}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">{t("Are you sure you want to delete this expense?")}</div>
          <DialogFooter>
            <Button
              size="sm"
              variant="destructive"
              className="bg-[#f22e3e] text-white"
              onClick={() => confirmRow && handleDelete(confirmRow)}
              disabled={deletingId === confirmRow?.expenseId}
            >
              {deletingId === confirmRow?.expenseId ? t("Deleting...") : t("Delete")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmRow(null)} disabled={deletingId === confirmRow?.expenseId}>
              {t("Cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">{t("Date")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("Description")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("Category")}</th>
            <th className="px-4 py-3 text-right font-semibold">{t("Amount (CHF)")}</th>
            <th className="px-4 py-3 text-left font-semibold">{t("Paid By")}</th>
            <th className="px-4 py-3 text-center font-semibold">{t("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.expenseId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 whitespace-nowrap">{row.expenseDate ? new Date(row.expenseDate).toLocaleDateString() : "-"}</td>
              <td className="px-4 py-3 whitespace-nowrap">{row.description}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {row.category}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap font-mono">{row.amountCHF}</td>
              <td className="px-4 py-3 whitespace-nowrap">{row.paidByName}</td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={() => onEdit && onEdit(row)}>
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">{t("Edit")}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => setConfirmRow(row)}
                  disabled={deletingId !== null}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">{t("Delete")}</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 