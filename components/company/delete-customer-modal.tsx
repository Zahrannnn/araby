"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useDeleteCustomer } from '@/hooks/useCustomers'
import type { Customer } from '@/lib/api'

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: Customer | null;
}

export function DeleteCustomerModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  customer 
}: DeleteCustomerModalProps) {
  const t = useTranslations('company.customers.viewModal.deleteModal');
  
  const deleteCustomerMutation = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customer) return;

    try {
      await deleteCustomerMutation.mutateAsync(customer.customerId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleClose = () => {
    if (!deleteCustomerMutation.isPending) {
      onClose();
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {t('title')}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <DialogDescription className="text-sm text-gray-600 mb-4">
            {t('message', { customerName: customer.fullName })}
          </DialogDescription>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">
                {t('warning')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteCustomerMutation.isPending}
            className="w-full sm:w-auto"
          >
            {t('cancelButton')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCustomerMutation.isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {deleteCustomerMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Löschen...
              </div>
            ) : (
              t('confirmButton')
            )}
          </Button>
        </DialogFooter>
        
        {deleteCustomerMutation.error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">
              {deleteCustomerMutation.error instanceof Error 
                ? deleteCustomerMutation.error.message 
                : 'An error occurred while deleting the customer'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 