import { Classroom } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tv, Grid3x3, Ban } from 'lucide-react';

interface ClassroomCardProps {
  classroom: Classroom;
  onClick?: () => void;
  showStatus?: boolean;
}

const ESTADO_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  available: { label: 'Disponible',   cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-400' },
  occupied:  { label: 'Ocupada',      cls: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400' },
  disabled:  { label: 'Inhabilitada', cls: 'bg-gray-100 text-gray-500 border-gray-200',    dot: 'bg-gray-300' },
};

export function ClassroomCard({ classroom, onClick, showStatus = true }: ClassroomCardProps) {
  const estado = ESTADO_CONFIG[classroom.status] ?? ESTADO_CONFIG.available;
  const inhabilitada = classroom.status === 'disabled';

  return (
    <Card
      className={`overflow-hidden transition-all ${
        inhabilitada
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
      }`}
      onClick={inhabilitada ? undefined : onClick}
    >
      {/* Franja de color superior */}
      <div className={`h-1.5 w-full ${estado.dot}`} />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{classroom.name}</CardTitle>
          {showStatus && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 flex items-center gap-1 ${estado.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estado.dot} flex-shrink-0`} />
              {estado.label}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>👥</span>
          <span>Máx. {classroom.capacity} personas</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {classroom.hasTV && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <Tv className="w-3.5 h-3.5" />
              <span>TV</span>
            </div>
          )}
          {classroom.hasWhiteboard && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <Grid3x3 className="w-3.5 h-3.5" />
              <span>Pizarrón</span>
            </div>
          )}
          {inhabilitada && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
              <Ban className="w-3.5 h-3.5" />
              <span>No disponible</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
