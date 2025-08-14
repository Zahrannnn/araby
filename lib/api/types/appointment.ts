/**
 * Appointment types and interfaces
 */

/**
 * Create appointment payload
 */
export interface CreateAppointmentPayload {
  customerId: number;
  appointmentDate: string; // ISO date string
  appointmentTime: string; // HH:MM format
  durationHours: number;
  location: string;
  notes: string;
  languageCode: string;
}

/**
 * Appointment entity
 */
export interface Appointment extends CreateAppointmentPayload {
  id: number;
  createdAt: string;
  updatedAt: string;
} 