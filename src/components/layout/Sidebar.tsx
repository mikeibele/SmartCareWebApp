import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, Activity, User, Presentation as PrescriptionBottle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type SidebarProps = {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileSidebarOpen, 
  toggleMobileSidebar 
}) => {
  const location = useLocation();
  const { signOut, doctorProfile } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Patients', path: '/patients', icon: <Users size={20} /> },
    { name: 'Appointments', path: '/appointments', icon: <Calendar size={20} /> },
    { name: 'Health Records', path: '/health-records', icon: <Activity size={20} /> },
    { name: 'Prescriptions', path: '/prescriptions', icon: <PrescriptionBottle size={20} /> },
    { name: 'Doctors', path: '/doctors', icon: <User size={20} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Sidebar for mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-xl font-semibold text-blue-600">SmartCare</h2>
          <button 
            className="p-1 text-gray-500 hover:text-gray-600 focus:outline-none" 
            onClick={toggleMobileSidebar}
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-3 py-4 overflow-y-auto">
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-gray-900">
              {doctorProfile?.full_name || 'Doctor'}
            </p>
            <p className="text-xs text-gray-500">
              {doctorProfile?.specialty || 'Medical Professional'}
            </p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleMobileSidebar();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b">
              <h2 className="text-xl font-semibold text-blue-600">SmartCare</h2>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-3 py-4">
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    {doctorProfile?.full_name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doctorProfile?.specialty || 'Medical Professional'}
                  </p>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <button
                    onClick={signOut}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <LogOut size={20} className="mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;