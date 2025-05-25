// lib/api.ts
import { supabase } from './supabase';
import type { Appointment, HealthHistory, Prescription, Doctor } from './supabase';
import type { Patient } from './supabase';

// Patients API
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*');

  if (error) {
    console.error('Error fetching patients from Supabase:', error.message);
    throw error;
  }

  console.log('Fetched patients:', data); // ✅ Log the data here
  return data || [];
};

export async function getPatient(id: string) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Patient;
  } catch (error) {
    console.error(`Error fetching patient with id ${id}:`, error);
    return null;
  }
}

// Appointments API
export async function getAppointments() {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) throw error;
    return data as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function getAppointment(id: string) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Appointment;
  } catch (error) {
    console.error(`Error fetching appointment with id ${id}:`, error);
    return null;
  }
}

export async function updateAppointment(id: string, updateData: Partial<Appointment>) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  } catch (error) {
    console.error(`Error updating appointment with id ${id}:`, error);
    throw error;
  }
}

// Health History API
export async function getHealthHistories(patientId?: string) {
  try {
    let query = supabase.from('health_history').select('*');
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as HealthHistory[];
  } catch (error) {
    console.error('Error fetching health histories:', error);
    return [];
  }
}

// Prescriptions API
export async function getPrescriptions(patientId?: string, doctorId?: string) {
  try {
    let query = supabase.from('prescriptions').select('*');
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Prescription[];
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
}

// Doctors API
export async function getDoctors() {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    return data as Doctor[];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

export async function getDoctor(id: string) {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Doctor;
  } catch (error) {
    console.error(`Error fetching doctor with id ${id}:`, error);
    return null;
  }
}