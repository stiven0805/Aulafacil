from django.db import models


class Sala(models.Model):
    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

