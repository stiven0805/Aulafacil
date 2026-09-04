# Herramientas de Django REST Framework para crear
# y validar serializers.
from rest_framework import serializers

# Importamos el modelo de reservas y asistentes invitados.
from .models import Reservation, GuestAttendee

# Permite trabajar con la fecha y hora actual.
from django.utils import timezone

# Permite obtener el modelo de usuario configurado en Django.
from django.contrib.auth import get_user_model

# Importamos el modelo de salas.
from apps.salas.models import Sala


# Obtenemos el modelo de usuario activo del proyecto.
User = get_user_model()


# =========================================================
# SERIALIZER PARA ASISTENTES INVITADOS
# =========================================================

class GuestAttendeeSerializer(serializers.ModelSerializer):

    # El nombre del invitado es obligatorio.
    name = serializers.CharField(
        max_length=150,
        allow_blank=False
    )

    class Meta:

        model = GuestAttendee

        fields = [
            "id",
            "name",
        ]

        # El ID y la reserva son manejados por el backend.
        read_only_fields = [
            "id",
        ]

    def validate_name(self, value):

        # Eliminamos espacios al inicio y al final.
        name = value.strip()

        # Verificamos que realmente exista un nombre.
        if not name:
            raise serializers.ValidationError(
                "El nombre del asistente invitado "
                "no puede estar vacío."
            )

        return name


