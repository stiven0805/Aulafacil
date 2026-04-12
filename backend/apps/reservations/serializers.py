from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    sala_nombre = serializers.CharField(source='sala.nombre', read_only=True)

    class Meta:
        model = Reservation
        fields = (
            "id",
            "sala",
            "sala_nombre",
            "user",
            "start_datetime",
            "end_datetime",
            "is_active",
        )
        read_only_fields = ("user", "is_active")

    def validate(self, data):
        start = data["start_datetime"]
        end = data["end_datetime"]

        # Duración fija
        if end - start != timedelta(hours=2):
            raise serializers.ValidationError(
                "La reserva debe durar exactamente 2 horas"
            )

        # Semana actual o futura
        if start < timezone.now():
            raise serializers.ValidationError(
                "No se puede reservar en el pasado"
            )

        return data

    def create(self, validated_data):
        user = self.context["request"].user
        reservation = Reservation(
            user=user,
            **validated_data
        )
        reservation.full_clean()
        reservation.save()
        return reservation
