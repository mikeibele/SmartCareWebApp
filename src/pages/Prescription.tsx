import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Patient {
    user_id: string;
    full_name: string;
}

const Prescription = () => {
    const { user } = useAuth();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [formData, setFormData] = useState({
        patient_id: '',
        medication_name: '',
        dosage: '',
        instructions: '',
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch all patients from Supabase
    useEffect(() => {
        const fetchPatients = async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('user_id, full_name'); // ✅ use user_id
        
            if (error) {
                console.error('Error fetching patients:', error.message);
                setErrorMessage('Failed to load patients.');
            } else {
                console.log('Fetched patients:', data); // Debug
                setPatients(data || []);
            }
        };        

        fetchPatients();
    }, []);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle prescription submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!user) {
            console.error('User not logged in');
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
    
        // ✅ Lookup doctor ID using user.id
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single();
    
        if (doctorError || !doctorData) {
            console.error('Error fetching doctor:', doctorError?.message);
            setErrorMessage('Doctor profile not found.');
            setLoading(false);
            return;
        }
    
        const doctor_id = doctorData.id;
    
        const { patient_id, medication_name, dosage, instructions } = formData;
        const prescriptionData = {
            patient_id,
            doctor_id,
            medication_name,
            dosage,
            instructions,
            issued_date: new Date().toISOString(),
        };
    
        const { error } = await supabase.from('prescriptions').insert([prescriptionData]);
    
        if (error) {
            console.error('Error inserting prescription:', error.message);
            setErrorMessage('Failed to create prescription.');
        } else {
            setSuccessMessage('Prescription created successfully!');
            setFormData({
                patient_id: '',
                medication_name: '',
                dosage: '',
                instructions: '',
            });
        }
    
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Prescription</h2>

            {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* <select
                        id="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="">Select Patient</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.full_name}
                            </option>
                        ))}
                    </select> */}
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
                        rows={4}
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
        </div>
    );
};

export default Prescription;
