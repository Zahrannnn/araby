import { useTranslations } from 'next-intl'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Employee } from '@/lib/api'

interface DeleteEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  employee: Employee | null
  isDeleting?: boolean
}

export function DeleteEmployeeModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isDeleting = false,
}: DeleteEmployeeModalProps) {
  const t = useTranslations('company.employees')

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ExclamationTriangleIcon className="h-5 w-5" />
            {t('deleteConfirmation.title')}
          </DialogTitle>
          <DialogDescription>
            {t('deleteConfirmation.description', { name: employee.fullName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Löschen..." : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 