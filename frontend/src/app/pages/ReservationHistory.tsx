import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ReservationCard } from '../components/ReservationCard';
import { getCurrentUser } from '../lib/storage';
import { reservationsApi, mapReservationFromApi } from '../lib/api';
import { Reservation } from '../types';
import { Calendar, AlertCircle, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

type TabId = 'todas' | 'activas' | 'completadas' | 'canceladas';

function TabBtn({ active, onClick, label, count }: {
  active: boolean; onClick: () => void; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
        ${active
          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-100'
          : 'text-gray-500 hover:bg-gray-100'}
      `}
    >
      {label}
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        {count}
      </span>
    </button>
  );
}

function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="text-center py-14">
      <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">{mensaje}</p>
    </div>
  );
}

export function ReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('todas');

  useEffect(() => {
    cargarReservas();
  }, []);

<<<<<<< HEAD
  const cargarReservas = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await reservationsApi.getUserReservations();
      const apiReservations = response.data
        .map(mapReservationFromApi)
        .sort((a: Reservation, b: Reservation) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      setReservations(apiReservations);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudieron cargar tus reservas.');
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }
    try {
      await reservationsApi.cancel(id);
      await cargarReservas();
      toast.success('Reserva cancelada exitosamente');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'No se pudo cancelar la reserva.');
=======
  const cargarReservas = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userReservations = getUserReservations(currentUser.id);
      userReservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReservations(userReservations);
    }
  };

  const handleCancelar = (id: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      cancelReservation(id);
      cargarReservas();
      toast.success('Reserva cancelada exitosamente');
>>>>>>> 2222813dfdb7e8e71116172a75bbfe029d891962
    }
  };

  const activas     = reservations.filter(r => r.status === 'active');
  const completadas = reservations.filter(r => r.status === 'completed');
  const canceladas  = reservations.filter(r => r.status === 'cancelled');

  const listaActual = activeTab === 'todas'       ? reservations
                    : activeTab === 'activas'     ? activas
                    : activeTab === 'completadas' ? completadas
                    : canceladas;

  const mensajesVacios: Record<TabId, string> = {
    todas:       'Aún no tienes reservas',
    activas:     'No tienes reservas activas',
    completadas: 'No tienes reservas completadas',
    canceladas:  'No tienes reservas canceladas',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '1.625rem' }}>Historial de reservas</h1>
        <p className="text-gray-500 text-sm">Visualiza y gestiona todas tus reservas de aulas</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-800">{reservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#2563eb]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Activas</p>
                <p className="text-2xl font-bold text-[#2563eb]">{activas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{completadas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Canceladas</p>
                <p className="text-2xl font-bold text-red-500">{canceladas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reservas */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Mis reservas</CardTitle>
          <CardDescription>Filtra tu historial de reservas por estado</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            <TabBtn active={activeTab === 'todas'}       onClick={() => setActiveTab('todas')}       label="Todas"       count={reservations.length} />
            <TabBtn active={activeTab === 'activas'}     onClick={() => setActiveTab('activas')}     label="Activas"     count={activas.length} />
            <TabBtn active={activeTab === 'completadas'} onClick={() => setActiveTab('completadas')} label="Completadas" count={completadas.length} />
            <TabBtn active={activeTab === 'canceladas'}  onClick={() => setActiveTab('canceladas')}  label="Canceladas"  count={canceladas.length} />
          </div>

          {/* Aviso para activas */}
          {activeTab === 'activas' && activas.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Puedes cancelar tus reservas activas si tus planes cambian.
            </div>
          )}

          {/* Contenido */}
          {listaActual.length === 0 ? (
            <EstadoVacio mensaje={mensajesVacios[activeTab]} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listaActual.map(reservation => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancelar}
                  showActions={activeTab !== 'canceladas' && activeTab !== 'completadas'}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
