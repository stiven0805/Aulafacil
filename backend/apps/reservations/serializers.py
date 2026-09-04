from rest_framework import serializers
from .models import Reservation
from django.utils import timezone
from datetime import timedelta
from apps.salas.models import Sala
from pytz import timezone as pytz_timezone

class ReservationSerializer(serializers.ModelSerializer):
    sala = serializers.PrimaryKeyRelatedField(queryset=Sala.objects.all())
    classroomName = serializers.CharField(source='sala.nombre', read_only=True)
    userId = serializers.IntegerField(source='user.id', read_only=True)
    userName = serializers.CharField(source='user.first_name', read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    startTime = serializers.SerializerMethodField(read_only=True)
    endTime = serializers.SerializerMethodField(read_only=True)
    duration = serializers.SerializerMethodField(read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    numberOfPeople = serializers.IntegerField(source='number_of_people')
    faculty = serializers.CharField(allow_blank=True)


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
            end_datetime__gt=inicio,
            is_active=True,
        )

        if conflictos.exists():
            raise serializers.ValidationError(
                "Esta aula ya está reservada en ese horario"
            )

        return data

    def get_date(self, obj):
        # Convertir a zona horaria de Colombia antes de extraer la fecha
        colombia_tz = pytz_timezone('America/Bogota')
        local_dt = obj.start_datetime.astimezone(colombia_tz)
        return local_dt.date().isoformat()

    def get_startTime(self, obj):
        # Convertir a zona horaria de Colombia
        colombia_tz = pytz_timezone('America/Bogota')
        local_dt = obj.start_datetime.astimezone(colombia_tz)
        return local_dt.strftime('%H:%M')

    def get_endTime(self, obj):
        # Convertir a zona horaria de Colombia
        colombia_tz = pytz_timezone('America/Bogota')
        local_dt = obj.end_datetime.astimezone(colombia_tz)
        return local_dt.strftime('%H:%M')

    def get_duration(self, obj):
        return int((obj.end_datetime - obj.start_datetime).total_seconds() / 3600)

    def get_status(self, obj):
        if not obj.is_active:
            return 'cancelled'
        if obj.end_datetime < timezone.now():
            return 'completed'
        return 'active'

    class Meta:
        model = Reservation
        fields = [
            'id', 'sala', 'classroomName', 'userId', 'userName',
            'faculty', 'numberOfPeople', 'date', 'startTime', 'endTime',
            'duration', 'status', 'created_at', 'cancelled_at',
            'is_active', 'notified', 'start_datetime', 'end_datetime',
        ]
        read_only_fields = ['created_at', 'cancelled_at', 'is_active', 'notified']

