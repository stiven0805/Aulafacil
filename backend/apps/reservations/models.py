from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Reservation(models.Model):
    sala = models.ForeignKey(
        "salas.Sala",
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    is_active = models.BooleanField(default=True)
    notified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    cancelled_at = models.DateTimeField(
        blank=True,
        null=True
    )

    faculty = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    number_of_people = models.PositiveSmallIntegerField(
        default=1
    )

    class Meta:
        ordering = ["start_datetime"]

        indexes = [
            models.Index(
                fields=[
                    "sala",
                    "start_datetime",
                    "end_datetime"
                ]
            ),
        ]

    def clean(self):

        # ==========================================
        # VALIDAR FECHAS
        # ==========================================

        if self.start_datetime >= self.end_datetime:
            raise ValidationError(
                "La fecha/hora de fin debe ser posterior a la de inicio."
            )

        # ==========================================
        # DURACIÓN ENTRE 1 Y 4 HORAS
        # ==========================================

        duration = (
            self.end_datetime - self.start_datetime
        )

        if (
            duration < timedelta(hours=1)
            or duration > timedelta(hours=4)
        ):
            raise ValidationError(
                "La reserva debe durar entre 1 y 4 horas."
            )

        # ==========================================
        # NO PERMITIR RESERVAS EN EL PASADO
        # ==========================================

        if self.start_datetime < timezone.now():
            raise ValidationError(
                "No se puede reservar en el pasado."
            )

        # ==========================================
        # VALIDAR CANTIDAD DE PERSONAS
        # ==========================================

        if self.number_of_people < 1:
            raise ValidationError(
                "La reserva debe tener al menos una persona."
            )

        if self.number_of_people > self.sala.capacidad:
            raise ValidationError(
                f"La sala tiene una capacidad máxima de "
                f"{self.sala.capacidad} personas."
            )

        # ==========================================
        # VALIDAR SOLAPAMIENTO
        # ==========================================

        overlapping = Reservation.objects.filter(
            sala=self.sala,
            is_active=True,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        ).exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError(
                "La sala ya está ocupada en ese horario."
            )

    # ==========================================
    # FORZAR VALIDACIONES AL GUARDAR
    # ==========================================

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    # ==========================================
    # CANCELAR RESERVA
    # ==========================================

    def cancel(self):
        now = timezone.now()

        if not self.is_active:
            raise ValidationError(
                "La reserva ya está cancelada."
            )

        if now >= self.start_datetime:
            raise ValidationError(
                "No se puede cancelar una reserva que ya inició."
            )

        self.is_active = False
        self.cancelled_at = now

        self.save(
            update_fields=[
                "is_active",
                "cancelled_at"
            ]
        )

    def __str__(self):
        return (
            f"Sala {self.sala} | "
            f"{self.start_datetime} - "
            f"{self.end_datetime}"
        )



    