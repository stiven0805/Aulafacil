from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend funcionando correctamente"})

router = DefaultRouter()

urlpatterns = [
    path("api/health/", health_check, name="health_check"),
    path("api/", include("apps.reservations.urls")),
    path("api/", include("apps.salas.urls")),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
