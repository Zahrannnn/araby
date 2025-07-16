"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { useUpdateEmployee } from "@/hooks/useEmployees"
import { ArrowLeft, UserCircle2, ShieldCheck } from "lucide-react"
import { z } from "zod"
import type { Employee } from "@/lib/api"

// Define available permissions
const PERMISSIONS = {
  can_view_offers: 1,
  can_edit_customers: 2,
  can_manage_tasks: 3,
  can_view_reports: 4,
  can_manage_users: 5,
  can_manage_invoices: 6,
} as const

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  userName: z.string().min(1, "Username is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If either password field is filled, both must match
  if (data.newPassword || data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type EmployeeFormData = z.infer<typeof employeeSchema>

interface UpdateEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee: Employee | null
}

export function UpdateEmployeeModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  employee 
}: UpdateEmployeeModalProps) {
  const t = useTranslations('company.employees.updateModal')
  const updateEmployee = useUpdateEmployee()
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData | 'submit', string>>>({})
  const [isActive, setIsActive] = useState(true)

  // Initialize form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        userName: employee.userName || '',
        newPassword: '',
        confirmPassword: '',
      })
      setSelectedPermissions(employee.permissionIds || [])
      setIsActive(employee.isActive)
    }
  }, [employee])

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
      // Log the current form data
      console.log('Validating form data:', {
        ...formData,
        newPassword: formData.newPassword ? '***' : undefined,
        confirmPassword: formData.confirmPassword ? '***' : undefined,
      });

      // Create a validation object without password fields if they're empty
      const validationObject = {
        ...formData,
        newPassword: formData.newPassword || undefined,
        confirmPassword: formData.confirmPassword || undefined,
      }
      
      // Log the validation object
      console.log('Validation object:', {
        ...validationObject,
        newPassword: validationObject.newPassword ? '***' : undefined,
        confirmPassword: validationObject.confirmPassword ? '***' : undefined,
      });
      
      employeeSchema.parse(validationObject)
      
      // Check if passwords match only if a new password is being set
      if (formData.newPassword || formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          console.log('Password mismatch error');
          setErrors(prev => ({ ...prev, confirmPassword: t('errors.passwordMismatch') }));
          return false;
        }
      }
      
      console.log('Form validation successful');
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Zod validation errors:', error.errors);
        const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {}
        error.errors.forEach(err => {
          const field = err.path[0] as keyof EmployeeFormData
          newErrors[field] = t(`errors.${field}Required`)
          console.log(`Field ${field} error:`, err.message);
        })
        setErrors(newErrors)
      } else {
        console.log('Non-Zod validation error:', error);
      }
      return false;
    }
  }

  const handleSubmit = async () => {
    console.log('Submit clicked, employee:', employee);
    if (!employee?.id) {
      console.log('No employee ID found');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      const updateData = {
        id: employee.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        userName: formData.userName.trim(),
        newPassword: formData.newPassword?.trim(),
        isActive,
        permissionIds: selectedPermissions
      };

      console.log('Submitting update for employee:', {
        ...updateData,
        newPassword: updateData.newPassword ? '***' : undefined,
      });

      await updateEmployee.mutateAsync(updateData);
      console.log('Update successful');
      onSuccess();
    } catch (error) {
      console.error('Failed to update employee:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError.response?.data?.message || t('errors.updateFailed');
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, submit: t('errors.updateFailed') }));
      }
    }
  }

  if (!employee) return null

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
              <h3 className="font-medium">{t('employeeInformation')}</h3>
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(!!checked)}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none"
                  >
                    {t('fields.isActive')}
                  </label>
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
                  <label className="block text-sm mb-1.5">{t('fields.newPassword')}</label>
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    placeholder={t('placeholders.newPassword')}
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
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

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateEmployee.isPending}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateEmployee.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {updateEmployee.isPending ? t('actions.updating') : t('actions.update')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 