from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        "sala",
        "user",
        "start_datetime",
        "end_datetime",
        "is_active",
    )
    list_filter = ("sala", "is_active")
    search_fields = ("user__email",)
    ordering = ("-start_datetime",)
