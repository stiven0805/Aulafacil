from rest_framework import serializers
from .models import Reservation
from django.utils import timezone
from datetime import timedelta

class ReservationSerializer(serializers.ModelSerializer):

    def validate(self, data):
        sala = data['sala']
        inicio = data['start_datetime']
        fin = data['end_datetime']

        # 🔴 validar que fin > inicio
        if inicio >= fin:
            raise serializers.ValidationError(
                "La fecha/hora de fin debe ser posterior a la de inicio"
            )

        # 🔥 VALIDAR LÍMITE DE 2 SEMANAS
        now = timezone.now()
        limite = now + timedelta(days=14)

        if inicio > limite:
            raise serializers.ValidationError(
                "Solo puedes reservar con máximo 2 semanas de anticipación"
            )

        # 🔥 VALIDAR CONFLICTOS
        conflictos = Reservation.objects.filter(
            sala=sala,
            start_datetime__lt=fin,
            end_datetime__gt=inicio
        )

        if conflictos.exists():
            raise serializers.ValidationError(
                "Esta aula ya está reservada en ese horario"
            )

        return data

    class Meta:
        model = Reservation
        fields = '__all__'