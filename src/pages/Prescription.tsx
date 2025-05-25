import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface PrescriptionType {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  instructions: string;
  issued_date: string;
}

interface Patient {
  user_id: string;
  full_name: string;
}

const Prescriptions: React.FC = () => {
  const { user } = useAuth();

  const [prescriptions, setPrescriptions] = useState<PrescriptionType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    instructions: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch prescriptions from Supabase
  const fetchPrescriptions = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');

    // Check if user is a doctor
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (doctorError) {
      console.error('Error checking doctor role:', doctorError);
      setErrorMessage('Failed to determine user role.');
      setLoading(false);
      return;
    }

    let query = supabase
      .from('prescriptions')
      .select('*')
      .order('issued_date', { ascending: false });

    if (doctorData) {
      // Doctor: fetch all prescriptions (no filter)
    } else {
      // Patient: fetch only their prescriptions
      query = query.eq('patient_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prescriptions:', error);
      setErrorMessage('Failed to fetch prescriptions.');
    } else {
      setPrescriptions(data || []);
      console.log('Fetched prescriptions:', data);
    }
    setLoading(false);
  };

  // Fetch patients for dropdown (doctors will need this)
  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('user_id, full_name');
    if (error) {
      console.error('Error fetching patients:', error.message);
      setErrorMessage('Failed to load patients.');
    } else {
      setPatients(data || []);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('You must be logged in.');
      return;
    }
    if (!formData.patient_id) {
      setErrorMessage('Please select a valid patient.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Get doctor id from user id
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (doctorError || !doctorData) {
      setErrorMessage('Doctor profile not found.');
      setLoading(false);
      return;
    }

    const doctor_id = doctorData.id;

    const prescriptionData = {
      ...formData,
      doctor_id,
      issued_date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('prescriptions').insert([prescriptionData]).select();

    if (error) {
      console.error('Error inserting prescription:', error.message);
      setErrorMessage('Failed to create prescription.');
    } else {
      console.log('Inserted prescription:', data);
      setSuccessMessage('Prescription created successfully!');
      setFormData({
        patient_id: '',
        medication_name: '',
        dosage: '',
        instructions: '',
      });
      fetchPrescriptions(); // refresh the list
      setFormVisible(false);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prescriptions</h2>
        <button
          onClick={() => setFormVisible((v) => !v)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {formVisible ? 'Cancel' : 'New Prescription'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 border p-4 rounded">
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}

          <div>
            <label htmlFor="patient_id" className="block font-medium mb-1">
              Patient
            </label>
            <select
              id="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="medication_name" className="block font-medium mb-1">
              Medication Name
            </label>
            <input
              type="text"
              id="medication_name"
              value={formData.medication_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="dosage" className="block font-medium mb-1">
              Dosage
            </label>
            <input
              type="text"
              id="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block font-medium mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Submitting...' : 'Create Prescription'}
          </button>
        </form>
      )}

      {loading && !formVisible ? (
        <p>Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <p className="text-center text-gray-500">No prescriptions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.patient_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.medication_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.dosage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{prescription.instructions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(prescription.issued_date), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
