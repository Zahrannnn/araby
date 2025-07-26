"use client"
import { Suspense, useState } from "react"
import { ExpensesAnalytics } from "@/components/company/expenses/expenses-analytics"
import { ExpensesPagination } from "@/components/company/expenses/expenses-pagination"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { ExpenseModal } from "@/components/company/expenses/expense-modal"
import { ExpensesTable } from "@/components/company/expenses/expenses-table"
import { ExpensesFilterBar } from "@/components/company/expenses/expenses-filter-bar"

export default function ExpensesPage() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [from, setFrom] = useState<string | undefined>()
  const [to, setTo] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  function handleAdd() {
    setEditData(null)
    setIsEdit(false)
    setOpen(true)
  }

  function handleEdit(row: any) {
    setEditData(row)
    setIsEdit(true)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setIsEdit(false)
    setEditData(null)
  }

  return (
    <main className="flex flex-col flex-1 bg-white rounded-xl shadow-md p-6 gap-6 min-h-screen overflow-y-hidden">
      <section className="flex flex-col md:flex-row gap-6">
        <ExpensesAnalytics />
        <div className="flex-1 flex justify-end items-start">
          <Button
            variant="destructive"
            className="font-bold px-6 py-2 text-white bg-[#f22e3e] hover:bg-[#d91f2b] rounded-xl shadow-md"
            onClick={handleAdd}
          >
            {t("Add New Expense")}
          </Button>
        </div>
      </section>
      <section>
        <ExpensesFilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          from={from}
          onFromChange={setFrom}
          to={to}
          onToChange={setTo}
        />
      </section>
      <section className="flex-1">
        <Suspense fallback={<div>{t("loading")}</div>}>
          <ExpensesTable
            search={search}
            category={category}
            from={from}
            to={to}
            page={page}
            pageSize={pageSize}
            onEdit={handleEdit}
          />
        </Suspense>
      </section>
      <section>
        <ExpensesPagination
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>
      <ExpenseModal open={open} onOpenChange={handleClose} isEdit={isEdit} initialData={editData} />
    </main>
  )
}
