import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.local')
django.setup()

from apps.salas.models import Sala

# Crear 4 aulas
aulas = [
    {'nombre': 'Aula 1', 'descripcion': 'Aula de clase 1'},
    {'nombre': 'Aula 2', 'descripcion': 'Aula de clase 2'},
    {'nombre': 'Aula 3', 'descripcion': 'Aula de clase 3'},
    {'nombre': 'Aula 4', 'descripcion': 'Aula de clase 4'},
]

for aula_data in aulas:
    sala, created = Sala.objects.get_or_create(
        nombre=aula_data['nombre'],
        defaults={'descripcion': aula_data['descripcion'], 'activa': True}
    )
    if created:
        print(f"[OK] Creada: {sala.nombre}")
    else:
        print(f"[--] Ya existe: {sala.nombre}")

print("\nAulas en la base de datos:")
for sala in Sala.objects.all():
    print(f"  - {sala.nombre}: {sala.descripcion} (Activa: {sala.activa})")
