import logging

from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Reservation, UserProfile
from .serializers import ReservationSerializer
from .twilio_utils import send_reservation_sms
from apps.salas.models import Sala

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('email') # Use email as username
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')
        faculty = request.data.get('faculty', '').strip()

        if not username or not password:
            return Response({'detail': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.first_name = name
            # Guardar el código estudiantil como último nombre (last_name)
            student_id = request.data.get('studentId', '')
            user.last_name = student_id
            user.save()
            UserProfile.objects.create(user=user, faculty=faculty)
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception('Error al crear usuario')
            return Response(
                {'detail': 'No se pudo crear el usuario.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('sala', 'user').all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in {'update', 'partial_update', 'destroy'}:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        reservation = serializer.save(user=self.request.user)
        try:
            send_reservation_sms(reservation)
        except Exception as exc:
            logger.warning('No se pudo enviar SMS de Twilio: %s', exc)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.user_id != request.user.id and not request.user.is_staff:
            return Response(
                {"detail": "No puedes cancelar una reserva de otro usuario."},
                status=status.HTTP_403_FORBIDDEN
            )
        if not reservation.is_active:
            return Response(
                {"detail": "La reserva ya está cancelada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reservation.start_datetime <= timezone.now():
            return Response(
                {"detail": "No se puede cancelar una reserva que ya inició."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.is_active = False
        reservation.cancelled_at = timezone.now()
        reservation.save(update_fields=["is_active", "cancelled_at"])

        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Devuelve las reservas del usuario autenticado."""
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        reservas = Reservation.objects.filter(user=user)
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)

    # 🔥 👇 AQUÍ ADENTRO
    @action(detail=False, methods=["get"])
    def aulas_disponibles(self, request):
        start = request.GET.get("start")
        end = request.GET.get("end")

        if not start or not end:
            return Response(
                {"detail": "Faltan parámetros start y end"},
                status=status.HTTP_400_BAD_REQUEST
            )

        start_dt = parse_datetime(start)
        end_dt = parse_datetime(end)

        if not start_dt or not end_dt:
            return Response(
                {"detail": "Formato de fecha inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservas = Reservation.objects.filter(
            start_datetime__lt=end_dt,
            end_datetime__gt=start_dt,
            is_active=True
        )

        salas_ocupadas = reservas.values_list("sala_id", flat=True)

        salas = Sala.objects.filter(activa=True).exclude(id__in=salas_ocupadas)

        data = [
            {
                "id": s.id,
                "nombre": s.nombre,
                "capacidad": s.capacidad,
                "activa": s.activa
            }
            for s in salas
        ] 


        return Response(data)

    @action(detail=True, methods=["post"])
    def send_sms(self, request, pk=None):
        reservation = self.get_object()
        if reservation.user_id != request.user.id and not request.user.is_staff:
            return Response(
                {"detail": "No puedes notificar una reserva de otro usuario."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            sent = send_reservation_sms(reservation)
            return Response({"sent": sent}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.error('Error al enviar SMS de Twilio: %s', exc)
            return Response(
                {"detail": "No se pudo enviar el SMS."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user
        return Response({
            'id': str(user.id),
            'name': user.first_name or user.username,
            'email': user.email or user.username,
            'studentId': user.last_name or '',
            'role': 'admin' if user.is_staff else 'student',
            'blocked': not user.is_active,
            'faculty': getattr(getattr(user, 'profile', None), 'faculty', ''),
        })

    @action(detail=True, methods=['patch'])
    def set_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {"detail": "No puedes bloquear tu propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = bool(request.data.get('active', True))
        user.save(update_fields=['is_active'])
        return Response({'id': str(user.id), 'active': user.is_active})
    
    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        data = []
        for u in users:
            data.append({
                'id': str(u.id),
                'name': u.first_name or u.username,
                'email': u.email or u.username,
                'studentId': u.last_name or '',
                'role': 'admin' if u.is_staff else 'student',
                'blocked': not u.is_active,
                'faculty': getattr(getattr(u, 'profile', None), 'faculty', ''),
            })
        return Response(data)