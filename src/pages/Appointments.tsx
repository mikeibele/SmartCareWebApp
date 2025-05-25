import React, { useEffect, useState } from 'react';
import { getAppointments } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Appointment } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../src/lib/supabase';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { doctorProfile } = useAuth();

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select();
  
      if (error) {
        console.error('Update failed:', error);
      } else {
        console.log(`Updated appointment (${appointmentId}) to status "${newStatus}"`);
        console.log('Returned data:', data);
  
        const updatedAppointments = appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        );
        setAppointments(updatedAppointments);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await getAppointments();
        console.log('Fetched Appointments:', data);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        apt =>
          apt.symptoms?.toLowerCase().includes(lowercaseQuery) ||
          apt.appointment_type?.toLowerCase().includes(lowercaseQuery) ||
          apt.status?.toLowerCase().includes(lowercaseQuery)
      );
    }

    filtered.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

    setFilteredAppointments(filtered);
  }, [searchQuery, statusFilter, appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-md mr-3">
            <Calendar className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-500">Manage your appointment schedule</p>
          </div>
        </div>
        <div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
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
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
          <div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-md border border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter"
                : "Get started by creating a new appointment"}
            </p>
            <Button>Create Appointment</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symptoms
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/patients/${appointment.user_id}`} className="hover:text-blue-600">
                          Patient ID: {appointment.user_id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(appointment.appointment_date), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.appointment_type}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {appointment.symptoms}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {appointment.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 space-x-2">
                      <button
                        onClick={() => {
                          console.log(`Approving appointment: ${appointment.id}`);
                          handleStatusUpdate(appointment.id, 'approved');
                        }}
                        className="text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          console.log(`Cancelling appointment: ${appointment.id}`);
                          handleStatusUpdate(appointment.id, 'cancelled');
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
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

export default Appointments;
