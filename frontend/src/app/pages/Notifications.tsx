import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getCurrentUser, getNotifications, markNotificationAsRead } from '../lib/storage';
import { Notification } from '../types';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const userNotifications = getNotifications(currentUser.id);
      userNotifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(userNotifications);
    }
  };

  const handleMarcarLeida = (id: string) => {
    markNotificationAsRead(id);
    cargarNotificaciones();
  };

  const handleMarcarTodasLeidas = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
    cargarNotificaciones();
  };

  const noLeidas = notifications.filter(n => !n.read).length;

  const getIcono = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':   return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorFondo = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error':   return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default:        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatearFecha = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);

    if (diffMins < 1)  return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7)   return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '1.625rem' }}>Notificaciones</h1>
          <p className="text-gray-500 text-sm">Mantente al día con tus reservas y alertas</p>
        </div>
        {noLeidas > 0 && (
          <Button onClick={handleMarcarTodasLeidas} variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#2563eb]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Sin leer</p>
                <p className="text-3xl font-bold text-[#2563eb]">{noLeidas}</p>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                {noLeidas > 0
                  ? <Badge className="text-sm bg-[#2563eb]">{noLeidas}</Badge>
                  : <CheckCircle2 className="w-5 h-5 text-green-500" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las notificaciones</CardTitle>
          <CardDescription>Actualizaciones recientes y alertas del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-14">
              <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No tienes notificaciones aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    n.read ? 'bg-white border-gray-100 opacity-60' : getColorFondo(n.type)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcono(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{n.title}</h3>
                        {!n.read && (
                          <Badge variant="default" className="bg-[#2563eb] flex-shrink-0 text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">{formatearFecha(n.createdAt)}</p>
                        {!n.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarcarLeida(n.id)}
                            className="text-[#2563eb] hover:text-[#1d4ed8] text-xs h-7 px-2"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
