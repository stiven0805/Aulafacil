from django.core.exceptions import ValidationError
from django.db import models


class Sala(models.Model):

    TIPO_ESTUDIO = "estudio"
    TIPO_SALA = "sala"
    TIPO_CONFERENCIA = "conferencia"
    TIPO_AUDITORIO = "auditorio"

    TIPO_CHOICES = [
        (TIPO_ESTUDIO, "Aula de estudio"),
        (TIPO_SALA, "Sala"),
        (TIPO_CONFERENCIA, "Sala de conferencias"),
        (TIPO_AUDITORIO, "Auditorio"),
    ]

    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default=TIPO_SALA
    )

    capacidad = models.PositiveIntegerField(
        default=1
    )

    activa = models.BooleanField(
        default=True
    )

    def clean(self):
        max_capacidad = (
            10
            if self.tipo == self.TIPO_ESTUDIO
            else 30
        )

        if self.capacidad > max_capacidad:
            raise ValidationError(
                {
                    "capacidad": (
                        f"La capacidad máxima para este tipo de sala "
                        f"es de {max_capacidad} personas."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre
    