import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect to Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Patient = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  health_history: string;
  user_id: string;
  emergency_contact: string;
  blood_type: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  doctor_id: string;
  appointment_date: string;
  symptoms: string;
  status: string;
  created_at: string;
  appointment_type: string;
  zoom_meeting_id: string;
};

export type HealthHistory = {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  notes: string;
  attachment_url: string;
  created_at: string;
};

export type Prescription = {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  instructions: string;
  created_at: string;
  status: string;
};

export type Doctor = {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  license_number: string;
  phone: string;
  email: string;
  created_at: string;
};