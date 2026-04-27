from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# 🔥 Endpoint raíz (para que no salga 404 en "/")
def home(request):
    return JsonResponse({
        "status": "ok",
        "message": "API AulaFacil funcionando"
    })

# 🔥 Health check
def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Backend funcionando correctamente"
    })

router = DefaultRouter()

urlpatterns = [
    # ✅ ROOT (ya no 404)
    path("", home),

    # ✅ Health
    path("api/health/", health_check, name="health_check"),

    # ✅ Apps
    path("api/", include("apps.salas.urls")),
    path("api/", include("apps.reservations.urls")),

    # ✅ Admin
    path("admin/", admin.site.urls),

    # ✅ Router (por si agregas viewsets después)
    path("api/", include(router.urls)),

    # ✅ JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]