class ReservationSerializer(serializers.ModelSerializer):

    # =========================================================
    # INFORMACIÓN DE LA SALA
    # =========================================================

    # Permite seleccionar una sala utilizando su ID.
    # Solamente se pueden seleccionar salas activas.
    sala = serializers.PrimaryKeyRelatedField(
        queryset=Sala.objects.filter(activa=True)
    )

    # Nombre de la sala.
    # Es solamente de lectura.
    classroomName = serializers.CharField(
        source="sala.nombre",
        read_only=True
    )

    # =========================================================
    # USUARIO RESPONSABLE
    # =========================================================

    # ID del usuario que creó la reserva.
    userId = serializers.IntegerField(
        source="user.id",
        read_only=True
    )

    # Nombre del usuario responsable.
    userName = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    # =========================================================
    # ESTUDIANTES REGISTRADOS
    # =========================================================

    # Recibimos los IDs de los estudiantes registrados.
    #
    # Ejemplo:
    #
    # "attendees": [5, 8, 12]
    #
    # Estos usuarios deben existir en AulaFácil.
    attendees = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True),
        many=True,
        required=False
    )

    # =========================================================
    # INFORMACIÓN DE LOS PARTICIPANTES
    # =========================================================

    # Información completa de los participantes.
    #
    # Aquí podremos diferenciar entre:
    #
    # Estudiante
    # Asistente invitado
    attendeeDetails = serializers.SerializerMethodField(
        read_only=True
    )

    # =========================================================
    # ASISTENTES INVITADOS
    # =========================================================

    # Personas que NO tienen una cuenta registrada
    # en AulaFácil.
    #
    # Ejemplo:
    #
    # "guestAttendees": [
    #     {"name": "Carlos Pérez"},
    #     {"name": "María López"}
    # ]
    guestAttendees = GuestAttendeeSerializer(
        many=True,
        required=False,
        write_only=True
    )

    # =========================================================
    # INFORMACIÓN CALCULADA
    # =========================================================

    # Fecha de la reserva en formato YYYY-MM-DD.
    date = serializers.SerializerMethodField(
        read_only=True
    )

    # Hora de inicio en formato HH:MM.
    startTime = serializers.SerializerMethodField(
        read_only=True
    )

    # Hora de finalización en formato HH:MM.
    endTime = serializers.SerializerMethodField(
        read_only=True
    )

    # Duración de la reserva en horas.
    duration = serializers.SerializerMethodField(
        read_only=True
    )

    # Estado actual de la reserva.
    status = serializers.SerializerMethodField(
        read_only=True
    )

    # =========================================================
    # CANTIDAD DE PERSONAS
    # =========================================================

    # Cantidad TOTAL de personas.
    #
    # IMPORTANTE:
    # Incluye al usuario responsable.
    #
    # Ejemplo:
    #
    # 1 responsable
    # + 2 estudiantes
    # + 1 invitado
    # = 4 personas
    numberOfPeople = serializers.IntegerField(
        source="number_of_people"
    )

    # Facultad asociada a la reserva.
    faculty = serializers.CharField(
        allow_blank=True
    )

    # =========================================================
    # VALIDACIONES
    # =========================================================

    def validate(self, data):

        # Obtenemos la sala seleccionada.
        sala = data["sala"]

        # Obtenemos la cantidad total indicada.
        number_of_people = data.get(
            "number_of_people",
            1
        )

        # -----------------------------------------------------
        # ESTUDIANTES REGISTRADOS
        # -----------------------------------------------------

        # Obtenemos los estudiantes enviados.
        attendees = data.get(
            "attendees",
            []
        )

        # -----------------------------------------------------
        # INVITADOS
        # -----------------------------------------------------

        # Obtenemos los invitados enviados.
        guest_attendees = data.get(
            "guestAttendees",
            []
        )

        # -----------------------------------------------------
        # VALIDAR ESTUDIANTES DUPLICADOS
        # -----------------------------------------------------

        attendee_ids = [
            user.id
            for user in attendees
        ]

        if len(attendee_ids) != len(set(attendee_ids)):
            raise serializers.ValidationError({
                "attendees": (
                    "No se puede agregar el mismo estudiante "
                    "más de una vez."
                )
            })

        # -----------------------------------------------------
        # VALIDAR QUE SEAN ESTUDIANTES
        # -----------------------------------------------------

        for attendee in attendees:

            # En el sistema actual, todos los usuarios cuyo
            # username no contiene "admin" son considerados
            # estudiantes.
            if "admin" in attendee.username.lower():

                raise serializers.ValidationError({
                    "attendees": (
                        f"El usuario {attendee.username} "
                        "no puede registrarse como estudiante."
                    )
                })

        # -----------------------------------------------------
        # VALIDAR QUE EL RESPONSABLE NO SE REPITA
        # -----------------------------------------------------

        # Obtenemos el usuario autenticado.
        request = self.context.get("request")

        if request and request.user.is_authenticated:

            # El responsable ya cuenta como una persona.
            if request.user.id in attendee_ids:

                raise serializers.ValidationError({
                    "attendees": (
                        "El responsable de la reserva "
                        "no debe agregarse nuevamente "
                        "como estudiante."
                    )
                })

        # -----------------------------------------------------
        # VALIDAR INVITADOS DUPLICADOS
        # -----------------------------------------------------

        guest_names = []

        for guest in guest_attendees:

            # Obtenemos el nombre ya validado por
            # GuestAttendeeSerializer.
            name = guest["name"].strip()

            # Utilizamos minúsculas para comparar
            # sin importar mayúsculas o minúsculas.
            normalized_name = name.lower()

            if normalized_name in guest_names:

                raise serializers.ValidationError({
                    "guestAttendees": (
                        f"El asistente invitado "
                        f"'{name}' está repetido."
                    )
                })

            guest_names.append(normalized_name)

        # -----------------------------------------------------
        # VALIDAR ESTUDIANTE CONTRA INVITADO
        # -----------------------------------------------------

        # No tiene mucho sentido registrar a una persona
        # como estudiante y además como invitado con el mismo
        # nombre.
        #
        # Esta validación se hace únicamente por nombre,
        # ya que el invitado no tiene una cuenta registrada.
        attendee_names = []

        for attendee in attendees:

            name = (
                attendee.get_full_name()
                or attendee.first_name
                or attendee.username
            )

            attendee_names.append(
                name.strip().lower()
            )

        for guest in guest_attendees:

            guest_name = guest["name"].strip().lower()

            if guest_name in attendee_names:

                raise serializers.ValidationError({
                    "guestAttendees": (
                        f"El asistente invitado "
                        f"'{guest['name']}' ya aparece "
                        "como estudiante registrado."
                    )
                })

        # -----------------------------------------------------
        # CALCULAR TOTAL DE PERSONAS
        # -----------------------------------------------------

        # El responsable cuenta como una persona.
        #
        # Por lo tanto:
        #
        # total =
        # responsable
        # + estudiantes
        # + invitados
        total_people = (
            1
            + len(attendees)
            + len(guest_attendees)
        )

        # -----------------------------------------------------
        # COMPROBAR NUMBER_OF_PEOPLE
        # -----------------------------------------------------

        # El número indicado debe coincidir exactamente
        # con la cantidad de participantes.
        if number_of_people != total_people:

            raise serializers.ValidationError({
                "numberOfPeople": (
                    "La cantidad de personas debe coincidir "
                    "con el usuario responsable, los estudiantes "
                    "y los asistentes invitados."
                )
            })

        # -----------------------------------------------------
        # VALIDAR CAPACIDAD
        # -----------------------------------------------------

        # El total de personas no puede superar
        # la capacidad máxima de la sala.
        if total_people > sala.capacidad:

            raise serializers.ValidationError({
                "numberOfPeople": (
                    f"La sala tiene una capacidad máxima de "
                    f"{sala.capacidad} personas."
                )
            })

        return data

    # =========================================================
    # CREAR RESERVA
    # =========================================================

    def create(self, validated_data):

        # Sacamos los estudiantes antes de crear la reserva,
        # porque la relación ManyToMany se guarda después.
        attendees = validated_data.pop(
            "attendees",
            []
        )

        # Sacamos los invitados antes de crear la reserva.
        guest_attendees = validated_data.pop(
            "guestAttendees",
            []
        )

        # IMPORTANTE:
        #
        # El usuario responsable llega desde:
        #
        # ReservationViewSet.perform_create()
        #
        # mediante:
        #
        # serializer.save(user=self.request.user)
        #
        # Por eso NO agregamos user manualmente aquí.
        reservation = Reservation.objects.create(
            **validated_data
        )

        # -----------------------------------------------------
        # GUARDAR ESTUDIANTES
        # -----------------------------------------------------

        # Asociamos los estudiantes registrados
        # con la reserva.
        reservation.attendees.set(attendees)

        # -----------------------------------------------------
        # GUARDAR INVITADOS
        # -----------------------------------------------------

        # Creamos cada asistente invitado.
        for guest in guest_attendees:

            GuestAttendee.objects.create(
                reservation=reservation,
                name=guest["name"].strip()
            )

        return reservation

    # =========================================================
    # ACTUALIZAR RESERVA
    # =========================================================

    def update(self, instance, validated_data):

        # Obtenemos los estudiantes solamente si fueron
        # enviados en la actualización.
        attendees_provided = "attendees" in validated_data

        attendees = validated_data.pop(
            "attendees",
            None
        )

        # Obtenemos los invitados solamente si fueron
        # enviados en la actualización.
        guests_provided = "guestAttendees" in validated_data

        guest_attendees = validated_data.pop(
            "guestAttendees",
            None
        )

        # Actualizamos los campos normales de la reserva.
        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        # Guardamos los cambios.
        instance.save()

        # -----------------------------------------------------
        # ACTUALIZAR ESTUDIANTES
        # -----------------------------------------------------

        if attendees_provided:

            instance.attendees.set(
                attendees or []
            )

        # -----------------------------------------------------
        # ACTUALIZAR INVITADOS
        # -----------------------------------------------------

        if guests_provided:

            # Eliminamos los invitados anteriores.
            instance.guest_attendees.all().delete()

            # Creamos los nuevos invitados.
            for guest in guest_attendees or []:

                GuestAttendee.objects.create(
                    reservation=instance,
                    name=guest["name"].strip()
                )

        return instance

    # =========================================================
    # MOSTRAR PARTICIPANTES
    # =========================================================

    def get_attendeeDetails(self, obj):

        participants = []

        # -----------------------------------------------------
        # ESTUDIANTES REGISTRADOS
        # -----------------------------------------------------

        for user in obj.attendees.all():

            participants.append({
                "id": user.id,
                "name": (
                    user.get_full_name()
                    or user.first_name
                    or user.username
                ),
                "email": user.email,
                "type": "student",
                "label": "Estudiante"
            })

        # -----------------------------------------------------
        # ASISTENTES INVITADOS
        # -----------------------------------------------------

        for guest in obj.guest_attendees.all():

            participants.append({
                "id": guest.id,
                "name": guest.name,
                "email": None,
                "type": "guest",
                "label": "Asistente invitado"
            })

        return participants

    # =========================================================
    # FECHA
    # =========================================================

    def get_date(self, obj):

        # Devuelve solamente la fecha de inicio.
        return obj.start_datetime.date().isoformat()

    # =========================================================
    # HORA DE INICIO
    # =========================================================

    def get_startTime(self, obj):

        # Devuelve la hora de inicio en formato HH:MM.
        return obj.start_datetime.strftime("%H:%M")

    # =========================================================
    # HORA DE FINALIZACIÓN
    # =========================================================

    def get_endTime(self, obj):

        # Devuelve la hora de finalización en formato HH:MM.
        return obj.end_datetime.strftime("%H:%M")

    # =========================================================
    # DURACIÓN
    # =========================================================

    def get_duration(self, obj):

        # Calculamos la duración en horas.
        return int(
            (
                obj.end_datetime
                - obj.start_datetime
            ).total_seconds() / 3600
        )

    # =========================================================
    # ESTADO
    # =========================================================

    def get_status(self, obj):

        # Si la reserva fue cancelada.
        if not obj.is_active:
            return "cancelled"

        # Si la reserva ya terminó.
        if obj.end_datetime < timezone.now():
            return "completed"

        # Si la reserva sigue activa.
        return "active"

    # =========================================================
    # CONFIGURACIÓN DEL SERIALIZER
    # =========================================================

    class Meta:

        model = Reservation

        fields = [
            # Identificación.
            "id",

            # Sala.
            "sala",
            "classroomName",

            # Responsable.
            "userId",
            "userName",

            # Estudiantes registrados.
            "attendees",

            # Información completa de participantes.
            "attendeeDetails",

            # Invitados.
            "guestAttendees",

            # Información de la reserva.
            "faculty",
            "numberOfPeople",

            # Información calculada.
            "date",
            "startTime",
            "endTime",
            "duration",
            "status",

            # Fechas y estado.
            "created_at",
            "cancelled_at",
            "is_active",
            "notified",

            # Fechas originales.
            "start_datetime",
            "end_datetime",
        ]

        # Estos campos solamente los genera el backend.
        read_only_fields = [
            "created_at",
            "cancelled_at",
            "is_active",
            "notified",
            "attendeeDetails",
        ]
        