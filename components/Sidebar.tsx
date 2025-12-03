'use client';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import MonitorOutlined from '@mui/icons-material/MonitorOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = 'trips' }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: DashboardOutlined, label: 'Dashboard' },
    { id: 'screens', icon: MonitorOutlined, label: 'Screens' },
    { id: 'tags', icon: LocalOfferOutlined, label: 'Tags' },
    { id: 'users', icon: PeopleOutlined, label: 'Users' },
    { id: 'trips', icon: LocalShippingOutlined, label: 'Trips' },
    { id: 'analytics', icon: BarChartOutlined, label: 'Analytics' },
  ];

  return (
    <aside className="w-16 bg-white flex flex-col items-center py-4 border-r border-gray-200">
      {/* Leta Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-[#EF4444] rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L8 8H12V16L16 10H12V2Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;

          return (
            <button
              key={item.id}
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                transition-colors duration-200
                ${isActive
                  ? 'bg-[#EF4444] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.label}
              aria-label={item.label}
            >
              <Icon sx={{ fontSize: 20 }} />
            </button>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <button
        className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 mb-4"
        title="Settings"
        aria-label="Settings"
      >
        <SettingsOutlined sx={{ fontSize: 20 }} />
      </button>

      {/* User Profile Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <span className="text-white text-sm font-semibold">A</span>
      </div>
    </aside>
  );
}
