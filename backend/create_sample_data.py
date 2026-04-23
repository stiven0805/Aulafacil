#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from apps.salas.models import Sala

def create_sample_data():
    # Crear salas de ejemplo si no existen
    salas_data = [
        {"nombre": "Sala de Conferencias A", "descripcion": "Sala principal para conferencias"},
        {"nombre": "Sala de Reuniones B", "descripcion": "Sala pequeña para reuniones"},
        {"nombre": "Auditorio Principal", "descripcion": "Auditorio grande para eventos"},
    ]

    for sala_data in salas_data:
        Sala.objects.get_or_create(
            nombre=sala_data["nombre"],
            defaults={"descripcion": sala_data["descripcion"], "activa": True}
        )

    print("✅ Datos de ejemplo creados")

if __name__ == "__main__":
    create_sample_data()