/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { expensesApi, AddExpensePayload, UpdateExpensePayload, queryClient } from "@/lib/api"

interface ExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEdit?: boolean
  initialData?: any
}

export function ExpenseModal({ open, onOpenChange, isEdit, initialData }: ExpenseModalProps) {
  const t = useTranslations()
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amountCHF, setAmountCHF] = useState("")
  const [expenseDate, setExpenseDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && initialData) {
      setDescription(initialData.description || "")
      setAmountCHF(initialData.amountCHF?.toString() || "")
      setExpenseDate(initialData.expenseDate ? initialData.expenseDate.slice(0, 10) : "")
      setCategory(initialData.category || "")
    } else if (open) {
      setDescription("")
      setAmountCHF("")
      setExpenseDate("")
      setCategory("")
    }
  }, [isEdit, initialData, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isEdit && initialData) {
        const payload: UpdateExpensePayload = {
          expenseId: initialData.expenseId,
          description,
          amountCHF: Number(amountCHF),
          expenseDate: expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString(),
          category,
        }
        await expensesApi.updateExpense(payload)
      } else {
        const payload: AddExpensePayload = {
          description,
          amountCHF: Number(amountCHF),
          expenseDate: expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString(),
          category,
        }
        await expensesApi.addExpense(payload)
      }
      await queryClient.invalidateQueries({ queryKey: ["expenses"] })
      setDescription("")
      setAmountCHF("")
      setExpenseDate("")
      setCategory("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || t(isEdit ? "Error editing expense" : "Error adding expense"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("Edit Expense")
              : t("Add New Expense")}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            placeholder={t("Description")}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder={t("Amount in CHF")}
            value={amountCHF}
            onChange={e => setAmountCHF(e.target.value)}
            min={0}
            required
          />
          <Input
            type="date"
            placeholder={t("Expense Date")}
            value={expenseDate}
            onChange={e => setExpenseDate(e.target.value)}
            required
          />
          <Input
            placeholder={t("Category")}
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          />
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" variant="destructive" className="bg-[#f22e3e] text-white" disabled={loading}>
              {loading ? t(isEdit ? "Saving..." : "Saving...") : t(isEdit ? "Save Changes" : "Save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {t("Cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 