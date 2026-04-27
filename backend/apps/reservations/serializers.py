from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ("user", "created_at", "cancelled_at")

    def validate(self, data):
        """
        Ejecuta las validaciones del modelo (clean)
        """
        instance = Reservation(**data)

        # Si es update, mantener el mismo ID
        if self.instance:
            instance.pk = self.instance.pk

        instance.clean()
        return data
