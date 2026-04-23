from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Sala
from .serializers import SalaSerializer


class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [AllowAny]  # Temporalmente sin autenticación
