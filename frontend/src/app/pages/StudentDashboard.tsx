import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getCurrentUser } from '../lib/storage';
import { reservationsApi, mapReservationFromApi } from '../lib/api';
import { ReservationCard } from '../components/ReservationCard';
import { Calendar, Clock, Plus, History, LayoutDashboard, IdCard, GraduationCap, Mail } from 'lucide-react';
import { User, Reservation } from '../types';

export function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const cargarReservas = async () => {
      if (!currentUser) return;
      try {
        const response = await reservationsApi.getUserReservations();
        const apiReservations = response.data.map(mapReservationFromApi);
        const active = apiReservations.filter((r: Reservation) => r.status === 'active');
        setActiveReservations(active);
        setTotalReservations(apiReservations.length);
        setTotalHours(active.reduce((sum: number, r: Reservation) => sum + r.duration, 0));
      } catch (err: any) {
        console.error(err);
      }
    };

    cargarReservas();
  }, []);

      setActiveReservations(active);
      const all = getUserReservations(currentUser.id);
      setTotalReservations(all.length);
      setTotalHours(active.reduce((sum: number, r: any) => sum + r.duration, 0));
    }
>>>>>>> 2222813dfdb7e8e71116172a75bbfe029d891962
  }, []);

  const getSaludo = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Portal estudiantil · AulaFácil</p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getSaludo()}, {user?.name}!
            </h1>
            <p className="text-blue-100 mt-1 text-sm">
              Gestiona tus reservas de aulas universitarias desde aquí.
            </p>
          </div>
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de perfil del estudiante */}
      <Card className="border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#2563eb]" />
            Mi perfil estudiantil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Código estudiantil */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
                <IdCard className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Código estudiantil</p>
                <p className="font-bold text-gray-900 font-mono tracking-wider text-sm truncate">
                  {user?.studentId ?? '—'}
                </p>
              </div>
            </div>

            {/* Facultad */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Facultad</p>
                <p className="font-semibold text-gray-900 text-sm truncate">{user?.faculty ?? '—'}</p>
              </div>
            </div>

            {/* Correo */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Correo</p>
                <p className="font-semibold text-gray-900 text-sm truncate">{user?.email ?? '—'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Reservas activas</p>
                <p className="text-3xl font-bold text-[#2563eb]">{activeReservations.length}</p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#2563eb]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total reservas</p>
                <p className="text-3xl font-bold text-gray-900">{totalReservations}</p>
              </div>
              <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Horas reservadas</p>
                <p className="text-3xl font-bold text-green-600">{totalHours}</p>
                <p className="text-xs text-gray-400">de 4 h máx. por reserva</p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>¿Qué deseas hacer hoy?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/app/reserve">
              <Button className="w-full h-auto flex flex-col items-center gap-2 py-5 bg-[#2563eb] hover:bg-[#1d4ed8]">
                <Plus className="w-6 h-6" />
                <span className="text-xs">Reservar aula</span>
              </Button>
            </Link>

            <Link to="/app/classrooms">
              <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 py-5">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-xs">Ver aulas</span>
              </Button>
            </Link>

            <Link to="/app/calendar">
              <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 py-5">
                <Calendar className="w-6 h-6" />
                <span className="text-xs">Calendario</span>
              </Button>
            </Link>

            <Link to="/app/history">
              <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 py-5">
                <History className="w-6 h-6" />
                <span className="text-xs">Mi historial</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Reservas activas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis reservas activas</CardTitle>
              <CardDescription>Tus próximas reservas de aulas</CardDescription>
            </div>
            <Link to="/app/history">
              <Button variant="ghost" size="sm" className="text-[#2563eb]">Ver todo</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No tienes reservas activas</p>
              <Link to="/app/reserve">
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Hacer una reserva
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeReservations.slice(0, 4).map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
