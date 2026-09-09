import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  cancelReservation,
} from '../lib/storage';
import { salasApi, reservationsApi, usersApi, mapReservationFromApi } from '../lib/api';
import { toast } from 'sonner';
import { Reservation, User, Classroom } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, Calendar, DoorOpen, TrendingUp, ToggleLeft, ToggleRight,
  Ban, CheckCircle2, XCircle, Download, AlertTriangle, ShieldCheck,
  ShieldOff, BookOpen, BarChart3, FileDown, Search, X as XIcon,
} from 'lucide-react';

// ─── Confirm dialog ──────────────────────────────────────────────────────────

function ConfirmDialog({
  open, title, message, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  confirmClass?: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button
            className={`flex-1 ${confirmClass ?? 'bg-red-600 hover:bg-red-700 text-white'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab nav button ──────────────────────────────────────────────────────────

function TabBtn({
  active, onClick, icon, label, badge,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
        ${active
          ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200'
          : 'text-gray-600 hover:bg-gray-100'}
      `}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Activa',     cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Completada', cls: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelada',  cls: 'bg-red-100 text-red-600 border-red-200' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type TabId = 'stats' | 'classrooms' | 'reservations' | 'users' | 'export';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classroomStates, setClassroomStates] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel: string; confirmClass?: string; action: () => void;
  }>({ open: false, title: '', message: '', confirmLabel: '', action: () => {} });

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const reload = useCallback(() => {
    reservationsApi.getAll().then(res => setReservations(res.data.map(mapReservationFromApi)));
    usersApi.getAll().then(res => setUsers(res.data));
    salasApi.getAll().then(res => {
      const rooms = res.data.map((r: any) => ({
        id: String(r.id), name: r.nombre, capacity: r.capacidad, hasTV: true, hasWhiteboard: true, status: r.activa ? 'available' : 'disabled'
      }));
      setClassrooms(rooms);
      setClassroomStates(Object.fromEntries(
        res.data.map((room: any) => [String(room.id), !room.activa])
      ));
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const activeReservations = reservations.filter(r => r.status === 'active');
  const uniqueUsers = new Set(reservations.map(r => r.userId)).size;
  const totalHours = reservations.reduce((s, r) => s + r.duration, 0);
  const occupancy = classrooms.length > 0 ? Math.round((totalHours / (classrooms.length * 10 * 30)) * 100) : 0;

  const classroomUsageData = classrooms.map(cls => ({
    name: cls.name,
    Reservas: reservations.filter(r => r.classroomId === cls.id).length,
    Horas: reservations.filter(r => r.classroomId === cls.id).reduce((s, r) => s + r.duration, 0),
  }));

  const statusData = [
    { name: 'Activas',    value: reservations.filter(r => r.status === 'active').length,    color: '#2563eb' },
    { name: 'Completadas',value: reservations.filter(r => r.status === 'completed').length,  color: '#22c55e' },
    { name: 'Canceladas', value: reservations.filter(r => r.status === 'cancelled').length,  color: '#ef4444' },
  ];

  const facultyMap = reservations.reduce((acc, r) => {
    acc[r.faculty] = (acc[r.faculty] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  const facultyData = Object.entries(facultyMap)
    .map(([name, count]) => ({ name, Reservas: count }))
    .sort((a, b) => b.Reservas - a.Reservas).slice(0, 6);

  // ── Confirm helper ─────────────────────────────────────────────────────────

  function askConfirm(opts: Omit<typeof confirm, 'open'>) {
    setConfirm({ open: true, ...opts });
  }
  function closeConfirm() {
    setConfirm(c => ({ ...c, open: false }));
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function handleToggleClassroom(id: string, currentlyDisabled: boolean) {
    const cls = classrooms.find(c => c.id === id);
    askConfirm({
      title: currentlyDisabled ? `Habilitar ${cls?.name}` : `Inhabilitar ${cls?.name}`,
      message: currentlyDisabled
        ? `¿Confirmas que deseas habilitar ${cls?.name}? Los estudiantes podrán reservarla nuevamente.`
        : `¿Confirmas que deseas inhabilitar ${cls?.name}? No podrán hacerse nuevas reservas en ella.`,
      confirmLabel: currentlyDisabled ? 'Habilitar' : 'Inhabilitar',
      confirmClass: currentlyDisabled
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-red-600 hover:bg-red-700 text-white',
      action: async () => {
        try {
          await salasApi.setActive(id, currentlyDisabled);
          reload();
          closeConfirm();
        } catch {
          toast.error('No se pudo actualizar el estado del aula');
        }
      },
    });
  }

  function handleCancelReservation(res: Reservation) {
    askConfirm({
      title: 'Cancelar reserva',
      message: `¿Cancelar la reserva de ${res.userName} en ${res.classroomName} el ${res.date} de ${res.startTime} a ${res.endTime}?`,
      confirmLabel: 'Sí, cancelar',
      action: async () => {
        try {
          await reservationsApi.cancel(res.id);
          toast.success("Reserva cancelada exitosamente");
          reload();
          closeConfirm();
        } catch (err) {
          toast.error("Error al cancelar la reserva");
        }
      },
    });
  }

  function handleBlockUser(user: User, block: boolean) {
    askConfirm({
      title: block ? `Bloquear a ${user.name}` : `Desbloquear a ${user.name}`,
      message: block
        ? `${user.name} no podrá iniciar sesión ni realizar reservas mientras esté bloqueado.`
        : `${user.name} recuperará acceso completo al sistema.`,
      confirmLabel: block ? 'Bloquear' : 'Desbloquear',
      confirmClass: block
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-green-600 hover:bg-green-700 text-white',
      action: async () => {
        try {
          await usersApi.setActive(user.id, !block);
          reload();
          closeConfirm();
        } catch {
          toast.error('No se pudo actualizar el estado del usuario');
        }
      },
    });
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────

  function exportCSV(data: object[], filename: string) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => JSON.stringify((row as Record<string,unknown>)[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function exportReservations() {
    const data = reservations.map(r => ({
      ID: r.id,
      Aula: r.classroomName,
      Estudiante: r.userName,
      Facultad: r.faculty,
      Personas: r.numberOfPeople,
      Fecha: r.date,
      'Hora Inicio': r.startTime,
      'Hora Fin': r.endTime,
      'Duración (h)': r.duration,
      Estado: r.status,
      'Creado': r.createdAt,
    }));
    exportCSV(data, `aulafacil_reservas_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportUsersCSV() {
    const data = users.map(u => ({
      ID: u.id,
      Nombre: u.name,
      Email: u.email,
      Facultad: u.faculty,
      Rol: u.role,
      Bloqueado: u.blocked ? 'Sí' : 'No',
      Reservas: reservations.filter(r => r.userId === u.id).length,
    }));
    exportCSV(data, `aulafacil_usuarios_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportStats() {
    const data = [
      { Métrica: 'Total reservas', Valor: reservations.length },
      { Métrica: 'Reservas activas', Valor: activeReservations.length },
      { Métrica: 'Usuarios únicos', Valor: uniqueUsers },
      { Métrica: 'Total horas reservadas', Valor: totalHours },
      { Métrica: 'Ocupación promedio (%)', Valor: occupancy },
      ...classrooms.map(cls => ({
        Métrica: `${cls.name} - reservas`,
        Valor: reservations.filter(r => r.classroomId === cls.id).length,
      })),
    ];
    exportCSV(data, `aulafacil_estadisticas_${new Date().toISOString().slice(0,10)}.csv`);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.625rem' }}>Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona aulas, reservas y usuarios de AulaFácil</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
          Modo administrador
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total reservas"   value={reservations.length}      icon={<Calendar className="w-5 h-5 text-blue-600" />}   color="text-blue-600" />
        <MetricCard label="Reservas activas" value={activeReservations.length} icon={<DoorOpen className="w-5 h-5 text-green-600" />}  color="text-green-600" sub={`${reservations.filter(r=>r.status==='cancelled').length} canceladas`} />
        <MetricCard label="Usuarios"          value={users.length}             icon={<Users className="w-5 h-5 text-purple-600" />}    color="text-purple-600" sub={`${users.filter(u=>u.blocked).length} bloqueados`} />
        <MetricCard label="Ocupación"         value={`${occupancy}%`}          icon={<TrendingUp className="w-5 h-5 text-amber-600" />} color="text-amber-600" sub={`${totalHours} horas totales`} />
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <TabBtn active={activeTab==='stats'}        onClick={() => setActiveTab('stats')}        icon={<BarChart3 className="w-4 h-4" />}   label="Estadísticas" />
        <TabBtn active={activeTab==='classrooms'}   onClick={() => setActiveTab('classrooms')}   icon={<DoorOpen className="w-4 h-4" />}    label="Aulas" badge={Object.values(classroomStates).filter(Boolean).length} />
        <TabBtn active={activeTab==='reservations'} onClick={() => setActiveTab('reservations')} icon={<BookOpen className="w-4 h-4" />}    label="Reservas" badge={activeReservations.length} />
        <TabBtn active={activeTab==='users'}        onClick={() => setActiveTab('users')}        icon={<Users className="w-4 h-4" />}       label="Usuarios" badge={users.filter(u=>u.blocked).length} />
        <TabBtn active={activeTab==='export'}       onClick={() => setActiveTab('export')}       icon={<FileDown className="w-4 h-4" />}    label="Exportar" />
      </div>

      {/* ── TAB: Stats ── */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Usage bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Uso por aula</CardTitle>
                <CardDescription>Reservas y horas totales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classroomUsageData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Reservas" fill="#2563eb" radius={[4,4,0,0]} />
                      <Bar dataKey="Horas"    fill="#22c55e" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estado de reservas</CardTitle>
                <CardDescription>Distribución por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={90}
                        paddingAngle={3} dataKey="value"
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                        labelLine={false}
                      >
                        {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faculty bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reservas por facultad</CardTitle>
              <CardDescription>Top 6 facultades más activas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facultyData} layout="vertical" barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Reservas" fill="#2563eb" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: Classrooms ── */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Al inhabilitar un aula, no se podrán crear nuevas reservas en ella. Las reservas existentes no se cancelan automáticamente.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classrooms.map(cls => {
              const disabled = classroomStates[cls.id] === true;
              const clsReservations = reservations.filter(r => r.classroomId === cls.id);
              const active = clsReservations.filter(r => r.status === 'active').length;
              const total = clsReservations.length;

              return (
                <Card key={cls.id} className={`overflow-hidden transition-all ${disabled ? 'opacity-70 border-red-200' : 'border-gray-200'}`}>
                  {/* Color top strip */}
                  <div className={`h-1.5 w-full ${disabled ? 'bg-red-400' : 'bg-green-400'}`} />
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{cls.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            disabled
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {disabled ? 'Inhabilitada' : 'Habilitada'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span>👥 Capacidad: <strong className="text-gray-700">{cls.capacity} personas</strong></span>
                          <span>📅 Reservas activas: <strong className="text-gray-700">{active}</strong></span>
                          <span>📺 TV: <strong className="text-gray-700">{cls.hasTV ? 'Sí' : 'No'}</strong></span>
                          <span>📋 Pizarrón: <strong className="text-gray-700">{cls.hasWhiteboard ? 'Sí' : 'No'}</strong></span>
                          <span className="col-span-2">📊 Total reservas: <strong className="text-gray-700">{total}</strong></span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleClassroom(cls.id, disabled)}
                        className={`flex items-center gap-1.5 flex-shrink-0 ${
                          disabled
                            ? 'border-green-300 text-green-700 hover:bg-green-50'
                            : 'border-red-300 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {disabled
                          ? <><ToggleRight className="w-4 h-4" /> Habilitar</>
                          : <><ToggleLeft className="w-4 h-4" /> Inhabilitar</>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Reservations ── */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {/* Filter summary */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Total: <strong>{reservations.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-blue-600">Activas: <strong>{activeReservations.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-red-500">Canceladas: <strong>{reservations.filter(r=>r.status==='cancelled').length}</strong></span>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aula</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estudiante</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Facultad</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Horario</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                          No hay reservas registradas
                        </td>
                      </tr>
                    )}
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{res.classroomName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{res.userName}</div>
                          <div className="text-xs text-gray-400">{res.numberOfPeople} pers.</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{res.faculty}</td>
                        <td className="px-4 py-3 text-gray-600">{res.date}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{res.startTime}–{res.endTime}</td>
                        <td className="px-4 py-3"><StatusBadge status={res.status} /></td>
                        <td className="px-4 py-3 text-right">
                          {res.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleCancelReservation(res)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Cancelar
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: Users ── */}
      {activeTab === 'users' && (
        <UsersTab
          users={users}
          reservations={reservations}
          onBlock={handleBlockUser}
        />
      )}

      {/* ── TAB: Export ── */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Descarga los datos del sistema en formato CSV compatible con Excel.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Export Reservations */}
            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-[#2563eb]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Reservas</h3>
                  <p className="text-xs text-gray-400 mt-1">Todas las reservas con sus detalles</p>
                  <p className="text-2xl font-bold text-[#2563eb] mt-2">{reservations.length}</p>
                  <p className="text-xs text-gray-400">registros</p>
                </div>
                <Button
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2 mt-1"
                  onClick={exportReservations}
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </CardContent>
            </Card>

            {/* Export Users */}
            <Card className="border-purple-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Usuarios</h3>
                  <p className="text-xs text-gray-400 mt-1">Lista de usuarios y su estado</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{users.length}</p>
                  <p className="text-xs text-gray-400">usuarios</p>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 mt-1"
                  onClick={exportUsersCSV}
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </CardContent>
            </Card>

            {/* Export Stats */}
            <Card className="border-amber-100 hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Estadísticas</h3>
                  <p className="text-xs text-gray-400 mt-1">Resumen general de métricas</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{occupancy}%</p>
                  <p className="text-xs text-gray-400">ocupación promedio</p>
                </div>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2 mt-1"
                  onClick={exportStats}
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileDown className="w-4 h-4 text-gray-400" />
                Vista previa — últimas reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Aula</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Estudiante</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Fecha</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Horario</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.slice(0, 6).map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-700">{r.classroomName}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.userName}</td>
                        <td className="px-4 py-2.5 text-gray-500">{r.date}</td>
                        <td className="px-4 py-2.5 text-gray-500">{r.startTime}–{r.endTime}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin datos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmClass={confirm.confirmClass}
        onConfirm={confirm.action}
        onCancel={closeConfirm}
      />
    </div>
  );
}

// ─── Users Tab (extracted for search state isolation) ────────────────────────

function UsersTab({
  users, reservations, onBlock,
}: {
  users: User[];
  reservations: Reservation[];
  onBlock: (user: User, block: boolean) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState<'todos' | 'student' | 'admin'>('todos');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'bloqueado'>('todos');

  const filtrados = users.filter(u => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q
      || u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || (u.studentId ?? '').includes(q)
      || u.faculty.toLowerCase().includes(q);
    const matchRol    = filterRol    === 'todos' || u.role === filterRol;
    const matchEstado = filterEstado === 'todos'
      || (filterEstado === 'bloqueado' && u.blocked)
      || (filterEstado === 'activo'    && !u.blocked);
    return matchSearch && matchRol && matchEstado;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Un usuario bloqueado no podrá iniciar sesión ni crear nuevas reservas.
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código, correo o facultad…"
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro rol */}
        <select
          value={filterRol}
          onChange={e => setFilterRol(e.target.value as typeof filterRol)}
          className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
        >
          <option value="todos">Todos los roles</option>
          <option value="student">Estudiantes</option>
          <option value="admin">Administradores</option>
        </select>

        {/* Filtro estado */}
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value as typeof filterEstado)}
          className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </div>

      {/* Resultado de búsqueda */}
      {search && (
        <p className="text-xs text-gray-500">
          {filtrados.length === 0
            ? `Sin resultados para "${search}"`
            : `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''} para "${search}"`
          }
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Correo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Facultad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reservas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-14">
                      <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        {search ? `Sin resultados para "${search}"` : 'No hay usuarios registrados'}
                      </p>
                    </td>
                  </tr>
                )}
                {filtrados.map(user => {
                  const userRes = reservations.filter(r => r.userId === user.id);
                  const isAdmin = user.role === 'admin';
                  // Resaltar texto de búsqueda
                  const highlight = (text: string) => {
                    if (!search.trim()) return text;
                    const regex = new RegExp(`(${search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    const parts = text.split(regex);
                    return parts.map((part, i) =>
                      regex.test(part)
                        ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
                        : part
                    );
                  };

                  return (
                    <tr key={user.id} className={`hover:bg-gray-50/60 transition-colors ${user.blocked ? 'bg-red-50/20' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{highlight(user.name)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                          {highlight(user.studentId ?? '—')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{highlight(user.email)}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{highlight(user.faculty)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isAdmin ? 'Admin' : 'Estudiante'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{userRes.length}</td>
                      <td className="px-4 py-3">
                        {user.blocked
                          ? <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><Ban className="w-3.5 h-3.5" />Bloqueado</span>
                          : <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Activo</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin ? (
                          <span className="text-xs text-gray-300">—</span>
                        ) : user.blocked ? (
                          <Button
                            size="sm" variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50 text-xs"
                            onClick={() => onBlock(user, false)}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Desbloquear
                          </Button>
                        ) : (
                          <Button
                            size="sm" variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => onBlock(user, true)}
                          >
                            <ShieldOff className="w-3.5 h-3.5 mr-1" />
                            Bloquear
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}