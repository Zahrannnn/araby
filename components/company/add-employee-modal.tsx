"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useAddEmployee } from "@/hooks/useEmployees"
import { ArrowLeft, UserCircle2, ShieldCheck } from "lucide-react"
import { z } from "zod"


const PERMISSIONS = {
  can_view_offers: 1,
  can_edit_customers: 2,
  can_manage_tasks: 3,
  can_view_reports: 4,
  can_manage_users: 5,
  can_manage_invoices: 6,
} as const

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  userName: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const t = useTranslations('company.employees.modal')
  const addEmployee = useAddEmployee()
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
  })

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData | 'submit', string>>>({})

  const handleChange = (field: keyof EmployeeFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const validateForm = () => {
    try {
      employeeSchema.parse(formData)
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {}
        error.errors.forEach(err => {
          const field = err.path[0] as keyof EmployeeFormData
          newErrors[field] = t(`errors.${field}Required`)
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await addEmployee.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        userName: formData.userName,
        password: formData.password,
        isActive: true,
        permissionIds: selectedPermissions
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to create employee:', error)
      setErrors(prev => ({ ...prev, submit: t('errors.createFailed') }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogTitle className="sr-only">
          {t('title')}
        </DialogTitle>
        <div className="bg-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">{t('title')}</h2>
          </div>
          <p className="text-sm text-gray-600 ml-10">
            {t('breadcrumb')}
          </p>
        </div>

        <div className="p-6">
          {/* User Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <UserCircle2 className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">{t('customerInformation')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5">{t('fields.firstName')}</label>
                  <Input
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    placeholder={t('placeholders.firstName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5">{t('fields.lastName')}</label>
                  <Input
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    placeholder={t('placeholders.lastName')}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5">{t('fields.userName')}</label>
                  <Input
                    value={formData.userName}
                    onChange={handleChange('userName')}
                    placeholder={t('placeholders.userName')}
                    className={errors.userName ? 'border-red-500' : ''}
                  />
                  {errors.userName && (
                    <p className="text-sm text-red-500 mt-1">{errors.userName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5">{t('fields.email')}</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder={t('placeholders.email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5">{t('fields.password')}</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder={t('placeholders.password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5">{t('fields.confirmPassword')}</label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder={t('placeholders.confirmPassword')}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">{t('permissions.title')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PERMISSIONS).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={selectedPermissions.includes(value)}
                    onCheckedChange={() => handlePermissionChange(value)}
                  />
                  <label
                    htmlFor={key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t(`permissions.${key}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
          )}

          <div className="flex gap-3 mt-8">
            <Button
              onClick={handleSubmit}
              disabled={addEmployee.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {addEmployee.isPending ? "Speichern..." : "Speichern"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={addEmployee.isPending}
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 