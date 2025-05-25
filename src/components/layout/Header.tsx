import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type HeaderProps = {
  toggleMobileSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  
  // Function to get the page title based on the current location
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/patients')) return 'Patients';
    if (path.startsWith('/appointments')) return 'Appointments';
    if (path.startsWith('/health-records')) return 'Health Records';
    if (path.startsWith('/prescriptions')) return 'Prescriptions';
    if (path.startsWith('/doctors')) return 'Doctors';
    if (path.startsWith('/profile')) return 'Profile';
    
    return 'SmartCare WebApp';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 lg:ml-0 text-xl lg:text-2xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Search..."
                />
              </div>
            </div>
            <button
              type="button"
              className="ml-4 p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;