import React, { useEffect, useState } from 'react';
import { getHealthHistories } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { HealthHistory } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<HealthHistory[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { doctorProfile } = useAuth();

  useEffect(() => {
    const fetchHealthRecords = async () => {
      setIsLoading(true);
      try {
        const data = await getHealthHistories();
        
        // In a real app, you might want to filter by doctor_id here
        setRecords(data);
        setFilteredRecords(data);
      } catch (error) {
        console.error('Error fetching health records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthRecords();
  }, [doctorProfile]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecords(records);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = records.filter(
        (record) =>
          record.diagnosis?.toLowerCase().includes(lowercaseQuery) ||
          record.notes?.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredRecords(filtered);
    }
  }, [searchQuery, records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-md mr-3">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-500">View and manage patient health records</p>
          </div>
        </div>
        <div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Health Record
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search health records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-md border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No health records found</h3>
            <p className="mt-1 text-gray-500 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Get started by adding a new health record"}
            </p>
            <Button>Add New Record</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/patients/${record.patient_id}`} className="hover:text-blue-600">
                          Patient ID: {record.patient_id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(record.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{record.diagnosis}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{record.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Link to={`/doctors/${record.doctor_id}`} className="hover:text-blue-600">
                          Doctor ID: {record.doctor_id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/health-records/${record.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <Link to={`/health-records/${record.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HealthRecords;