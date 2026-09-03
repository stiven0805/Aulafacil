# Permite trabajar con intervalos de tiempo,
# por ejemplo, calcular la duración de una reserva.
from datetime import timedelta

# Permite acceder a la configuración de Django,
# incluyendo el modelo de usuario configurado en el proyecto.
from django.conf import settings

# Permite generar errores cuando una reserva
# no cumple las reglas establecidas.
from django.core.exceptions import ValidationError

# Contiene las herramientas para crear modelos
# y campos de la base de datos.
from django.db import models

# Permite obtener la fecha y hora actual
# respetando la configuración de zona horaria de Django.
from django.utils import timezone


class Reservation(models.Model):

    # Relación entre la reserva y la sala.
    # Si una sala es eliminada, sus reservas también se eliminan.
    # related_name permite acceder a las reservas desde una sala.
    sala = models.ForeignKey(
        "salas.Sala",
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    # Relación entre la reserva y el usuario que la realiza.
    # AUTH_USER_MODEL utiliza el modelo de usuario configurado
    # en el proyecto Django.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    # Fecha y hora en la que comienza la reserva.
    start_datetime = models.DateTimeField()

    # Fecha y hora en la que termina la reserva.
    end_datetime = models.DateTimeField()

    # Indica si la reserva está activa.
    # Por defecto, una nueva reserva está activa.
    is_active = models.BooleanField(default=True)

    # Permite controlar si ya se envió una notificación
    # relacionada con la reserva.
    notified = models.BooleanField(default=False)

    # Guarda automáticamente la fecha y hora
    # en la que se creó la reserva.
    created_at = models.DateTimeField(auto_now_add=True)

    # Guarda la fecha y hora en la que se canceló la reserva.
    # Puede quedar vacío mientras la reserva esté activa.
    cancelled_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # Facultad a la que pertenece el usuario
    # que realiza la reserva.
    faculty = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    # Cantidad de personas que utilizarán la sala.
    # PositiveSmallIntegerField no permite valores negativos.
    number_of_people = models.PositiveSmallIntegerField(
        default=1
    )

    class Meta:

        # Las reservas se ordenan por fecha y hora de inicio.
        ordering = ["start_datetime"]

        # Índice para hacer más eficientes las búsquedas
        # de reservas por sala y horario.
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

        # =====================================================
        # 1. VALIDAR QUE EL INICIO SEA ANTES DEL FINAL
        # =====================================================

        if self.start_datetime >= self.end_datetime:
            raise ValidationError(
                "La fecha/hora de fin debe ser posterior a la de inicio."
            )

        # =====================================================
        # 2. VALIDAR LA DURACIÓN DE LA RESERVA
        # =====================================================

        # Calculamos cuánto tiempo dura la reserva.
        duration = self.end_datetime - self.start_datetime

        # La reserva debe durar mínimo 1 hora
        # y máximo 4 horas.
        if duration < timedelta(hours=1) or duration > timedelta(hours=4):
            raise ValidationError(
                "La reserva debe durar entre 1 y 4 horas."
            )

        # =====================================================
        # 3. NO PERMITIR RESERVAS EN EL PASADO
        # =====================================================

        # Obtenemos la fecha y hora actual.
        now = timezone.now()

        if self.start_datetime < now:
            raise ValidationError(
                "No se puede reservar en el pasado."
            )

        # =====================================================
        # 4. MÁXIMO 14 DÍAS DE ANTICIPACIÓN
        # =====================================================

        # Calculamos la fecha máxima hasta la que
        # se puede realizar una reserva.
        max_reservation_date = now + timedelta(days=14)

        # Si la reserva está después de ese límite,
        # no permitimos realizarla todavía.
        if self.start_datetime > max_reservation_date:
            raise ValidationError(
                "Solo se pueden realizar reservas con máximo "
                "14 días de anticipación."
            )

        # =====================================================
        # 5. VALIDAR CANTIDAD MÍNIMA DE PERSONAS
        # =====================================================

        # Toda reserva debe tener al menos una persona.
        if self.number_of_people < 1:
            raise ValidationError(
                "La reserva debe tener al menos una persona."
            )

        # =====================================================
        # 6. VALIDAR CAPACIDAD DE LA SALA
        # =====================================================

        # Comparamos la cantidad de personas de la reserva
        # con la capacidad máxima de la sala.
        if self.number_of_people > self.sala.capacidad:
            raise ValidationError(
                f"La sala tiene una capacidad máxima de "
                f"{self.sala.capacidad} personas."
            )

        # =====================================================
        # 7. VALIDAR QUE NO EXISTAN RESERVAS SOLAPADAS
        # =====================================================

        # Buscamos reservas activas de la misma sala
        # cuyo horario se cruce con la nueva reserva.
        overlapping = Reservation.objects.filter(
            sala=self.sala,
            is_active=True,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        ).exclude(pk=self.pk)

        # Si existe una reserva que se cruza,
        # rechazamos la nueva reserva.
        if overlapping.exists():
            raise ValidationError(
                "La sala ya está ocupada en ese horario."
            )

    # =========================================================
    # GUARDAR LA RESERVA
    # =========================================================

    def save(self, *args, **kwargs):

        # Ejecutamos todas las validaciones de clean()
        # antes de guardar la reserva.
        self.full_clean()

        # Si todas las validaciones son correctas,
        # guardamos la reserva en la base de datos.
        super().save(*args, **kwargs)

    # =========================================================
    # CANCELAR UNA RESERVA
    # =========================================================

    def cancel(self):

        # Obtenemos la fecha y hora actual.
        now = timezone.now()

        # No permitimos cancelar una reserva
        # que ya había sido cancelada.
        if not self.is_active:
            raise ValidationError(
                "La reserva ya está cancelada."
            )

        # No permitimos cancelar una reserva
        # que ya comenzó.
        if now >= self.start_datetime:
            raise ValidationError(
                "No se puede cancelar una reserva que ya inició."
            )

        # Marcamos la reserva como inactiva.
        self.is_active = False

        # Guardamos el momento exacto de la cancelación.
        self.cancelled_at = now

        # Actualizamos únicamente los campos
        # relacionados con la cancelación.
        self.save(
            update_fields=[
                "is_active",
                "cancelled_at"
            ]
        )

    # =========================================================
    # REPRESENTACIÓN DE LA RESERVA
    # =========================================================

    def __str__(self):

        # Define cómo se mostrará una reserva
        # cuando Django la represente como texto.
        return (
            f"Sala {self.sala} | "
            f"{self.start_datetime} - {self.end_datetime}"
        )
    {}
