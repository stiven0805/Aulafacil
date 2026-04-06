from django.contrib import admin
from .models import Sala


@admin.register(Sala)
class SalaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "activa")
    list_filter = ("activa",)
    search_fields = ("nombre",)

