import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { getAppointments, getPatients } from '../lib/api';
import { Activity, Users, Calendar, Clock, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { doctorProfile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patients
        const patientsData = await getPatients();
        setPatients(patientsData);
        
        // Fetch appointments
        let appointmentsData = [];
        if (doctorProfile) {
          appointmentsData = await getAppointments(doctorProfile.id);
        } else {
          appointmentsData = await getAppointments();
        }
        setAppointments(appointmentsData);
        
        // Filter upcoming appointments
        const now = new Date();
        const upcoming = appointmentsData
          .filter((apt: any) => new Date(apt.appointment_date) > now)
          .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
          .slice(0, 5);
        
        setUpcomingAppointments(upcoming);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [doctorProfile]);
  
  // Prepare data for appointment status chart
  const appointmentStatusData = {
    labels: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
    datasets: [
      {
        label: 'Appointments by Status',
        data: [
          appointments.filter((apt: any) => apt.status === 'scheduled').length,
          appointments.filter((apt: any) => apt.status === 'completed').length,
          appointments.filter((apt: any) => apt.status === 'cancelled').length,
          appointments.filter((apt: any) => apt.status === 'no-show').length,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for appointments over time
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'MMM');
  }).reverse();
  
  const appointmentsOverTimeData = {
    labels: lastSixMonths,
    datasets: [
      {
        label: 'Appointments',
        data: lastSixMonths.map((_, index) => {
          // This is just placeholder data - in a real app you'd calculate this from actual appointment dates
          return 5 + Math.floor(Math.random() * 20);
        }),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {doctorProfile?.full_name.split(' ')[0] || 'Doctor'}</h2>
            <p className="mt-1 text-gray-600">Here's what's happening today</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Clock className="mr-1 h-4 w-4" />
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total Patients</p>
              <p className="text-2xl font-semibold text-blue-700">{patients.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-teal-900">Total Appointments</p>
              <p className="text-2xl font-semibold text-teal-700">{appointments.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md">
              <Clock3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-900">Upcoming</p>
              <p className="text-2xl font-semibold text-indigo-700">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-900">Completed</p>
              <p className="text-2xl font-semibold text-orange-700">
                {appointments.filter((apt: any) => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Appointment Status">
          <div className="h-64">
            <Bar 
              data={appointmentStatusData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }} 
            />
          </div>
        </Card>
        
        <Card title="Appointments Over Time">
          <div className="h-64">
            <Line 
              data={appointmentsOverTimeData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }} 
            />
          </div>
        </Card>
      </div>

      {/* Upcoming appointments */}
      <Card 
        title="Upcoming Appointments" 
        headerAction={
          <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </Link>
        }
      >
        {upcomingAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment: any) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/patients/${appointment.user_id}`} className="text-blue-600 hover:text-blue-900">
                        {/* This would require a join with patients table or another query to get patient name */}
                        Patient ID: {appointment.user_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(appointment.appointment_date), 'MMM d, yyyy - h:mm a')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex text-xs leading-5 font-medium rounded-full px-2 py-1 bg-gray-100">
                        {appointment.appointment_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex text-xs leading-5 font-medium rounded-full px-2 py-1 ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
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

export default Dashboard;