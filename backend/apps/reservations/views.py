from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Reservation
from .serializers import ReservationSerializer
from apps.salas.models import Sala


from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from django.contrib.auth.models import User

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(f"--- NUEVO INTENTO DE REGISTRO ---")
        print(f"Data recibida: {request.data}")
        
        username = request.data.get('email') # Use email as username
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')

        if not username or not password:
            print("Error: Email o password faltantes")
            return Response({'detail': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            print(f"Error: El usuario {username} ya existe")
            return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.first_name = name
            user.save()
            print(f"ÉXITO: Usuario {username} creado.")
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"ERROR FATAL en create_user: {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
    