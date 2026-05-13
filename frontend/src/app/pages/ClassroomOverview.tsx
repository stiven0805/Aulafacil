import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { salasApi, reservationsApi, mapReservationFromApi } from '../lib/api';
import { getClassroomStates } from '../lib/storage';
import { ClassroomCard } from '../components/ClassroomCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Classroom } from '../types';
import { DoorOpen, Info } from 'lucide-react';

export function ClassroomOverview() {
  const navigate = useNavigate();
  const [classroomStatus, setClassroomStatus] = useState<Classroom[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salasRes, resRes] = await Promise.all([
          salasApi.getAll(),
          reservationsApi.getAll()
        ]);
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
        const disabledStates = getClassroomStates();
        const reservations = resRes.data.map(mapReservationFromApi);

        const updatedClassrooms = salasRes.data.map((r: any) => {
          const classroom = {
            id: String(r.id), name: r.nombre, capacity: r.capacidad, hasTV: false, hasWhiteboard: false, status: r.activa ? 'available' : 'disabled'
          };
          if (disabledStates[classroom.id]) {
            return { ...classroom, status: 'disabled' as const };
          }
          const isOccupied = reservations.some((res: any) =>
            res.classroomId === classroom.id &&
            res.date === today &&
            res.status === 'active' &&
            currentTime >= res.startTime &&
            currentTime < res.endTime
          );
          return { ...classroom, status: isOccupied ? 'occupied' as const : 'available' as const };
        });

        setClassroomStatus(updatedClassrooms);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleAulaClick = (classroomId: string) => {
    const cls = classroomStatus.find(c => c.id === classroomId);
    if (cls?.status !== 'disabled') {
      navigate(`/app/reserve/${classroomId}`);
    }
  };

  const disponibles  = classroomStatus.filter(c => c.status === 'available').length;
  const ocupadas     = classroomStatus.filter(c => c.status === 'occupied').length;
  const inhabilitadas = classroomStatus.filter(c => c.status === 'disabled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '1.625rem' }}>Aulas</h1>
        <p className="text-gray-500 text-sm">Explora las aulas disponibles y realiza una reserva</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total aulas</p>
              <p className="text-3xl font-bold text-gray-900">{classroomStatus.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{disponibles}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Ocupadas</p>
              <p className="text-3xl font-bold text-red-500">{ocupadas}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Cap. máxima</p>
              <p className="text-3xl font-bold text-[#2563eb]">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de inhabilitadas */}
      {inhabilitadas > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
          <Info className="w-4 h-4 flex-shrink-0" />
          {inhabilitadas === 1
            ? 'Hay 1 aula inhabilitada temporalmente por el administrador.'
            : `Hay ${inhabilitadas} aulas inhabilitadas temporalmente por el administrador.`}
        </div>
      )}

      {/* Tarjetas de aulas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Estado actual de aulas</h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              Ocupada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
              Inhabilitada
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classroomStatus.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onClick={() => handleAulaClick(classroom.id)}
            />
          ))}
        </div>
      </div>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-[#2563eb]" />
            Características de las aulas
          </CardTitle>
          <CardDescription>Todas las aulas están equipadas con tecnología moderna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📺</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Televisor</p>
                <p className="text-sm text-gray-500 mt-0.5">Todas las aulas cuentan con TV</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📝</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pizarrón</p>
                <p className="text-sm text-gray-500 mt-0.5">3 de 4 aulas tienen pizarrón</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Capacidad</p>
                <p className="text-sm text-gray-500 mt-0.5">Hasta 12 personas por aula</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
