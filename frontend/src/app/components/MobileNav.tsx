import { Link, useLocation } from 'react-router';
import { Home, Calendar, Plus, History, LayoutDashboard } from 'lucide-react';

const navItems = [
  { path: '/app/dashboard',  icon: Home,            label: 'Inicio' },
  { path: '/app/classrooms', icon: LayoutDashboard, label: 'Aulas' },
  { path: '/app/reserve',    icon: Plus,            label: 'Reservar' },
  { path: '/app/calendar',   icon: Calendar,        label: 'Calendario' },
  { path: '/app/history',    icon: History,         label: 'Historial' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? 'text-[#2563eb]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
