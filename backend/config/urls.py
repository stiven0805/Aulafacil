from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path("api/", include("apps.reservations.urls")),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
