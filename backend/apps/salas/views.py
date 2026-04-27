from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import Sala
from .serializers import SalaSerializer
from apps.reservations.models import Reservation


class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

    @action(detail=True, methods=["get"])
    def disponibilidad(self, request, pk=None):
        sala = self.get_object()

        fecha_str = request.query_params.get("fecha")
        if not fecha_str:
            return Response({"error": "Debe enviar ?fecha=YYYY-MM-DD"}, status=400)

        fecha = timezone.datetime.strptime(fecha_str, "%Y-%m-%d").date()

        inicio_dia = timezone.make_aware(
            timezone.datetime.combine(fecha, timezone.datetime.min.time())
        ).replace(hour=8)

        fin_dia = inicio_dia.replace(hour=18)

        bloques = []
        actual = inicio_dia

        while actual + timedelta(hours=2) <= fin_dia:
            bloques.append({
                "inicio": actual,
                "fin": actual + timedelta(hours=2)
            })
            actual += timedelta(hours=2)

        reservas = Reservation.objects.filter(
            sala=sala,
            start_datetime__date=fecha,
            is_active=True
        )

        disponibles = []

        for bloque in bloques:
            ocupado = reservas.filter(
                start_datetime__lt=bloque["fin"],
                end_datetime__gt=bloque["inicio"]
            ).exists()

            if not ocupado:
                disponibles.append(bloque)

        return Response({
            "sala": sala.id,
            "fecha": fecha,
            "disponibles": disponibles
        })