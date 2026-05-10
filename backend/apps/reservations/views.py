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
    