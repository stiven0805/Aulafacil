import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  GraduationCap,
  LogOut,
  Bell,
  Menu,
  X,
  Home,
  Calendar,
  Plus,
  History,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentUser, logout, getNotifications } from '../lib/storage';
import { MobileNav } from '../components/MobileNav';
import { Badge } from '../components/ui/badge';

interface MainLayoutProps {
  isAdmin?: boolean;
}

export function MainLayout({ isAdmin = false }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const notifications = getNotifications(currentUser.id);
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNavItems = [
    { path: '/app/dashboard',  icon: Home,            label: 'Inicio' },
    { path: '/app/classrooms', icon: LayoutDashboard, label: 'Aulas' },
    { path: '/app/calendar',   icon: Calendar,        label: 'Calendario' },
    { path: '/app/reserve',    icon: Plus,            label: 'Reservar' },
    { path: '/app/history',    icon: History,         label: 'Historial' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Panel Admin' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 leading-none">AulaFácil</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAdmin ? 'Panel de administración' : 'Portal estudiantil'}
                </p>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-[#2563eb]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Acciones derecha */}
            <div className="flex items-center gap-2">
              {/* Campana de notificaciones */}
              {!isAdmin && (
                <Link to="/app/notifications" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Info usuario + logout (desktop) */}
              <div className="hidden md:flex items-center gap-3 ml-1 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.faculty}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>

              {/* Botón menú móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {/* Info usuario */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.faculty}</p>
                </div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-[#2563eb]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full text-sm font-medium mt-1"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Nav inferior móvil */}
      {!isAdmin && <MobileNav />}
    </div>
  );
}
