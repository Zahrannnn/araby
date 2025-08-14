import { z } from 'zod';

export const createAppointmentSchema = z.object({
  customerId: z.number().min(1, 'Customer is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  durationHours: z.number().min(0.5, 'Duration must be at least 0.5 hours').max(24, 'Duration cannot exceed 24 hours'),
  location: z.string().min(1, 'Location is required').max(500, 'Location is too long'),
  notes: z.string().max(1000, 'Notes are too long'),
  languageCode: z.string().min(2, 'Language code is required').max(5, 'Invalid language code'),
});

export type CreateAppointmentFormData = {
  customerId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationHours: number;
  location: string;
  notes: string;
  languageCode: string;
}; 