import { Reservation } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock, Users, GraduationCap, X } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

const ESTADO_LABELS: Record<string, string> = {
  active:    'Activa',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const ESTADO_COLORES: Record<string, string> = {
  active:    'bg-blue-100 text-blue-700 border border-blue-200',
  completed: 'bg-green-100 text-green-700 border border-green-200',
  cancelled: 'bg-red-100 text-red-600 border border-red-200',
};

const BARRA_COLORES: Record<string, string> = {
  active:    'bg-[#2563eb]',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

export function ReservationCard({ reservation, onCancel, showActions = true }: ReservationCardProps) {
  const formatearFecha = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Barra de color por estado */}
      <div className={`h-1 w-full ${BARRA_COLORES[reservation.status] ?? 'bg-gray-200'}`} />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{reservation.classroomName}</CardTitle>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${ESTADO_COLORES[reservation.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {ESTADO_LABELS[reservation.status] ?? reservation.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatearFecha(reservation.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{reservation.startTime} – {reservation.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{reservation.numberOfPeople} personas</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{reservation.faculty}</span>
          </div>
        </div>

        {showActions && reservation.status === 'active' && onCancel && (
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(reservation.id)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar reserva
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
