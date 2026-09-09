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
from django.contrib.auth import get_user_model


class Reservation(models.Model):

    # =========================================================
    # RELACIÓN CON LA SALA
    # =========================================================

    # Sala que será utilizada durante la reserva.
    # Si una sala es eliminada, sus reservas también se eliminan.
    sala = models.ForeignKey(
        "salas.Sala",
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    # =========================================================
    # USUARIO RESPONSABLE
    # =========================================================

    # Usuario registrado que crea y es responsable
    # de la reserva.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    # =========================================================
    # ESTUDIANTES REGISTRADOS
    # =========================================================

    # Usuarios registrados que participarán en la reserva.
    #
    # Una reserva puede tener varios estudiantes y un usuario
    # puede participar en diferentes reservas.
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="attended_reservations",
        blank=True
    )

    # =========================================================
    # FECHA Y HORA
    # =========================================================

    # Fecha y hora en la que comienza la reserva.
    start_datetime = models.DateTimeField()

    # Fecha y hora en la que termina la reserva.
    end_datetime = models.DateTimeField()

    # =========================================================
    # ESTADO DE LA RESERVA
    # =========================================================

    # Indica si la reserva está activa.
    # Por defecto, una nueva reserva está activa.
    is_active = models.BooleanField(default=True)

    # Indica si ya se envió la notificación correspondiente.
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

    # =========================================================
    # INFORMACIÓN DE LA RESERVA
    # =========================================================

    # Facultad a la que pertenece el usuario
    # que realiza la reserva.
    faculty = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    # Cantidad TOTAL de personas que estarán en la sala.
    #
    # IMPORTANTE:
    # Incluye al usuario responsable de la reserva.
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
        # 2. VALIDAR LA DURACIÓN
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

        # La cantidad total de personas no puede superar
        # la capacidad máxima de la sala.
        if self.number_of_people > self.sala.capacidad:
            raise ValidationError(
                f"La sala tiene una capacidad máxima de "
                f"{self.sala.capacidad} personas."
            )

        # =====================================================
        # 7. VALIDAR RESERVAS SOLAPADAS
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

        # Ejecutamos las validaciones antes de guardar.
        self.full_clean()

        # Si todas las validaciones son correctas,
        # guardamos la reserva.
        super().save(*args, **kwargs)

    # =========================================================
    # CANCELAR LA RESERVA
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


# =============================================================
# ASISTENTES INVITADOS
# =============================================================

class GuestAttendee(models.Model):

    # Reserva a la que pertenece el invitado.
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name="guest_attendees"
    )

    # Nombre de la persona que no está registrada
    # como usuario en AulaFácil.
    name = models.CharField(
        max_length=150
    )

    # =========================================================
    # VALIDACIÓN
    # =========================================================

    def clean(self):

        # El nombre del invitado no puede estar vacío.
        if not self.name.strip():
            raise ValidationError(
                "El nombre del asistente invitado es obligatorio."
            )

        # No permitimos agregar un invitado cuyo nombre
        # ya esté registrado en la misma reserva.
        existing = GuestAttendee.objects.filter(
            reservation=self.reservation,
            name__iexact=self.name.strip()
        ).exclude(pk=self.pk)

        if existing.exists():
            raise ValidationError(
                "Este asistente invitado ya está registrado "
                "en la reserva."
            )

    def save(self, *args, **kwargs):

        # Ejecutamos las validaciones antes de guardar.
        self.full_clean()

        # Guardamos el invitado.
        super().save(*args, **kwargs)

    def __str__(self):

        # Los invitados se mostrarán como asistentes invitados.
        return f"{self.name} - Asistente invitado"


class UserProfile(models.Model):

    user = models.OneToOneField(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="profile"
    )

    faculty = models.CharField(
        max_length=120
    )

    def __str__(self):
        return f"{self.user.username} - {self.faculty}"
    