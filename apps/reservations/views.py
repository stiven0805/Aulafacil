from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Reservation
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reservation = self.get_object()

        try:
            reservation.cancel()
        except ValidationError as e:
            return Response(
                {"detail": e.message},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"detail": "Reserva cancelada correctamente"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def current_week(self, request):
        now = timezone.now()
        start_week = now - timezone.timedelta(days=now.weekday())
        end_week = start_week + timezone.timedelta(days=7)

        reservations = Reservation.objects.filter(
            start_datetime__gte=start_week,
            start_datetime__lt=end_week,
            is_active=True
        )

        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)
