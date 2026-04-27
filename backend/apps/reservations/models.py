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
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["start_datetime"]
        indexes = [
            models.Index(fields=["sala", "start_datetime", "end_datetime"]),
        ]

    def clean(self):
        # 🔥 Duración exacta de 2 horas
        if self.end_datetime - self.start_datetime != timedelta(hours=2):
            raise ValidationError("La reserva debe durar exactamente 2 horas")

        # 🔥 No permitir pasado
        if self.start_datetime < timezone.now():
            raise ValidationError("No se puede reservar en el pasado")

        # 🔥 Validación de solapamiento
        overlapping = Reservation.objects.filter(
            sala=self.sala,
            is_active=True,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        ).exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("La sala ya está ocupada en ese horario")

    # 🔥 CLAVE: esto hace que DRF respete clean()
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def cancel(self):
        now = timezone.now()

        if not self.is_active:
            raise ValidationError("La reserva ya está cancelada")

        if now >= self.start_datetime:
            raise ValidationError(
                "No se puede cancelar una reserva que ya inició"
            )

        self.is_active = False
        self.cancelled_at = now
        self.save(update_fields=["is_active", "cancelled_at"])

    def __str__(self):
        return f"Sala {self.sala} | {self.start_datetime} - {self.end_datetime}"