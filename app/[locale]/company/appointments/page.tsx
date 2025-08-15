"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TimePicker } from "@/components/ui/time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useDebounce } from '@/app/hooks/useDebounce';
import { createAppointmentSchema, type CreateAppointmentFormData } from '@/lib/schemas/appointment';
import { apiClient, type Customer } from '@/lib/api';

// Customer search result from /Task/customers endpoint has different structure
interface CustomerSearchResult {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  notes: string;
}
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const DURATION_OPTIONS = [
  { value: 0.5, label: '30 minutes' },
  { value: 1, label: '1 hour' },
  { value: 1.5, label: '1.5 hours' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours' },
];

export default function AppointmentsPage() {
  const t = useTranslations('companyDashboard.appointments');
  
  const [formData, setFormData] = useState<CreateAppointmentFormData>({
    customerId: 0,
    appointmentDate: '',
    appointmentTime: '',
    durationHours: 1,
    location: '',
    notes: '',
    languageCode: 'en',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<CustomerSearchResult[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(customerSearch, 500);

  // Search customers when input changes
  useEffect(() => {
    async function searchCustomers() {
      if (!debouncedSearch) {
        setCustomers([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await apiClient.get<CustomerSearchResult[]>(`/Task/customers?searchName=${debouncedSearch}`);
        setCustomers(response.data);
      } catch (err) {
        console.error('Error searching customers:', err);
        setCustomers([]);
      } finally {
        setIsSearching(false);
      }
    }

    searchCustomers();
  }, [debouncedSearch]);

  const createAppointmentMutation = useCreateAppointment({
    onSuccess: () => {
      // Reset form
      setFormData({
        customerId: 0,
        appointmentDate: '',
        appointmentTime: '',
        durationHours: 1,
        location: '',
        notes: '',
        languageCode: 'en',
      });
      setSelectedCustomer(null);
      setCustomerSearch('');
      setErrors({});
      toast.success(t('success'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = <K extends keyof CreateAppointmentFormData>(
    field: K,
    value: CreateAppointmentFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleCustomerSelect = (customer: CustomerSearchResult) => {
    setSelectedCustomer(null); // We don't need to store the full customer object
    setCustomerSearch(customer.fullName);
    setCustomers([]);
    // Use the same property as offer modal
    handleInputChange('customerId', customer.id);
    // Clear customer validation error
    if (errors.customerId) {
      setErrors(prev => ({
        ...prev,
        customerId: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      createAppointmentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: Array<string>; message: string }> };
        const newErrors: Record<string, string> = {};
        zodError.issues.forEach((issue) => {
          const field = issue.path[0];
          newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert date to ISO string and format time for backend
    if (!formData.appointmentDate || formData.appointmentDate.trim() === '') {
      setErrors(prev => ({ ...prev, appointmentDate: 'Appointment date is required' }));
      return;
    }
    
    // Format time to TimeSpan format (HH:MM:SS)
    const formatTimeForAPI = (time: string): string => {
      if (!time) return "00:00:00";
      // Convert time to TimeSpan format ("HH:mm:ss")
      const [hours, minutes] = time.split(":").map(Number);
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}:00`;
    };
    
    // Native date input provides YYYY-MM-DD format, convert to ISO string
    const appointmentDate = new Date(formData.appointmentDate + 'T00:00:00.000Z').toISOString();
    
    // Create payload with proper DTO structure
    const appointmentPayload = {
      customerId: formData.customerId,
      appointmentDate,
      appointmentTime: formatTimeForAPI(formData.appointmentTime),
      durationHours: formData.durationHours,
      location: formData.location,
      notes: formData.notes,
      languageCode: formData.languageCode,
    };

    createAppointmentMutation.mutate(appointmentPayload);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              {t('title')}
            </CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Search */}
              <div className="space-y-2">
                <Label htmlFor="customer" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {t('customer')}
                </Label>
                <div className="relative">
                  <Input
                    id="customer"
                    type="text"
                    placeholder={t('customerPlaceholder')}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className={errors.customerId ? 'border-red-500' : ''}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  
                  {/* Customer dropdown */}
                  {customers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {customers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.fullName}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.customerId && (
                  <p className="text-sm text-red-600">{errors.customerId}</p>
                )}
              </div>

              {/* Appointment Date */}
              <div className="space-y-2">
                <Label htmlFor="appointmentDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {t('appointmentDate')}
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  className={errors.appointmentDate ? 'border-red-500' : ''}
                />
                {errors.appointmentDate && (
                  <p className="text-sm text-red-600">{errors.appointmentDate}</p>
                )}
              </div>

              {/* Appointment Time */}
              <div className="space-y-2">
                <Label htmlFor="appointmentTime" className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  {t('appointmentTime')}
                </Label>
                <TimePicker
                  value={formData.appointmentTime}
                  onChange={(time) => handleInputChange('appointmentTime', time || '')}
                  placeholder={t('selectTime')}
                  className={errors.appointmentTime ? 'border-red-500' : ''}
                />
                {errors.appointmentTime && (
                  <p className="text-sm text-red-600">{errors.appointmentTime}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  {t('duration')}
                </Label>
                <Select
                  value={formData.durationHours.toString()}
                  onValueChange={(value) => handleInputChange('durationHours', parseFloat(value))}
                >
                  <SelectTrigger className={errors.durationHours ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectDuration')} />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.durationHours && (
                  <p className="text-sm text-red-600">{errors.durationHours}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  {t('location')}
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder={t('locationPlaceholder')}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t('notes')}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={t('notesPlaceholder')}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className={errors.notes ? 'border-red-500' : ''}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                )}
              </div>

              {/* Language Code */}
              <div className="space-y-2">
                <Label htmlFor="languageCode">
                  {t('language')}
                </Label>
                <Select
                  value={formData.languageCode}
                  onValueChange={(value) => handleInputChange('languageCode', value)}
                >
                  <SelectTrigger className={errors.languageCode ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
                {errors.languageCode && (
                  <p className="text-sm text-red-600">{errors.languageCode}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      customerId: 0,
                      appointmentDate: '',
                      appointmentTime: '',
                      durationHours: 1,
                      location: '',
                      notes: '',
                      languageCode: 'en',
                    });
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setErrors({});
                  }}
                >
                  {t('reset')}
                </Button>
                <Button
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending ? t('creating') : t('createAppointment')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 